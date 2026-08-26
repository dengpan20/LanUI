import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { extname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { minifySync, parseAst } from 'vite'

const root=resolve(import.meta.dirname,'..')
const output=resolve(root,'dist-lib')
function walk(directory){
  return readdirSync(directory,{withFileTypes:true}).flatMap(entry=>{
    const target=join(directory,entry.name)
    return entry.isDirectory()?walk(target):[target]
  })
}
const HAS_OWN='Object.prototype.hasOwnProperty.call'
const STABLE_EXPRESSIONS=[
  'Array.isArray','Object.entries','Object.keys','Array.from','Object.defineProperty','Object.assign',
  'Object.setPrototypeOf','Object.getPrototypeOf','Object.fromEntries','Object.freeze','Object.create','Math.trunc',
  HAS_OWN,
]
function memberRanges(code,expression){
  const ranges=[]
  const visit=(node,parent=null)=>{
    if(!node||typeof node!=='object')return
    if(node.type==='MemberExpression'&&code.slice(node.start,node.end)===expression){
      const receiverSafe=expression!==HAS_OWN||(parent?.type==='CallExpression'&&parent.callee===node)
      if(receiverSafe)ranges.push({start:node.start,end:node.end})
    }
    for(const [key,value] of Object.entries(node)){
      if(key==='start'||key==='end'||key==='raw'||key==='loc')continue
      if(Array.isArray(value))for(const child of value)visit(child,node)
      else if(value&&typeof value==='object')visit(value,node)
    }
  }
  visit(parseAst(code))
  return ranges
}
export function poolStableGlobals(code){
  const declarations=[]
  let aliasIndex=0
  for(const expression of STABLE_EXPRESSIONS){
    const ranges=memberRanges(code,expression)
    if(ranges.length<3)continue
    let alias
    do alias=`$${aliasIndex.toString(36)}`; while(code.includes(alias)&&++aliasIndex)
    aliasIndex++
    const declaration=expression===HAS_OWN
      ? `const ${alias}=Function.call.bind(Object.prototype.hasOwnProperty)`
      : `const ${alias}=${expression}`
    declarations.push(declaration)
    for(const {start,end} of ranges.sort((left,right)=>right.start-left.start))code=code.slice(0,start)+alias+code.slice(end)
  }
  return declarations.length?`${declarations.join(';')};${code}`:code
}
function run(){
  const files=walk(output).filter(file=>extname(file)==='.js').sort()
  let before=0
  let after=0
  for(const file of files){
    const input=readFileSync(file,'utf8')
    before+=Buffer.byteLength(input)
    const result=minifySync(relative(root,file).replaceAll('\\','/'),input,{compress:true,mangle:true})
    if(result.errors?.length)throw new Error(`JavaScript minification failed for ${file}: ${result.errors.map(error=>error.message||error).join('; ')}`)
    // JavaScript does not require a terminal line break; omitting it across
    // generated entries preserves semantics while keeping the fixed raw-size
    // budget available for additive public components.
    // Pool only AST-confirmed member expressions. Strings, templates, regexps,
    // comments, and receiver-sensitive non-call references remain untouched.
    const code=poolStableGlobals(result.code.trim().replace(/;$/, ''))
    writeFileSync(file,code,'utf8')
    after+=statSync(file).size
  }
  if(!files.length||after>=before)throw new Error(`Library JavaScript was not reduced: ${before}B -> ${after}B`)
  console.log(`LIBRARY_JS_MINIFY PASS files=${files.length} before=${before}B after=${after}B saved=${before-after}B`)
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))run()
