import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root=resolve(import.meta.dirname,'..')
const source=JSON.parse(readFileSync(resolve(root,'design-tokens.json'),'utf8'))
const target=resolve(root,'src/theme-tokens.js')
const serialize=value=>JSON.stringify(value,null,2)
const output=[
  '// Generated from design-tokens.json by scripts/generate-theme-tokens.mjs.',
  '// Run `pnpm run theme:generate` after reviewing token source changes.',
  `export const themeTokenSourceVersion=${JSON.stringify(source.version)}`,
  `export const lightThemeTokens=Object.freeze(${serialize(source.themes.light)})`,
  `export const darkThemeOverrides=Object.freeze(${serialize(source.themes.dark)})`,
  '',
].join('\n')

if(process.argv.includes('--write')){
  writeFileSync(target,output,'utf8')
  console.log(`THEME_TOKENS WRITE version=${source.version} light=${Object.keys(source.themes.light).length} dark=${Object.keys(source.themes.dark).length}`)
}else{
  const current=readFileSync(target,'utf8').replace(/\r\n?/g,'\n')
  if(current!==output)throw new Error('Generated theme tokens differ; run pnpm run theme:generate and review the output')
  console.log(`THEME_TOKENS PASS version=${source.version} light=${Object.keys(source.themes.light).length} dark=${Object.keys(source.themes.dark).length}`)
}
