import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import pixelmatch from 'pixelmatch'
import { PNG } from 'pngjs'
import { launchBrowser, startFixtureServer } from './browser-runtime.mjs'

const root=resolve(import.meta.dirname,'..')
const update=process.argv.includes('--update')
const platform=process.platform
const maxDiffRatio=Number(process.env.LAN_UI_VISUAL_MAX_DIFF_RATIO??'.002')
if(!Number.isFinite(maxDiffRatio)||maxDiffRatio<0||maxDiffRatio>.05)throw new Error('LAN_UI_VISUAL_MAX_DIFF_RATIO must be between 0 and 0.05')
const baselineDir=resolve(root,'tests/visual/baselines',platform)
const currentDir=resolve(root,'.verify/visual-current',platform)
const diffDir=resolve(root,'.verify/visual-diff',platform)
for(const directory of [baselineDir,currentDir,diffDir])mkdirSync(directory,{recursive:true})

const cases=[
  {name:'light-ltr-default',viewport:{width:1280,height:1100},query:'theme=light&direction=ltr&density=default'},
  {name:'dark-rtl-compact',viewport:{width:1280,height:1100},query:'theme=dark&direction=rtl&density=compact'},
  {name:'light-ltr-mobile',viewport:{width:390,height:1600},query:'theme=light&direction=ltr&density=default'},
  {name:'managed-form-error',viewport:{width:1280,height:900},query:'theme=light&direction=ltr&density=default&state=form',ready:'.ui-form-error-summary'},
  {name:'dynamic-form-list',viewport:{width:1280,height:950},query:'theme=light&direction=ltr&density=default&state=form-list',ready:'.visual-form-list'},
  {name:'schema-form',viewport:{width:1280,height:950},query:'theme=light&direction=ltr&density=default&state=schema-form',ready:'.visual-schema-form'},
  {name:'schema-form-list',viewport:{width:1280,height:1050},query:'theme=light&direction=ltr&density=default&state=schema-form-list',ready:'.visual-schema-form-list'},
]

const {server,origin}=await startFixtureServer(root)
let browser
try{
  browser=await launchBrowser()
  let failed=0
  for(const item of cases){
    const context=await browser.newContext({viewport:item.viewport,deviceScaleFactor:1,colorScheme:item.name.startsWith('dark')?'dark':'light',locale:'en-US',reducedMotion:'reduce'})
    const page=await context.newPage()
    await page.goto(`${origin}/visual-regression.html?${item.query}`,{waitUntil:'domcontentloaded',timeout:60000})
    await page.waitForSelector('body[data-visual-ready="true"]')
    if(item.ready)await page.waitForSelector(item.ready)
    const image=await page.locator('#visual-fixture').screenshot({animations:'disabled'})
    const current=resolve(currentDir,`${item.name}.png`)
    const baseline=resolve(baselineDir,`${item.name}.png`)
    writeFileSync(current,image)
    if(update||!existsSync(baseline)){
      if(!update)throw new Error(`Missing ${platform} baseline: ${baseline}; run pnpm run visual:update`)
      writeFileSync(baseline,image)
      console.log(`VISUAL UPDATE case=${item.name} bytes=${image.length}`)
      await context.close();continue
    }
    const expected=PNG.sync.read(readFileSync(baseline));const actual=PNG.sync.read(image)
    if(expected.width!==actual.width||expected.height!==actual.height)throw new Error(`Visual dimensions changed for ${item.name}: ${expected.width}x${expected.height} -> ${actual.width}x${actual.height}`)
    const diff=new PNG({width:actual.width,height:actual.height})
    const pixels=pixelmatch(expected.data,actual.data,diff.data,actual.width,actual.height,{threshold:.12,includeAA:false})
    const ratio=pixels/(actual.width*actual.height)
    if(pixels)writeFileSync(resolve(diffDir,`${item.name}.png`),PNG.sync.write(diff))
    if(ratio>maxDiffRatio){failed+=1;console.error(`VISUAL FAIL case=${item.name} pixels=${pixels} ratio=${ratio.toFixed(6)} maxDiffRatio=${maxDiffRatio}`)}
    else console.log(`VISUAL PASS case=${item.name} pixels=${pixels} ratio=${ratio.toFixed(6)} size=${actual.width}x${actual.height}`)
    await context.close()
  }
  if(failed)process.exitCode=1
  else console.log(`VISUAL_REGRESSION ${update?'UPDATED':'PASS'} cases=${cases.length} platform=${platform} maxDiffRatio=${maxDiffRatio}`)
}finally{
  await browser?.close()
  await server.close()
}
