import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { poolStableGlobals } from './minify-library-js.mjs'

const output = resolve(import.meta.dirname, '..', 'examples/standalone-vue/dist/assets')
const files = readdirSync(output).filter(name => name.endsWith('.js')).sort()
if (files.length !== 1) throw new Error(`Expected one standalone entry, found ${files.length}`)
const file = resolve(output, files[0])
const input = readFileSync(file, 'utf8')
const before = statSync(file).size
const code = poolStableGlobals(input.trim().replace(/;$/, ''))
const after = Buffer.byteLength(code)
if (after >= before) throw new Error(`Standalone JavaScript was not reduced: ${before}B -> ${after}B`)
writeFileSync(file, code, 'utf8')
console.log(`STANDALONE_JS_MINIFY PASS file=${files[0]} before=${before}B after=${after}B saved=${before - after}B mode=ast-member-pooling-no-text-rewrite`)
