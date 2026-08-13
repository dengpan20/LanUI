import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { extname, join, relative, resolve } from 'node:path'
import { gzipSync } from 'node:zlib'

const root = resolve(import.meta.dirname, '..')
const config = JSON.parse(readFileSync(resolve(root, 'performance-budgets.json'), 'utf8'))
const reportDir = resolve(root, '.verify/performance')
mkdirSync(reportDir, { recursive: true })

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const target = join(directory, entry.name)
    return entry.isDirectory() ? walk(target) : [target]
  })
}

function rows(directory, predicate) {
  return walk(directory).filter(predicate).map(file => {
    const data = readFileSync(file)
    return { file: relative(root, file).replaceAll('\\', '/'), raw: data.length, gzip: gzipSync(data, { level: 9 }).length }
  })
}

function sum(items, field) { return items.reduce((total, item) => total + item[field], 0) }
function largest(items, field) { return items.reduce((best, item) => !best || item[field] > best[field] ? item : best, null) }

function moduleClosure(entry, seen = new Set()) {
  const file = resolve(entry)
  if (seen.has(file)) return seen
  seen.add(file)
  const source = readFileSync(file, 'utf8')
  const imports = source.matchAll(/(?:from|import)\s*["'](\.\.?\/[^"']+\.js)["']/g)
  for (const match of imports) moduleClosure(resolve(file, '..', match[1]), seen)
  return seen
}

const dist = resolve(root, 'dist-lib')
const packageJs = rows(dist, file => extname(file) === '.js')
const packageCss = rows(dist, file => extname(file) === '.css')
const chunks = packageJs.filter(item => item.file.includes('/chunks/'))
const componentCss = packageCss.filter(item => /\/styles\/Ui[^/]+\.css$/.test(item.file))
const subpathAssets = rows(resolve(root, '.verify/subpath-consumer-dist/assets'), file => ['.js', '.css'].includes(extname(file)))
const exampleAssets = rows(resolve(root, 'examples/standalone-vue/dist/assets'), file => ['.js', '.css'].includes(extname(file)))
const rootCssData = readFileSync(resolve(dist, 'lan-ui.css'))
const themeSubpath = [...moduleClosure(resolve(dist, 'theme.js'))].map(file => {
  const data = readFileSync(file)
  return { file: relative(root, file).replaceAll('\\', '/'), raw: data.length, gzip: gzipSync(data, { level: 9 }).length }
})
const motionSubpath = [...moduleClosure(resolve(dist, 'motion.js'))].map(file => {
  const data = readFileSync(file)
  return { file: relative(root, file).replaceAll('\\', '/'), raw: data.length, gzip: gzipSync(data, { level: 9 }).length }
})

const largestChunkRaw = largest(chunks, 'raw')
const largestChunkGzip = largest(chunks, 'gzip')
const largestComponentCssRaw = largest(componentCss, 'raw')
const largestComponentCssGzip = largest(componentCss, 'gzip')
const metrics = {
  packageJsRaw: sum(packageJs, 'raw'),
  packageJsGzip: sum(packageJs, 'gzip'),
  packageCssRaw: sum(packageCss, 'raw'),
  packageCssGzip: sum(packageCss, 'gzip'),
  largestChunkRaw: largestChunkRaw.raw,
  largestChunkGzip: largestChunkGzip.gzip,
  rootCssRaw: rootCssData.length,
  rootCssGzip: gzipSync(rootCssData, { level: 9 }).length,
  largestComponentCssRaw: largestComponentCssRaw.raw,
  largestComponentCssGzip: largestComponentCssGzip.gzip,
  subpathConsumerJsRaw: sum(subpathAssets.filter(item => item.file.endsWith('.js')), 'raw'),
  subpathConsumerCssRaw: sum(subpathAssets.filter(item => item.file.endsWith('.css')), 'raw'),
  standaloneExampleJsRaw: sum(exampleAssets.filter(item => item.file.endsWith('.js')), 'raw'),
  standaloneExampleCssRaw: sum(exampleAssets.filter(item => item.file.endsWith('.css')), 'raw'),
  themeSubpathJsRaw: sum(themeSubpath, 'raw'),
  themeSubpathJsGzip: sum(themeSubpath, 'gzip'),
  motionSubpathJsRaw: sum(motionSubpath, 'raw'),
  motionSubpathJsGzip: sum(motionSubpath, 'gzip'),
}

const details = {
  largestChunkRaw: largestChunkRaw.file,
  largestChunkGzip: largestChunkGzip.file,
  largestComponentCssRaw: largestComponentCssRaw.file,
  largestComponentCssGzip: largestComponentCssGzip.file,
  themeSubpathJsRaw: themeSubpath.map(item => item.file).join(','),
  themeSubpathJsGzip: themeSubpath.map(item => item.file).join(','),
  motionSubpathJsRaw: motionSubpath.map(item => item.file).join(','),
  motionSubpathJsGzip: motionSubpath.map(item => item.file).join(','),
}
const failures = []
for (const [name, budget] of Object.entries(config.budgets)) {
  const actual = metrics[name]
  if (!Number.isFinite(actual)) failures.push(`${name}: missing metric`)
  else if (actual > budget) failures.push(`${name}: ${actual}B > ${budget}B`)
  else console.log(`PERFORMANCE PASS metric=${name} actual=${actual}B budget=${budget}B headroom=${budget - actual}B${details[name] ? ` file=${details[name]}` : ''}`)
}

const releaseBaseline=config.releaseBaseline
const comparison={}
if(releaseBaseline?.metrics){
  const currentComponentCount=(readFileSync(resolve(root,'src/components.js'),'utf8').match(/default as Ui/g)||[]).length
  const baselineComponentCount=Number(releaseBaseline.componentCount)||currentComponentCount
  const addedComponents=Math.max(0,currentComponentCount-baselineComponentCount)
  for(const [name,previous] of Object.entries(releaseBaseline.metrics)){
    const actual=metrics[name]
    const saved=previous-actual
    const tolerance=releaseBaseline.tolerance?.[name]||0
    const perComponentAllowance=releaseBaseline.perComponentAllowance?.[name]||0
    const allowance=addedComponents*perComponentAllowance
    const limit=Math.floor(previous*(1+tolerance))+allowance
    comparison[name]={previous,actual,saved,ratio:Number((saved/previous).toFixed(6)),tolerance,perComponentAllowance,addedComponents,allowance,limit}
    if(!Number.isFinite(actual))failures.push(`${name}: missing release comparison metric`)
    else if(actual>limit)failures.push(`${name}: ${actual}B exceeded ${releaseBaseline.version} guard ${limit}B`)
  }
  if(!failures.length)console.log(`PERFORMANCE_DELTA PASS baseline=${releaseBaseline.version} guarded=${Object.keys(comparison).length}/${Object.keys(releaseBaseline.metrics).length} components=${currentComponentCount}/${baselineComponentCount} additiveGzip=${comparison.packageJsGzip.allowance}B packageJs=${comparison.packageJsRaw.saved}B packageCss=${comparison.packageCssRaw.saved}B subpathJs=${comparison.subpathConsumerJsRaw.saved}B`)
}

const report = { schemaVersion: config.schemaVersion, version: config.version, platform: process.platform, metrics, budgets: config.budgets, details, releaseBaseline, comparison, failures }
writeFileSync(resolve(reportDir, 'report.json'), JSON.stringify(report, null, 2) + '\n', 'utf8')
if (failures.length) {
  for (const failure of failures) console.error(`PERFORMANCE FAIL ${failure}`)
  process.exitCode = 1
} else {
  console.log(`PERFORMANCE_REGRESSION PASS metrics=${Object.keys(metrics).length} js=${metrics.packageJsRaw}B/${metrics.packageJsGzip}B css=${metrics.packageCssRaw}B/${metrics.packageCssGzip}B`)
}
