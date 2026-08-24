import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const GZIP_MAGIC_0 = 0x1f
const GZIP_MAGIC_1 = 0x8b
const GZIP_DEFLATE = 8
const GZIP_UNIX_OS = 3

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

export function readGzipHeader(path) {
  const bytes = readFileSync(path)
  assert(bytes.length >= 10, `TGZ is shorter than the fixed gzip header: ${path}`)
  assert(bytes[0] === GZIP_MAGIC_0 && bytes[1] === GZIP_MAGIC_1, `TGZ gzip magic mismatch: ${path}`)
  assert(bytes[2] === GZIP_DEFLATE, `TGZ compression method is not deflate: ${path}`)
  assert((bytes[3] & 0xe0) === 0, `TGZ gzip reserved flags are set: ${path}`)
  return { bytes, os: bytes[9], flags: bytes[3], method: bytes[2] }
}

export function normalizeTgz(path) {
  const { bytes, os } = readGzipHeader(path)
  if (os !== GZIP_UNIX_OS) {
    const normalized = Buffer.from(bytes)
    normalized[9] = GZIP_UNIX_OS
    writeFileSync(path, normalized)
  }
  const finalHeader = readGzipHeader(path)
  assert(finalHeader.os === GZIP_UNIX_OS, `TGZ gzip OS byte must be 3: ${path}`)
  return { beforeOs: os, afterOs: finalHeader.os, changed: os !== finalHeader.os }
}

export function assertCanonicalTgz(path) {
  const header = readGzipHeader(path)
  assert(header.os === GZIP_UNIX_OS, `TGZ gzip OS byte must be 3: ${path}`)
  return header
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const root = resolve(import.meta.dirname, '..')
  const manifest = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'))
  const path = process.argv[2] || resolve(root, 'artifacts', `lan-ui-design-system-${manifest.version}.tgz`)
  const result = normalizeTgz(path)
  console.log(`TGZ_NORMALIZE PASS path=${path} beforeOS=${result.beforeOs} afterOS=${result.afterOs} changed=${result.changed}`)
}
