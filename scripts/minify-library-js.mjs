import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { extname, join, relative, resolve } from 'node:path'
import { minifySync } from 'vite'

const root=resolve(import.meta.dirname,'..')
const output=resolve(root,'dist-lib')
function walk(directory){
  return readdirSync(directory,{withFileTypes:true}).flatMap(entry=>{
    const target=join(directory,entry.name)
    return entry.isDirectory()?walk(target):[target]
  })
}
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
  const code=result.code.trim().replace(/;$/, '')
  writeFileSync(file,code,'utf8')
  after+=statSync(file).size
}
if(!files.length||after>=before)throw new Error(`Library JavaScript was not reduced: ${before}B -> ${after}B`)
console.log(`LIBRARY_JS_MINIFY PASS files=${files.length} before=${before}B after=${after}B saved=${before-after}B`)
