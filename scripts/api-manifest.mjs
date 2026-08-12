import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const root = resolve(import.meta.dirname, '..')
const packageJson = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'))
const registry = readFileSync(resolve(root, 'src/components.js'), 'utf8')
const declarations = readFileSync(resolve(root, 'src/index.d.ts'), 'utf8')
const components = [...registry.matchAll(/export \{ default as (Ui\w+) \}/g)].map(([,name])=>name)

function declarationBody(name){
  const match=new RegExp(`export\\s+(?:interface|type)\\s+${name}\\b`).exec(declarations)
  if(!match)return null
  const brace=declarations.indexOf('{',match.index)
  if(brace<0)return null
  let depth=0,quote='',escaped=false
  for(let index=brace;index<declarations.length;index+=1){
    const character=declarations[index]
    if(quote){
      if(escaped)escaped=false
      else if(character==='\\')escaped=true
      else if(character===quote)quote=''
      continue
    }
    if(character==='\''||character==='"'||character==='`'){quote=character;continue}
    if(character==='{')depth+=1
    if(character==='}'&&--depth===0)return {header:declarations.slice(match.index,brace),body:declarations.slice(brace+1,index)}
  }
  return null
}
function topLevelMembers(body){
  const segments=[]
  let start=0,braces=0,parentheses=0,brackets=0,quote='',escaped=false
  for(let index=0;index<body.length;index+=1){
    const character=body[index]
    if(quote){
      if(escaped)escaped=false
      else if(character==='\\')escaped=true
      else if(character===quote)quote=''
      continue
    }
    if(character==='\''||character==='"'||character==='`'){quote=character;continue}
    if(character==='{')braces+=1;else if(character==='}')braces-=1
    else if(character==='(')parentheses+=1;else if(character===')')parentheses-=1
    else if(character==='[')brackets+=1;else if(character===']')brackets-=1
    if((character===';'||character==='\n')&&!braces&&!parentheses&&!brackets){segments.push(body.slice(start,index));start=index+1}
  }
  segments.push(body.slice(start))
  return segments.map(segment=>segment.trim()).filter(Boolean)
}
function declarationMembers(name,seen=new Set()){
  if(seen.has(name))return []
  seen.add(name)
  const declaration=declarationBody(name)
  if(!declaration)return []
  const base=declaration.header.match(/\bextends\s+([A-Za-z_$][\w$]*)/)?.[1]
  const own=topLevelMembers(declaration.body).map(segment=>{
    const dynamic=segment.match(/^\[\w+\s*:\s*`([^`]+)`\]/)?.[1]
    if(dynamic)return dynamic.replace(/\$\{[^}]+\}/g,'*')
    return segment.match(/^(?:'([^']+)'|"([^"]+)"|([A-Za-z_$][\w$]*))\??\s*:/)?.slice(1).find(Boolean)
  }).filter(Boolean)
  return [...new Set([...(base?declarationMembers(base,seen):[]),...own])].sort()
}
async function loadModule(file){
  const url=`${pathToFileURL(resolve(root,file)).href}?api-manifest=${Date.now()}-${Math.random()}`
  return import(url)
}
async function moduleExports(file){return Object.keys(await loadModule(file)).sort()}
function assertEqualMembers(name,kind,runtime,typed){
  const actual=[...runtime].sort(),declared=[...typed].sort()
  if(JSON.stringify(actual)!==JSON.stringify(declared))throw new Error(`${name} ${kind} parity failed: runtime=${actual.join(',')||'-'} types=${declared.join(',')||'-'}`)
}
function templateSlots(name){
  const source=readFileSync(resolve(root,`src/components/${name}.vue`),'utf8')
  const slots=[]
  let cursor=0
  while((cursor=source.indexOf('<slot',cursor))>=0){
    let end=cursor+5,quote='',escaped=false
    for(;end<source.length;end+=1){
      const character=source[end]
      if(quote){
        if(escaped)escaped=false
        else if(character==='\\')escaped=true
        else if(character===quote)quote=''
        continue
      }
      if(character==='\''||character==='"'){quote=character;continue}
      if(character==='>')break
    }
    const tag=source.slice(cursor,end+1)
    const dynamic=tag.match(/:name="`([^`]+)`"/)?.[1]
    const literal=tag.match(/(?<!:)\bname="([^"]+)"/)?.[1]
    slots.push(dynamic?dynamic.replace(/\$\{[^}]+\}/g,'*'):literal||'default')
    cursor=end+1
  }
  return [...new Set(slots)].sort()
}

const componentEntries=[]
for(const name of components){
  const module=await loadModule(`dist-lib/components/${name}.js`)
  const runtimeExports=Object.keys(module).sort()
  const props=declarationMembers(`${name}Props`)
  const emits=declarationMembers(`${name}Emits`)
  const slots=declarationMembers(`${name}Slots`)
  if(!declarations.includes(`${name}:LanComponent<${name}Props,${name}Emits,${name}Slots>`))throw new Error(`Missing typed component contract: ${name}`)
  assertEqualMembers(name,'Props',Object.keys(module.default.props||{}),props)
  assertEqualMembers(name,'Emits',Array.isArray(module.default.emits)?module.default.emits:Object.keys(module.default.emits||{}),emits)
  assertEqualMembers(name,'Slots',templateSlots(name),slots)
  componentEntries.push({
    name,
    subpath:`./components/${name}`,
    propsType:`${name}Props`,
    props,
    emitsType:`${name}Emits`,
    emits,
    slotsType:`${name}Slots`,
    slots,
    runtimeExports,
  })
}

const typeExports=[...declarations.matchAll(/export (?:interface|type|const|function)\s+([A-Za-z_$][\w$]*)/g)]
  .map(([,name])=>name).filter((name,index,list)=>list.indexOf(name)===index).sort()
const manifest={
  schemaVersion:2,
  package:packageJson.name,
  version:packageJson.version,
  moduleFormat:'esm',
  root:{runtimeExports:await moduleExports('dist-lib/lan-ui.js'),typeExports},
  publicSubpaths:Object.keys(packageJson.exports || {}).sort(),
  packageExports:packageJson.exports,
  typeFallbacks:packageJson.typesVersions,
  utilitySubpaths:{
    config:await moduleExports('dist-lib/config.js'),
    feedback:await moduleExports('dist-lib/feedback.js'),
    icons:await moduleExports('dist-lib/icons.js'),
    plugin:await moduleExports('dist-lib/plugin.js'),
  },
  components:componentEntries,
}
const output=JSON.stringify(manifest,null,2)+'\n'
const target=resolve(root,'api-manifest.json')

if(process.argv.includes('--write')){
  writeFileSync(target,output,'utf8')
  console.log(`API_MANIFEST WRITE components=${components.length} root=${manifest.root.runtimeExports.length} subpaths=${manifest.publicSubpaths.length} contracts=props+emits+slots`)
}else{
  const current=readFileSync(target,'utf8').replace(/\r\n?/g,'\n')
  if(current!==output){
    console.error('API_MANIFEST FAIL generated output differs; run pnpm run api:generate and review the SemVer impact')
    process.exit(1)
  }
  for(const component of componentEntries){
    if(component.runtimeExports.length!==2||!component.runtimeExports.includes('default')||!component.runtimeExports.includes(component.name))throw new Error(`Runtime export parity failed: ${component.name}`)
    if(!typeExports.includes(component.propsType))throw new Error(`Missing public Props type: ${component.propsType}`)
  }
  console.log(`API_MANIFEST PASS components=${components.length} root=${manifest.root.runtimeExports.length} subpaths=${manifest.publicSubpaths.length} parity=runtime+types+props+emits+slots`)
}
