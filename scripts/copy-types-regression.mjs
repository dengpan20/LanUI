import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { normalizeDeclaration } from './normalize-dts.mjs'

const root = resolve(import.meta.dirname, '..')
const verifyRoot = resolve(root, '.verify', 'copy-types-regression')
rmSync(verifyRoot, { recursive: true, force: true })
mkdirSync(verifyRoot, { recursive: true })

try {
  const semantic = 'export interface Fixture {\n  value: string\n}\n'
  const crlfInput = semantic.replaceAll('\n', '\r\n')
  const source = resolve(verifyRoot, 'input.d.ts')
  const output = resolve(verifyRoot, 'output.d.ts')
  writeFileSync(source, crlfInput, 'utf8')
  writeFileSync(output, normalizeDeclaration(readFileSync(source, 'utf8')), 'utf8')
  const bytes = readFileSync(output)
  const actual = bytes.toString('utf8')
  if (bytes.includes(13)) throw new Error('Normalized declaration still contains CR bytes')
  if (actual !== semantic) throw new Error('Normalized declaration changed semantic text')
  console.log('COPY_TYPES_REGRESSION PASS input=CRLF output=LF_ONLY semantic=preserved')
} finally {
  rmSync(verifyRoot, { recursive: true, force: true })
}
