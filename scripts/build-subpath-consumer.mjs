import { readFileSync, readdirSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
import { build } from 'vite'

const root = resolve(import.meta.dirname, '..')
const fixture = resolve(root, 'tests/fixtures/subpath-consumer')
const outDir = resolve(root, '.verify/subpath-consumer-dist')

await build({
  configFile:false,
  root:fixture,
  logLevel:'error',
  build:{ outDir, emptyOutDir:true, minify:true },
})

const assets = resolve(outDir, 'assets')
const jsFile = readdirSync(assets).find(name => name.endsWith('.js'))
const cssFile = readdirSync(assets).find(name => name.endsWith('.css'))
if (!jsFile || !cssFile) throw new Error('Subpath consumer output is incomplete')
const js = readFileSync(resolve(assets, jsFile), 'utf8')
const css = readFileSync(resolve(assets, cssFile), 'utf8')
for (const forbidden of ['ui-table-wrap','ui-modal-overlay','UiDateRangePicker','ui-transfer']) {
  if (js.includes(forbidden)) throw new Error(`Unused component leaked into subpath bundle: ${forbidden}`)
}
if (!js.includes('btn-loading')) throw new Error('UiButton implementation is missing from consumer bundle')
for(const forbiddenLocale of ['Quick commands','Access denied','File upload','en-US'])if(js.includes(forbiddenLocale))throw new Error(`Unused English locale leaked into component subpath: ${forbiddenLocale}`)
if (!css.includes('.btn-primary')) throw new Error('UiButton component stylesheet is missing')
if (css.includes('.ui-table-wrap')) throw new Error('Unused table styles leaked into component stylesheet')
const jsBytes = statSync(resolve(assets, jsFile)).size
const cssBytes = statSync(resolve(assets, cssFile)).size
if(cssBytes>20000)throw new Error(`Component stylesheet budget exceeded: ${cssBytes}B`)
console.log(`SUBPATH_CONSUMER PASS entry=UiButton js=${jsBytes}B css=${cssBytes}B unused-components=absent unused-styles=absent unused-en-locale=absent`)
