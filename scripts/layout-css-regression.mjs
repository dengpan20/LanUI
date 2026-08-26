import { existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { launchBrowser, closeBrowserResource, combineBrowserErrors } from './browser-runtime.mjs'

const root=resolve(import.meta.dirname,'..')
const tarballArgument=process.argv.find(argument=>argument.startsWith('--tarball='))?.slice('--tarball='.length)
let stylesRoot=resolve(root,'dist-lib/styles')
if(tarballArgument){
  const extractRoot=resolve(root,'.verify/layout-css-packed')
  rmSync(extractRoot,{recursive:true,force:true});mkdirSync(extractRoot,{recursive:true})
  const tarball=resolve(root,tarballArgument)
  const result=spawnSync(process.platform==='win32'?'tar':'tar',['-xzf',tarball,'-C',extractRoot],{encoding:'utf8'})
  if(result.status!==0)throw new Error(`LAYOUT_CSS_REGRESSION tar extraction failed: ${result.stderr||result.stdout}`)
  stylesRoot=join(extractRoot,'package','dist-lib','styles')
}
const names=['core','UiGrid','UiCol','UiSpace','UiDivider']
if(!names.every(name=>existsSync(resolve(stylesRoot,`${name}.css`))))throw new Error('LAYOUT_CSS_REGRESSION missing built component styles')
const css=names.map(name=>readFileSync(resolve(stylesRoot,`${name}.css`),'utf8').replace(/@import\s+"\.\/core\.css";?/g,'')).join('\n')
const browser=await launchBrowser('chromium')
let context
let primaryError
try{
  context=await browser.newContext({viewport:{width:1280,height:720},locale:'en-US',reducedMotion:'reduce'})
  const page=await context.newPage()
  await page.setContent(`<!doctype html><html dir="ltr"><head><style>${css}</style></head><body>
    <main style="width:100%;max-width:520px;padding:8px;box-sizing:border-box">
      <div id="grid" class="ui-grid" style="--grid-columns-xs:1;--grid-columns-sm:1;--grid-columns-md:4;--grid-columns-lg:4;--grid-columns-xl:4;--grid-columns-xxl:4;--grid-gap-row-xs:8px;--grid-gap-column-xs:8px;--grid-gap-row-sm:8px;--grid-gap-column-sm:8px;--grid-gap-row-md:12px;--grid-gap-column-md:12px;--grid-gap-row-lg:12px;--grid-gap-column-lg:12px;--grid-gap-row-xl:12px;--grid-gap-column-xl:12px;--grid-gap-row-xxl:12px;--grid-gap-column-xxl:12px">
        <div class="ui-col" style="--col-span-xs:1;--col-span-sm:1;--col-span-md:1;--col-span-lg:1;--col-span-xl:1;--col-span-xxl:1;--col-start-xs:auto;--col-start-sm:auto;--col-start-md:auto;--col-start-lg:auto;--col-start-xl:auto;--col-start-xxl:auto">one</div>
        <div class="ui-col" style="--col-span-xs:1;--col-span-sm:1;--col-span-md:1;--col-span-lg:1;--col-span-xl:1;--col-span-xxl:1;--col-start-xs:auto;--col-start-sm:auto;--col-start-md:auto;--col-start-lg:auto;--col-start-xl:auto;--col-start-xxl:auto">two</div>
        <div class="ui-col" style="--col-span-xs:1;--col-span-sm:1;--col-span-md:1;--col-span-lg:1;--col-span-xl:1;--col-span-xxl:1;--col-start-xs:auto;--col-start-sm:auto;--col-start-md:auto;--col-start-lg:auto;--col-start-xl:auto;--col-start-xxl:auto">three</div>
        <div class="ui-col" style="--col-span-xs:1;--col-span-sm:1;--col-span-md:1;--col-span-lg:1;--col-span-xl:1;--col-span-xxl:1;--col-start-xs:auto;--col-start-sm:auto;--col-start-md:auto;--col-start-lg:auto;--col-start-xl:auto;--col-start-xxl:auto">four</div>
      </div>
      <div id="space" class="ui-space" style="--space-size:6px;--space-size-xs:6px;--space-size-sm:6px;--space-size-md:6px;--space-size-lg:6px;--space-size-xl:6px;--space-size-xxl:6px;--space-gap-column-xs:6px;--space-gap-column-sm:6px;--space-gap-column-md:6px;--space-gap-column-lg:6px;--space-gap-column-xl:6px;--space-gap-column-xxl:6px"><span>a</span><span>b</span></div>
      <div id="divider" class="ui-divider" style="--divider-thickness:2px;--divider-thickness-xs:2px;--divider-thickness-sm:2px;--divider-thickness-md:2px;--divider-thickness-lg:2px;--divider-thickness-xl:2px;--divider-thickness-xxl:2px"></div>
    </main></body></html>`)
  const desktop=await page.locator('#grid .ui-col').evaluateAll(elements=>elements.map(element=>{const rect=element.getBoundingClientRect();return {left:Math.round(rect.left),top:Math.round(rect.top),width:Math.round(rect.width)}}))
  if(new Set(desktop.map(item=>item.left)).size!==4)throw new Error(`LAYOUT_CSS_REGRESSION desktop auto-placement failed: ${JSON.stringify(desktop)}`)
  if(!desktop.every(item=>item.width>0))throw new Error('LAYOUT_CSS_REGRESSION desktop cells are empty')
  if((await page.locator('#space').evaluate(element=>getComputedStyle(element).columnGap))!=='6px')throw new Error('LAYOUT_CSS_REGRESSION Space effective gap failed')
  if((await page.locator('#divider').evaluate(element=>getComputedStyle(element).borderTopWidth))!=='2px')throw new Error('LAYOUT_CSS_REGRESSION Divider effective thickness failed')
  await page.setViewportSize({width:390,height:720})
  const mobile=await page.locator('#grid .ui-col').evaluateAll(elements=>elements.map(element=>{const rect=element.getBoundingClientRect();return {left:Math.round(rect.left),right:Math.round(rect.right),top:Math.round(rect.top)}}))
  if(!mobile.every(item=>item.left>=0&&item.right<=390))throw new Error(`LAYOUT_CSS_REGRESSION mobile overflow: ${JSON.stringify(mobile)}`)
  console.log(`LAYOUT_CSS_REGRESSION PASS source=${tarballArgument?'packed-tgz':'dist-lib/styles'} files=${names.length} desktopDistinctLeft=${new Set(desktop.map(item=>item.left)).size} mobileCells=${mobile.length} spaceGap=6px dividerThickness=2px`)
}catch(error){
  primaryError=error
}finally{
  const cleanupErrors=[]
  const contextCleanup=await closeBrowserResource(context,'layout-css-context')
  if(contextCleanup)cleanupErrors.push(contextCleanup)
  const browserCleanup=await closeBrowserResource(browser,'layout-css-browser')
  if(browserCleanup)cleanupErrors.push(browserCleanup)
  const combined=combineBrowserErrors(primaryError,cleanupErrors,'layout css regression')
  if(combined)throw combined
}
