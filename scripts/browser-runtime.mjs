import { createReadStream, existsSync, mkdirSync, rmSync, statSync } from 'node:fs'
import { createServer as createHttpServer } from 'node:http'
import { extname, relative, resolve as resolvePath } from 'node:path'
import { chromium, firefox, webkit } from 'playwright'
import { build, createServer } from 'vite'

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
  const timeout=Number(process.env.LAN_UI_BROWSER_NAVIGATION_TIMEOUT??'60000')
  if(!Number.isFinite(timeout)||timeout<10000||timeout>300000)throw new Error('LAN_UI_BROWSER_NAVIGATION_TIMEOUT must be between 10000 and 300000')
  return timeout
}

export function resolveBrowserStageTimeout(){
  const timeout=Number(process.env.LAN_UI_BROWSER_STAGE_TIMEOUT??'45000')
  if(!Number.isFinite(timeout)||timeout<5000||timeout>120000)throw new Error('LAN_UI_BROWSER_STAGE_TIMEOUT must be between 5000 and 120000')
  return timeout
}

export function resolveBrowserWarmupTimeout(){
  const timeout=Number(process.env.LAN_UI_BROWSER_WARMUP_TIMEOUT??'240000')
  if(!Number.isFinite(timeout)||timeout<30000||timeout>300000)throw new Error('LAN_UI_BROWSER_WARMUP_TIMEOUT must be between 30000 and 300000')
  return timeout
}

export async function withBrowserTimeout(task, timeout, stage){
  let timer
  try{
    return await Promise.race([
      Promise.resolve().then(task),
      new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error(`BROWSER_TIMEOUT stage=${stage} timeoutMs=${timeout}`)),timeout)}),
    ])
  }finally{
    clearTimeout(timer)
  }
}

export async function closeBrowserResource(resource,label,{timeout=resolveBrowserStageTimeout()}={}){
  if(!resource)return null
  try{
    await withBrowserTimeout(()=>resource.close({runBeforeUnload:false}),timeout,`close:${label}`)
    return null
  }catch(error){
    return new Error(`BROWSER_CLEANUP_FAIL resource=${label}: ${error?.message||String(error)}`,{cause:error})
  }
}

function nodeHttpClosePromise(httpServer){
  return new Promise((resolve,reject)=>{
    if(!httpServer||typeof httpServer.close!=='function'){
      resolve()
      return
    }
    let settled=false
    const cleanupListeners=()=>{
      if(typeof httpServer.removeListener==='function'){
        httpServer.removeListener('listening',closeWhenListening)
        httpServer.removeListener('error',handleError)
      }
    }
    const finish=(error)=>{
      if(settled)return
      settled=true
      cleanupListeners()
      if(error&&error.code!=='ERR_SERVER_NOT_RUNNING')reject(error)
      else resolve()
    }
    const handleError=(error)=>finish(error)
    const closeWhenListening=()=>{
      if(settled)return
      try{
        if(typeof httpServer.closeAllConnections==='function')httpServer.closeAllConnections()
        if(typeof httpServer.closeIdleConnections==='function')httpServer.closeIdleConnections()
        httpServer.close(finish)
      }catch(error){finish(error)}
    }
    let address=null
    try{address=typeof httpServer.address==='function'?httpServer.address():null}catch(error){finish(error);return}
    if(httpServer.listening||address!==null){
      closeWhenListening()
      return
    }
    if(typeof httpServer.once==='function'){
      httpServer.once('listening',closeWhenListening)
      httpServer.once('error',handleError)
      return
    }
    resolve()
  })
}

export async function closeNodeHttpServer(httpServer,{timeout=resolveBrowserStageTimeout()}={}){
  if(!httpServer)return
  await withBrowserTimeout(()=>nodeHttpClosePromise(httpServer),timeout,'close:node-http-server')
}

export async function closeHttpServerResource(httpServer,label='http-server',{timeout=resolveBrowserStageTimeout()}={}){
  try{
    await closeNodeHttpServer(httpServer,{timeout})
    return null
  }catch(error){
    return new Error(`BROWSER_CLEANUP_FAIL resource=${label}: ${error?.message||String(error)}`,{cause:error})
  }
}

export function combineBrowserErrors(primary,cleanupErrors,label='browser lifecycle'){
  const errors=cleanupErrors.filter(Boolean)
  if(primary&&errors.length)return new AggregateError([primary,...errors],`${label} failed during primary work and cleanup`)
  if(primary)return primary
  if(errors.length===1)return errors[0]
  if(errors.length>1)return new AggregateError(errors,`${label} cleanup failed`)
  return null
}

export function launchBrowser(engine='chromium'){
  return resolveBrowserType(engine).launch({headless:true,executablePath:resolveBrowserExecutable(engine)})
}

export async function createFixturePage(context,url,{readySelector='',timeout=Math.min(resolveBrowserNavigationTimeout(),resolveBrowserStageTimeout()),attempts=2,stageTimeout=resolveBrowserStageTimeout()}={}){
  let lastError
  for(let attempt=1;attempt<=attempts;attempt+=1){
    let page
    try{
      page=await withBrowserTimeout(()=>context.newPage(),stageTimeout,'page-create')
      page.setDefaultTimeout(stageTimeout)
      page.setDefaultNavigationTimeout(timeout)
      await navigateFixture(page,url,{timeout,attempts:1})
      if(readySelector)await withBrowserTimeout(()=>page.waitForSelector(readySelector),stageTimeout,'ready')
      return page
    }catch(error){
      lastError=error
      const cleanupError=await closeBrowserResource(page,'page-retry',{timeout:stageTimeout})
      const combined=combineBrowserErrors(error,cleanupError?[cleanupError]:[],'fixture page')
      if(combined!==error)throw combined
      if(attempt<attempts)console.warn(`BROWSER_PAGE_RETRY attempt=${attempt+1}/${attempts} stage=${error?.message||error}`)
    }
  }
  throw lastError
}

export async function launchBrowserReady(engine,{warmupUrl='',readySelector='body',viewport={width:1280,height:900},attempts=2}={}){
  const stageTimeout=resolveBrowserStageTimeout()
  const warmupTimeout=resolveBrowserWarmupTimeout()
  const deadline=Date.now()+warmupTimeout
  let lastError
  for(let attempt=1;attempt<=attempts;attempt+=1){
    const remaining=Math.max(5000,deadline-Date.now())
    let browser
    let context
    try{
      console.log(`BROWSER_WARMUP START engine=${engine} attempt=${attempt}/${attempts}`)
      browser=await withBrowserTimeout(()=>launchBrowser(engine),Math.min(stageTimeout,remaining),'browser-launch')
      console.log(`BROWSER_WARMUP LAUNCHED engine=${engine} attempt=${attempt}`)
      if(warmupUrl){
        const attemptTimeout=Math.min(warmupTimeout,Math.max(5000,deadline-Date.now()))
        context=await withBrowserTimeout(()=>browser.newContext({viewport,deviceScaleFactor:1,locale:'en-US',reducedMotion:'reduce'}),Math.min(stageTimeout,attemptTimeout),'warmup-context')
        const page=await createFixturePage(context,warmupUrl,{readySelector,timeout:attemptTimeout,attempts:1,stageTimeout:Math.min(stageTimeout,attemptTimeout)})
        const pageCleanup=await closeBrowserResource(page,'warmup-page',{timeout:Math.min(stageTimeout,Math.max(5000,deadline-Date.now()))})
        if(pageCleanup)throw pageCleanup
        const contextCleanup=await closeBrowserResource(context,'warmup-context',{timeout:Math.min(stageTimeout,Math.max(5000,deadline-Date.now()))})
        if(contextCleanup)throw contextCleanup
        context=undefined
        console.log(`BROWSER_WARMUP PASS engine=${engine} attempts=${attempt}`)
      }
      return browser
    }catch(error){
      const cleanupTimeout=Math.min(stageTimeout,Math.max(5000,deadline-Date.now()))
      const cleanupErrors=[]
      const contextCleanup=await closeBrowserResource(context,'warmup-context',{timeout:cleanupTimeout})
      if(contextCleanup)cleanupErrors.push(contextCleanup)
      const browserCleanup=await closeBrowserResource(browser,'browser',{timeout:cleanupTimeout})
      if(browserCleanup)cleanupErrors.push(browserCleanup)
      const combined=combineBrowserErrors(error,cleanupErrors,'browser warmup')
      if(cleanupErrors.length)throw combined
      lastError=error
      if(attempt<attempts&&Date.now()<deadline-5000)console.warn(`BROWSER_WARMUP RETRY engine=${engine} attempt=${attempt+1}/${attempts} error=${error?.message||error}`)
      else break
    }
  }
  throw lastError
}

export async function navigateFixture(page,url,{waitUntil='domcontentloaded',timeout=resolveBrowserNavigationTimeout(),attempts=2}={}){
  let lastError
  for(let attempt=1;attempt<=attempts;attempt+=1){
    try{
      await page.goto(url,{waitUntil,timeout})
      return
    }catch(error){
      lastError=error
      if(attempt>=attempts||error?.name!=='TimeoutError')throw error
      console.warn(`BROWSER_NAVIGATION RETRY attempt=${attempt+1}/${attempts} url=${url}`)
      await page.waitForTimeout(500)
    }
  }
  throw lastError
}

export async function startFixtureServer(root){
  const stageTimeout=resolveBrowserStageTimeout()
  let server
  try{
    server=await withBrowserTimeout(()=>createServer({root,logLevel:'error',server:{host:'127.0.0.1',port:0}}),stageTimeout,'server-create')
    await withBrowserTimeout(()=>server.listen(),stageTimeout,'server-listen')
    const address=server.httpServer.address()
    const port=typeof address==='object'&&address?address.port:4173
    console.log(`BROWSER_SERVER_READY port=${port} timeoutMs=${stageTimeout}`)
    return {server,origin:`http://127.0.0.1:${port}`}
  }catch(error){
    const cleanupError=await closeBrowserResource(server,'fixture-server')
    throw combineBrowserErrors(error,cleanupError?[cleanupError]:[],'fixture server')
  }
}

const staticMimeTypes={
  '.html':'text/html; charset=utf-8',
  '.js':'text/javascript; charset=utf-8',
  '.css':'text/css; charset=utf-8',
  '.json':'application/json; charset=utf-8',
  '.svg':'image/svg+xml',
  '.png':'image/png',
  '.woff':'font/woff',
  '.woff2':'font/woff2',
}

export function cleanupStaticFixtureOutput(outputDir){
  rmSync(outputDir,{recursive:true,force:true})
}

export async function startStaticFixtureServer(root,{entry='interaction-regression.html',outputDirName='interaction-fixture-dist'}={}){
  const stageTimeout=resolveBrowserStageTimeout()
  const buildTimeout=Math.min(resolveBrowserWarmupTimeout(),120000)
  const entryName=entry.replaceAll('\\','/')
  const outputDir=resolvePath(root,'.verify',outputDirName)
  let httpServer
  try{
    cleanupStaticFixtureOutput(outputDir)
    mkdirSync(outputDir,{recursive:true})
    console.log(`BROWSER_FIXTURE_BUILD START entry=${entryName} timeoutMs=${buildTimeout}`)
    await withBrowserTimeout(()=>build({
      configFile:resolvePath(root,'vite.config.js'),
      root,
      build:{
        outDir:outputDir,
        emptyOutDir:true,
        rollupOptions:{input:resolvePath(root,entryName)},
      },
    }),buildTimeout,'fixture-build')
    const entry=resolvePath(outputDir,entryName)
    if(!existsSync(entry))throw new Error(`fixture build did not produce ${entry}`)
    console.log(`BROWSER_FIXTURE_BUILD PASS entry=${entryName} bytes=${statSync(entry).size}`)
    httpServer=createHttpServer((request,response)=>{
      try{
        const pathname=new URL(request.url||'/',`http://${request.headers.host||'localhost'}`).pathname
        const requested=pathname==='/'?`/${entryName}`:pathname
        const target=resolvePath(outputDir,requested.slice(1))
        const rel=relative(outputDir,target)
        if(rel.startsWith('..')||rel.includes(':')){response.writeHead(403);response.end('Forbidden');return}
        if(!existsSync(target)||!statSync(target).isFile()){response.writeHead(404);response.end('Not found');return}
        response.writeHead(200,{'content-type':staticMimeTypes[extname(target).toLowerCase()]||'application/octet-stream','cache-control':'no-store'})
        createReadStream(target).pipe(response)
      }catch(error){response.writeHead(500);response.end(String(error?.message||error))}
    })
    await withBrowserTimeout(()=>new Promise((resolvePromise,reject)=>{
      httpServer.once('error',reject)
      httpServer.listen({host:'127.0.0.1',port:0},resolvePromise)
    }),stageTimeout,'static-server-listen')
    const port=httpServer.address().port
    console.log(`BROWSER_STATIC_SERVER_READY port=${port} entry=${entryName}`)
    const server={
      close:async()=>{
        try{await closeNodeHttpServer(httpServer,{timeout:stageTimeout})}
        finally{cleanupStaticFixtureOutput(outputDir)}
      },
    }
    return {server,origin:`http://127.0.0.1:${port}`,static:true}
  }catch(error){
    const cleanupError=await closeHttpServerResource(httpServer,'static-fixture-server',{timeout:stageTimeout})
    cleanupStaticFixtureOutput(outputDir)
    throw combineBrowserErrors(error,cleanupError?[cleanupError]:[],'static interaction fixture server')
  }
}

export function startStaticInteractionFixtureServer(root){
  return startStaticFixtureServer(root,{entry:'interaction-regression.html',outputDirName:'interaction-fixture-dist'})
}
