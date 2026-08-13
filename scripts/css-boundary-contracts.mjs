import { readFileSync, readdirSync, statSync } from 'node:fs'
import { resolve } from 'node:path'

const root=resolve(import.meta.dirname,'..')
const manifest=JSON.parse(readFileSync(resolve(root,'style-manifest.json'),'utf8'))
const builtManifest=JSON.parse(readFileSync(resolve(root,'dist-lib/styles/manifest.json'),'utf8'))
const rootCssPath=resolve(root,'dist-lib/lan-ui.css')
const coreCssPath=resolve(root,'dist-lib/styles/core.css')
const rootCss=readFileSync(rootCssPath,'utf8')
const coreCss=readFileSync(coreCssPath,'utf8')
const componentFiles=readdirSync(resolve(root,'dist-lib/styles')).filter(name=>/^Ui\w+\.css$/.test(name))
const forbidden=['.app-shell','.sidebar','.preview-','.auth-page','.dashboard','.workbench','.gantt-','.ai-','.docs-layout','.page-container','.status-page-showcase','.config-demo','.intl-runtime','.showcase','.demo-','#status-page']
const required=['.btn-primary','.ui-input','.ui-select-trigger','.ui-table-wrap','.ui-modal-overlay','.ui-upload-dropzone','.ui-schema-form']

if(manifest.schemaVersion!==2||JSON.stringify(manifest)!==JSON.stringify(builtManifest))throw new Error('Style manifest v2 parity failed')
if(manifest.root?.subpath!=='./style.css'||manifest.root?.source!=='component-union'||manifest.root?.bytes!==statSync(rootCssPath).size||!manifest.root?.rules)throw new Error('Root component-union manifest is incomplete')
if(manifest.core?.bytes!==statSync(coreCssPath).size||!coreCss.includes(':root{')||!coreCss.includes('@layer lan-ui'))throw new Error('Core stylesheet contract failed')
if(componentFiles.length!==manifest.components.length||componentFiles.length!==71)throw new Error(`Component stylesheet count mismatch: ${componentFiles.length}`)
for(const marker of required)if(!rootCss.includes(marker))throw new Error(`Required component selector is missing from root CSS: ${marker}`)
for(const marker of forbidden){
  if(rootCss.includes(marker))throw new Error(`Showcase selector leaked into root CSS: ${marker}`)
  for(const file of componentFiles){
    const css=readFileSync(resolve(root,'dist-lib/styles',file),'utf8')
    if(css.includes(marker))throw new Error(`Showcase selector leaked into ${file}: ${marker}`)
  }
}
for(const item of manifest.components){
  const file=resolve(root,'dist-lib/styles',`${item.name}.css`)
  const css=readFileSync(file,'utf8')
  if(item.bytes!==statSync(file).size||!item.rules||!css.startsWith('@import "./core.css";'))throw new Error(`Component stylesheet contract failed: ${item.name}`)
}
const componentBytes=manifest.components.reduce((total,item)=>total+item.bytes,0)
console.log(`CSS_BOUNDARY PASS schema=2 components=${componentFiles.length} root=${manifest.root.bytes}B core=${manifest.core.bytes}B componentTotal=${componentBytes}B excluded=${forbidden.length}`)
