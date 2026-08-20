import { existsSync } from 'node:fs'
import { chromium, firefox, webkit } from 'playwright'
import { createServer } from 'vite'

const browserTypes={chromium,firefox,webkit}

export function resolveBrowserType(engine='chromium'){
  const browserType=browserTypes[engine]
  if(!browserType)throw new Error(`Unsupported browser engine: ${engine}`)
  return browserType
}

export function resolveBrowserExecutable(engine='chromium'){
  const browserType=resolveBrowserType(engine)
  const configured=process.env[`LAN_UI_${engine.toUpperCase()}_PATH`]||(engine==='chromium'?process.env.LAN_UI_BROWSER_PATH:'')
  const candidates=[
    configured,
    browserType.executablePath(),
    engine==='chromium'&&process.platform==='win32'?'C:/Program Files/Google/Chrome/Application/chrome.exe':'',
    engine==='chromium'&&process.platform==='win32'?'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe':'',
    engine==='chromium'&&process.platform==='darwin'?'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome':'',
    engine==='chromium'?'/usr/bin/google-chrome':'',
    engine==='chromium'?'/usr/bin/chromium':'',
    engine==='chromium'?'/usr/bin/chromium-browser':'',
  ].filter(Boolean)
  const executablePath=candidates.find(existsSync)
  if(!executablePath)throw new Error(`${engine} browser not found; run pnpm exec playwright install ${engine} or set LAN_UI_${engine.toUpperCase()}_PATH`)
  return executablePath
}

export function resolveChromiumExecutable(){
  return resolveBrowserExecutable('chromium')
}

export function resolveBrowserNavigationTimeout(){
  const timeout=Number(process.env.LAN_UI_BROWSER_NAVIGATION_TIMEOUT??'180000')
  if(!Number.isFinite(timeout)||timeout<10000||timeout>300000)throw new Error('LAN_UI_BROWSER_NAVIGATION_TIMEOUT must be between 10000 and 300000')
  return timeout
}

export function launchBrowser(engine='chromium'){
  return resolveBrowserType(engine).launch({headless:true,executablePath:resolveBrowserExecutable(engine)})
}

export async function startFixtureServer(root){
  const server=await createServer({root,logLevel:'error',server:{host:'127.0.0.1',port:0}})
  await server.listen()
  const address=server.httpServer.address()
  const port=typeof address==='object'&&address?address.port:4173
  return {server,origin:`http://127.0.0.1:${port}`}
}
