import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { join, resolve, sep } from 'node:path'
import { build } from 'vite'
import { formatReleaseReport, validateRelease } from './release-contracts.mjs'

const root=resolve(import.meta.dirname,'..')
const sourceManifest=JSON.parse(readFileSync(join(root,'package.json'),'utf8'))
const verifyRoot=resolve(root,'.verify')
const workspace=resolve(verifyRoot,'packed-consumer-regression')
const packageRoot=join(workspace,'package')
const consumerRoot=join(workspace,'consumer')
const tarball=join(packageRoot,`${sourceManifest.name}-${sourceManifest.version}.tgz`)
const reproductionTarball=join(packageRoot,`${sourceManifest.name}-${sourceManifest.version}-reproduction.tgz`)
const extractedRoot=join(workspace,'extracted')
const distributionBudgets=JSON.parse(readFileSync(join(root,'performance-budgets.json'),'utf8')).distributionBudgets
const componentNames=JSON.parse(readFileSync(join(root,'api-manifest.json'),'utf8')).components.map(component=>component.name)

function assert(condition,message){if(!condition)throw new Error(message)}
function safeReset(target){
  const resolved=resolve(target)
  assert(resolved.startsWith(`${verifyRoot}${sep}`),`Unsafe verification target: ${resolved}`)
  if(existsSync(resolved))rmSync(resolved,{recursive:true,force:true})
  mkdirSync(resolved,{recursive:true})
}
function run(command,args,{cwd=root,env={}}={}){
  const result=spawnSync(command,args,{cwd,env:{...process.env,...env},encoding:'utf8',windowsHide:true})
  if(result.status!==0)throw new Error(`${command} ${args.join(' ')} failed (${result.status})\n${result.stdout||''}\n${result.stderr||''}`)
  return `${result.stdout||''}${result.stderr||''}`.trim()
}
function runPnpm(args,options={}){
  const pnpm=process.env.npm_execpath
  if(pnpm&&/pnpm/i.test(pnpm))return run(process.execPath,[pnpm,...args],options)
  return run(process.platform==='win32'?'pnpm.cmd':'pnpm',args,options)
}
function parsePackJson(output){
  const start=output.indexOf('{')
  const end=output.lastIndexOf('}')
  assert(start>=0&&end>start,`pnpm pack did not return JSON: ${output}`)
  const parsed=JSON.parse(output.slice(start,end+1))
  return Array.isArray(parsed)?parsed[0]:parsed
}
function collectFiles(folder){
  const result=[]
  for(const entry of readdirSync(folder,{withFileTypes:true})){
    const path=join(folder,entry.name)
    if(entry.isDirectory())result.push(...collectFiles(path))
    else result.push(path)
  }
  return result
}
function sha256(path){return createHash('sha256').update(readFileSync(path)).digest('hex')}

safeReset(workspace)
mkdirSync(packageRoot,{recursive:true})
mkdirSync(consumerRoot,{recursive:true})
mkdirSync(extractedRoot,{recursive:true})

const packOutput=runPnpm(['--config.ignore-scripts=true','pack','--out',tarball,'--json'])
const pack= parsePackJson(packOutput)
assert(existsSync(tarball),'Packed tarball was not written')
const packedFiles=new Set((pack.files||[]).map(file=>file.path.replaceAll('\\','/')))
const required=[
  'package.json','README.md','LICENSE','CHANGELOG.md','COMPONENT-API.md','api-manifest.json',
  'design-tokens.json','tokens.css','dist-lib/lan-ui.js','dist-lib/lan-ui.d.ts',
  'dist-lib/styles/core.css','dist-lib/styles/UiAnchor.css','dist-lib/styles/UiTour.css','dist-lib/components/UiAnchor.js','dist-lib/components/UiAnchor.d.ts','dist-lib/components/UiTour.js','dist-lib/components/UiTour.d.ts',
]
for(const path of required)assert(packedFiles.has(path),`Packed file missing: ${path}`)
for(const name of componentNames){
  for(const path of [`dist-lib/components/${name}.js`,`dist-lib/components/${name}.d.ts`,`dist-lib/styles/${name}.css`]){
    assert(packedFiles.has(path),`Packed component contract missing: ${path}`)
  }
}
const allowedTopLevel=new Set(['package.json','README.md','LICENSE','CHANGELOG.md','MIGRATION.md','COMPONENT-API.md','api-manifest.json','style-manifest.json','performance-budgets.json','design-tokens.json','tokens.css','public/component-api.json'])
for(const path of packedFiles)assert(path.startsWith('dist-lib/')||allowedTopLevel.has(path),`File is outside the package allow-list: ${path}`)

run('tar',['-xzf',tarball,'-C',extractedRoot])
const packedManifest=JSON.parse(readFileSync(join(extractedRoot,'package','package.json'),'utf8'))
assert(packedManifest.name===sourceManifest.name&&packedManifest.version===sourceManifest.version,'Packed identity mismatch')
assert(packedManifest.private===false,'Packed package must be publishable')
assert(packedManifest.license==='MIT','Packed package license mismatch')
assert(packedManifest.repository?.url==='git+https://github.com/dengpan20/LanUI.git','Packed repository metadata missing')
assert(packedManifest.publishConfig?.provenance===true,'Packed provenance metadata missing')
assert(packedManifest.exports?.['./tokens.css']==='./tokens.css','Token stylesheet export missing')

writeFileSync(join(consumerRoot,'package.json'),JSON.stringify({
  name:'lan-ui-packed-consumer',version:'1.0.0',private:true,type:'module',
  dependencies:{'lan-ui-design-system':`file:${tarball.replaceAll('\\','/')}`,vue:'3.5.41'},
},null,2)+'\n')
runPnpm(['install','--ignore-workspace','--lockfile-only','--ignore-scripts','--no-frozen-lockfile'],{cwd:consumerRoot})
runPnpm(['fetch','--ignore-workspace','--prod'],{cwd:consumerRoot})
runPnpm(['install','--ignore-workspace','--offline','--ignore-scripts','--frozen-lockfile'],{cwd:consumerRoot})

  writeFileSync(join(consumerRoot,'ssr.mjs'),`import { createSSRApp, h } from 'vue'\nimport { renderToString } from 'vue/server-renderer'\nimport { UiAnchor } from 'lan-ui-design-system'\nimport UiButton from 'lan-ui-design-system/components/UiButton'\nimport UiTour from 'lan-ui-design-system/components/UiTour'\nconst app=createSSRApp({render:()=>h('main',[h(UiAnchor,{items:[{title:'Overview',href:'#overview'}],affix:false}),h(UiButton,null,{default:()=> 'Packed action'}),h(UiTour,{modelValue:true,ariaLabel:'Packed tour',steps:[{title:'Packed onboarding',description:'SSR tour'}]})])})\nconst context={}\nconst html=await renderToString(app,context)\nif(!html.includes('ui-anchor')||!html.includes('Packed action')||!context.teleports?.body?.includes('Packed onboarding'))throw new Error('SSR output mismatch')\nconsole.log('PACKED_SSR PASS anchor=true button=true tour=true')\n`)
const ssrOutput=run(process.execPath,['ssr.mjs'],{cwd:consumerRoot})
assert(ssrOutput.includes('PACKED_SSR PASS'),'Packed SSR smoke test failed')

  writeFileSync(join(consumerRoot,'contracts.ts'),`import { UiAnchor, type UiAnchorItem, type UiAnchorProps, type UiTourStep } from 'lan-ui-design-system'\nimport UiButton, { type UiButtonProps } from 'lan-ui-design-system/components/UiButton'\nimport UiTour, { type UiTourProps } from 'lan-ui-design-system/components/UiTour'\nconst items:UiAnchorItem[]=[{title:'Overview',href:'#overview'}]\nconst anchorProps:UiAnchorProps={items,direction:'horizontal',affix:false}\nconst buttonProps:UiButtonProps={variant:'primary',size:'md'}\nconst tourSteps:UiTourStep[]=[{target:'#overview',title:'Overview'}]\nconst tourProps:UiTourProps={steps:tourSteps,placement:'bottom-start'}\nvoid [UiAnchor,UiButton,UiTour,anchorProps,buttonProps,tourProps]\n`)
writeFileSync(join(consumerRoot,'tsconfig.json'),JSON.stringify({compilerOptions:{
  target:'ES2022',module:'NodeNext',moduleResolution:'NodeNext',lib:['ES2022','DOM'],strict:true,
  skipLibCheck:false,noEmit:true,types:[],
},include:['contracts.ts']},null,2)+'\n')
run(process.execPath,[resolve(root,'node_modules/typescript/bin/tsc'),'--project','tsconfig.json','--pretty','false'],{cwd:consumerRoot})

writeFileSync(join(consumerRoot,'index.html'),'<div id="app"></div><script type="module" src="/main.js"></script>\n')
  writeFileSync(join(consumerRoot,'main.js'),`import { createApp, h } from 'vue'\nimport { UiAnchor } from 'lan-ui-design-system'\nimport UiButton from 'lan-ui-design-system/components/UiButton'\nimport UiTour from 'lan-ui-design-system/components/UiTour'\nimport 'lan-ui-design-system/tokens.css'\nimport 'lan-ui-design-system/styles/core.css'\nimport 'lan-ui-design-system/styles/UiAnchor.css'\nimport 'lan-ui-design-system/styles/UiButton.css'\nimport 'lan-ui-design-system/styles/UiTour.css'\ncreateApp({render:()=>h('main',[h(UiAnchor,{items:[{title:'Overview',href:'#overview'}],affix:false}),h(UiButton,{id:'overview'},()=> 'Packed action'),h(UiTour,{modelValue:false,steps:[{target:'#overview',title:'Packed tour'}]})])}).mount('#app')\n`)
await build({root:consumerRoot,configFile:false,logLevel:'silent',build:{outDir:'dist',emptyOutDir:true,minify:'oxc'}})
const builtFiles=collectFiles(join(consumerRoot,'dist'))
const builtJs=builtFiles.filter(path=>path.endsWith('.js')).map(path=>readFileSync(path,'utf8')).join('\n')
const builtCss=builtFiles.filter(path=>path.endsWith('.css')).map(path=>readFileSync(path,'utf8')).join('\n')
  assert(builtJs.includes('ui-anchor'),'Packed browser build omitted anchor runtime')
  assert(builtJs.includes('ui-tour'),'Packed browser build omitted tour runtime')
  assert(builtCss.includes('.ui-anchor'),'Packed browser build omitted anchor CSS')
  assert(builtCss.includes('.ui-tour-panel'),'Packed browser build omitted tour CSS')
assert(builtCss.includes('--brand-600'),'Packed browser build omitted token CSS')

const unpackedBytes=collectFiles(join(extractedRoot,'package')).reduce((sum,path)=>sum+statSync(path).size,0)
const tarballBytes=statSync(tarball).size
runPnpm(['--config.ignore-scripts=true','pack','--out',reproductionTarball,'--json'])
const digest=sha256(tarball)
assert(sha256(reproductionTarball)===digest,'Repeated package archives are not byte-for-byte reproducible')
assert(componentNames.length===71,'Public component count mismatch')
assert(packedFiles.size<=distributionBudgets.packedFiles,`Packed files ${packedFiles.size} exceed ${distributionBudgets.packedFiles}`)
assert(tarballBytes<=distributionBudgets.packedTarballRaw,`Packed tarball ${tarballBytes}B exceeds ${distributionBudgets.packedTarballRaw}B`)
assert(unpackedBytes<=distributionBudgets.packedUnpackedRaw,`Unpacked package ${unpackedBytes}B exceeds ${distributionBudgets.packedUnpackedRaw}B`)
const release=validateRelease({ref:`v${packedManifest.version}`,tag:true,artifact:tarball})
writeFileSync(join(workspace,'report.json'),JSON.stringify({schemaVersion:1,version:packedManifest.version,sha256:digest,metrics:{components:componentNames.length,packedFiles:packedFiles.size,packedTarballRaw:tarballBytes,packedUnpackedRaw:unpackedBytes},budgets:distributionBudgets,checks:{reproducible:true,allowList:true,resolution:'lockfile+fetch',install:'offline',root:true,subpath:true,css:true,types:true,ssr:true,internals:'absent',release:true},release},null,2)+'\n')
console.log(formatReleaseReport(release))
console.log(`PACKED_CONSUMER PASS version=${packedManifest.version} components=${componentNames.length} files=${packedFiles.size}/${distributionBudgets.packedFiles} tarball=${tarballBytes}B/${distributionBudgets.packedTarballRaw}B unpacked=${unpackedBytes}B/${distributionBudgets.packedUnpackedRaw}B sha256=${digest.slice(0,12)} reproducible=pass allowList=pass resolution=lockfile+fetch install=offline root=pass subpath=pass css=pass types=pass ssr=pass internals=absent release=pass`)
