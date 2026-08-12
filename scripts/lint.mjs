import fs from 'node:fs'
import path from 'node:path'

const roots=['src','scripts','tests'];const extensions=new Set(['.vue','.js','.mjs','.ts','.css','.md','.json']);const failures=[];let files=0
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){if(entry.name==='node_modules'||entry.name==='dist'||entry.name==='dist-lib')continue;const target=path.join(dir,entry.name);if(entry.isDirectory())walk(target);else if(extensions.has(path.extname(entry.name))){files++;const text=fs.readFileSync(target,'utf8');text.split(/\r?\n/).forEach((line,index)=>{if(/[ \t]+$/.test(line))failures.push(`${target}:${index+1}:trailing-whitespace`)});if(text.includes('\uFFFD'))failures.push(`${target}:replacement-character`)}}
}
roots.forEach(root=>walk(root));if(failures.length){console.error('LINT FAIL\n'+failures.join('\n'));process.exit(1)}console.log(`LINT PASS files=${files}`)
