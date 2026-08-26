import { createServer } from 'node:http'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join, extname, resolve, normalize } from 'node:path'
import { pathToFileURL } from 'node:url'
import { launchBrowser } from './browser-runtime.mjs'

const root = resolve(import.meta.dirname, '..')
const chunks = resolve(root, 'dist-lib/chunks')
const formFile = readdirSync(chunks).find(name => /^formUtils-.*\.js$/.test(name))
if (!formFile) throw new Error('MINIFIER_LIBRARY_RUNTIME FAIL: formUtils chunk missing')
const form = await import(pathToFileURL(join(chunks, formFile)).href)
if (form.i({ account: { name: 'LanUI' } }, 'account.name') !== true || form.i({ account: {} }, 'account.name') !== false) {
  throw new Error('MINIFIER_LIBRARY_RUNTIME FAIL: hasOwnProperty receiver semantics')
}
console.log(`MINIFIER_LIBRARY_RUNTIME PASS file=${formFile} execution=hasOwnProperty-path`)

const dist = resolve(root, 'examples/standalone-vue/dist')
if (!existsSync(join(dist, 'index.html'))) throw new Error('MINIFIER_STANDALONE_RUNTIME FAIL: built app missing')
const server = createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url || '/', 'http://127.0.0.1').pathname)
  const candidate = normalize(join(dist, pathname === '/' ? 'index.html' : pathname.slice(1)))
  const file = candidate.startsWith(dist) && existsSync(candidate) && statSync(candidate).isFile() ? candidate : join(dist, 'index.html')
  const type = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png' }[extname(file)] || 'application/octet-stream'
  response.writeHead(200, { 'content-type': type }); response.end(readFileSync(file))
})
const listen = () => new Promise((resolveListen, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', () => resolveListen(server.address().port)) })
const close = () => new Promise((resolveClose, reject) => { const timer = setTimeout(() => reject(new Error('standalone server close timeout')), 5000); server.close(error => { clearTimeout(timer); error ? reject(error) : resolveClose() }) })
let browser
try {
  const port = await listen()
  browser = await launchBrowser('chromium')
  const page = await browser.newPage()
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.locator('.standalone-avatar-contract .ui-avatar').waitFor({ state: 'visible', timeout: 60000 })
  // Exercise the packed consumer's real UiForm/schema path.  This is an
  // observable execution check for the bundled hasOwnProperty/form utility,
  // not a source-text assertion.
  const form = page.locator('.standalone-form')
  await form.getByRole('button', { name: '生成独立项目' }).click()
  await page.getByText('独立项目初始化完成', { exact: true }).waitFor({ state: 'visible', timeout: 60000 })
  if (errors.length) throw new Error(`MINIFIER_STANDALONE_RUNTIME FAIL: ${errors.join('; ')}`)
  console.log(`MINIFIER_STANDALONE_RUNTIME PASS marker=standalone-avatar-contract visible=true form-path=submit-success`)
} finally {
  const errors = []
  if (browser) { try { await Promise.race([browser.close(), new Promise((_, reject) => setTimeout(() => reject(new Error('browser close timeout')), 5000))]) } catch (error) { errors.push(error) } }
  try { await close() } catch (error) { errors.push(error) }
  if (errors.length) throw new AggregateError(errors, 'MINIFIER_RUNTIME cleanup failed')
}
