import { mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { transform } from 'lightningcss'
import postcss from 'postcss'

const root=resolve(import.meta.dirname,'..')
const source=readFileSync(resolve(root,'styles.css'),'utf8').replace(/\r\n?/g,'\n')
const tokens=readFileSync(resolve(root,'tokens.css'),'utf8').replace(/\r\n?/g,'\n')
const packageJson=JSON.parse(readFileSync(resolve(root,'package.json'),'utf8'))
const registry=readFileSync(resolve(root,'src/components.js'),'utf8')
const records=[...registry.matchAll(/export \{ default as (Ui\w+) \} from '(.+)'/g)].map(([,name,file])=>({name,file:resolve(root,'src',file)}))
const sourceRoot=postcss.parse(source,{from:resolve(root,'styles.css')})
const layers=sourceRoot.nodes.filter(node=>node.type==='atrule'&&node.name==='layer'&&node.params.trim()==='lan-ui')
const layer=layers[0]
if(!layer)throw new Error('Missing @layer lan-ui in styles.css')

const outputDir=resolve(root,'dist-lib/styles')
rmSync(outputDir,{recursive:true,force:true})
mkdirSync(outputDir,{recursive:true})

const classCache=new Map()
const coreClasses=new Set(['icon','icon-sm','icon-lg','muted','subtle','text-brand','text-success','text-danger','hide','sr-only'])
function ownClasses(file){
  if(classCache.has(file))return classCache.get(file)
  const code=readFileSync(file,'utf8')
  const classes=new Set()
  for(const match of code.matchAll(/\bclass="([^"]+)"/g))for(const token of match[1].split(/\s+/))if(/^[a-z][\w-]*$/i.test(token)&&!coreClasses.has(token))classes.add(token)
  classCache.set(file,classes)
  return classes
}
function dependencies(file,seen=new Set()){
  if(seen.has(file))return new Set()
  seen.add(file)
  const code=readFileSync(file,'utf8')
  const classes=new Set(ownClasses(file))
  for(const match of code.matchAll(/import\s+\w+\s+from\s+'(\.\/[^']+\.vue)'/g)){
    const dependency=resolve(file,'..',match[1])
    for(const token of dependencies(dependency,seen))classes.add(token)
  }
  return classes
}
function classMatches(candidate,classes){
  for(const token of classes)if(candidate===token||candidate.startsWith(`${token}-`))return true
  return false
}
function selectorMatches(selector,classes){
  for(const match of selector.matchAll(/\.([_a-zA-Z][\w-]*)/g))if(classMatches(match[1],classes))return true
  return false
}
function startsAtComponentBoundary(selector,classes){
  const first=[...selector.matchAll(/([.#])([_a-zA-Z][\w-]*)/g)][0]
  return !first||first[1]==='.'&&classMatches(first[2],classes)
}
function splitSelectors(selector){
  const result=[]
  let start=0
  let parentheses=0
  let brackets=0
  let quote=''
  let escaped=false
  for(let index=0;index<selector.length;index+=1){
    const character=selector[index]
    if(escaped){escaped=false;continue}
    if(character==='\\'){escaped=true;continue}
    if(quote){if(character===quote)quote='';continue}
    if(character==='"'||character==="'"){quote=character;continue}
    if(character==='(')parentheses+=1
    else if(character===')')parentheses=Math.max(0,parentheses-1)
    else if(character==='[')brackets+=1
    else if(character===']')brackets=Math.max(0,brackets-1)
    else if(character===','&&!parentheses&&!brackets){result.push(selector.slice(start,index).trim());start=index+1}
  }
  result.push(selector.slice(start).trim())
  return result.filter(Boolean)
}
function relevantChildren(container,classes){
  const result=[]
  for(const node of container.nodes||[]){
    if(node.type==='rule'){
      const selectors=splitSelectors(node.selector).filter(selector=>selectorMatches(selector,classes)&&startsAtComponentBoundary(selector,classes))
      if(selectors.length)result.push(node.clone({selector:selectors.join(',')}))
      continue
    }
    if(node.type==='atrule'&&node.name==='keyframes')continue
    if(node.type==='atrule'){
      const children=relevantChildren(node,classes)
      if(children.length){const clone=node.clone({nodes:[]});for(const child of children)clone.append(child);result.push(clone)}
    }
  }
  return result
}

function minifyCss(value,filename){
  const result=transform({filename,code:Buffer.from(value),minify:true,sourceMap:false})
  return result.code.toString('utf8').trim()+'\n'
}

const baseEnd=layer.nodes.findIndex(node=>node.type==='comment'&&node.text.trim()==='Shared surfaces')
if(baseEnd<0)throw new Error('Shared surfaces boundary not found')
const core=postcss.root()
for(const node of postcss.parse(tokens).nodes)core.append(node.clone())
const coreLayer=postcss.atRule({name:'layer',params:'lan-ui'})
for(const node of layer.nodes.slice(0,baseEnd))coreLayer.append(node.clone())
for(const sourceLayer of layers)for(const node of sourceLayer.nodes.filter(node=>node.type==='atrule'&&node.name==='keyframes'))coreLayer.append(node.clone())
core.append(coreLayer)
const coreOutput=minifyCss(core.toString(),resolve(outputDir,'core.css'))
writeFileSync(resolve(outputDir,'core.css'),coreOutput,'utf8')

const allClasses=new Set()
for(const record of records)for(const className of dependencies(record.file))allClasses.add(className)
const rootNodes=layers.flatMap(sourceLayer=>relevantChildren(sourceLayer,allClasses))
const libraryRoot=postcss.root()
for(const node of postcss.parse(tokens).nodes)libraryRoot.append(node.clone())
const libraryLayer=postcss.atRule({name:'layer',params:'lan-ui'})
for(const node of layer.nodes.slice(0,baseEnd))libraryLayer.append(node.clone())
for(const sourceLayer of layers)for(const node of sourceLayer.nodes.filter(node=>node.type==='atrule'&&node.name==='keyframes'))libraryLayer.append(node.clone())
for(const node of rootNodes)libraryLayer.append(node)
libraryRoot.append(libraryLayer)
const rootOutput=minifyCss(libraryRoot.toString(),resolve(root,'dist-lib/lan-ui.css'))
writeFileSync(resolve(root,'dist-lib/lan-ui.css'),rootOutput,'utf8')

const manifest={schemaVersion:2,package:packageJson.name,version:packageJson.version,root:{subpath:'./style.css',bytes:Buffer.byteLength(rootOutput),rules:rootNodes.length,source:'component-union'},core:{subpath:'./styles/core.css',bytes:Buffer.byteLength(coreOutput)},components:[]}
for(const record of records){
  const classes=dependencies(record.file)
  const nodes=layers.flatMap(sourceLayer=>relevantChildren(sourceLayer,classes))
  if(!nodes.length)throw new Error(`No component styles selected for ${record.name}`)
  const componentRoot=postcss.root({nodes:[postcss.atRule({name:'import',params:"'./core.css'"})]})
  const componentLayer=postcss.atRule({name:'layer',params:'lan-ui'})
  for(const node of nodes)componentLayer.append(node)
  componentRoot.append(componentLayer)
  const file=resolve(outputDir,`${record.name}.css`)
  const output=minifyCss(componentRoot.toString(),file)
  writeFileSync(file,output,'utf8')
  manifest.components.push({name:record.name,subpath:`./styles/${record.name}.css`,bytes:statSync(file).size,rules:nodes.length})
}
manifest.components.sort((a,b)=>a.name===b.name?0:a.name<b.name?-1:1)
const manifestOutput=JSON.stringify(manifest,null,2)+'\n'
writeFileSync(resolve(outputDir,'manifest.json'),manifestOutput,'utf8')
const publicManifest=resolve(root,'style-manifest.json')
if(process.argv.includes('--write')){
  writeFileSync(publicManifest,manifestOutput,'utf8')
  console.log(`STYLE_SPLIT WRITE components=${records.length} root=${manifest.root.bytes}B core=${manifest.core.bytes}B total=${manifest.components.reduce((sum,item)=>sum+item.bytes,0)}B`)
}else{
  const current=readFileSync(publicManifest,'utf8').replace(/\r\n?/g,'\n')
  if(current!==manifestOutput)throw new Error('Style manifest differs; run pnpm run styles:generate and review the package impact')
  console.log(`STYLE_SPLIT PASS components=${records.length} root=${manifest.root.bytes}B core=${manifest.core.bytes}B max=${Math.max(...manifest.components.map(item=>item.bytes))}B`)
}
