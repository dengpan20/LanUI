import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..')
const css=fs.readFileSync(path.join(root,'tokens.css'),'utf8')
const sections={light:{},dark:{}}
for(const [name,body] of [['light',css.match(/:root\s*\{([\s\S]*?)\n\}/)?.[1]||''],['dark',css.match(/\[data-theme="dark"\]\s*\{([\s\S]*?)\n\}/)?.[1]||'']]){
  for(const match of body.matchAll(/--([\w-]+):\s*([^;]+);/g))sections[name][match[1]]=match[2].trim()
}
const output={name:'Lan UI Design Tokens',version:'1.1.0',generatedFrom:'tokens.css',themes:sections}
fs.writeFileSync(path.join(root,'design-tokens.json'),JSON.stringify(output,null,2)+'\n')
console.log(`TOKENS_EXPORT light=${Object.keys(sections.light).length} dark=${Object.keys(sections.dark).length}`)
