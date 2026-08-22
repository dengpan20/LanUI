import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import pixelmatch from 'pixelmatch'
import { PNG } from 'pngjs'
import { launchBrowser, navigateFixture, resolveBrowserNavigationTimeout, startFixtureServer } from './browser-runtime.mjs'

const root=resolve(import.meta.dirname,'..')
const update=process.argv.includes('--update')
const platform=process.platform
const maxDiffRatio=Number(process.env.LAN_UI_VISUAL_MAX_DIFF_RATIO??'.002')
const navigationTimeout=resolveBrowserNavigationTimeout()
if(!Number.isFinite(maxDiffRatio)||maxDiffRatio<0||maxDiffRatio>.05)throw new Error('LAN_UI_VISUAL_MAX_DIFF_RATIO must be between 0 and 0.05')
const baselineDir=resolve(root,'tests/visual/baselines',platform)
const currentDir=resolve(root,'.verify/visual-current',platform)
const diffDir=resolve(root,'.verify/visual-diff',platform)
for(const directory of [baselineDir,currentDir,diffDir])mkdirSync(directory,{recursive:true})

const allCases=[
  {name:'light-ltr-default',viewport:{width:1280,height:1100},query:'theme=light&direction=ltr&density=default'},
  {name:'dark-rtl-compact',viewport:{width:1280,height:1100},query:'theme=dark&direction=rtl&density=compact'},
  {name:'light-ltr-mobile',viewport:{width:390,height:1600},query:'theme=light&direction=ltr&density=default'},
  {name:'managed-form-error',viewport:{width:1280,height:900},query:'theme=light&direction=ltr&density=default&state=form',ready:'.ui-form-error-summary'},
  {name:'dynamic-form-list',viewport:{width:1280,height:950},query:'theme=light&direction=ltr&density=default&state=form-list',ready:'.visual-form-list'},
  {name:'schema-form',viewport:{width:1280,height:950},query:'theme=light&direction=ltr&density=default&state=schema-form',ready:'.visual-schema-form'},
  {name:'schema-form-list',viewport:{width:1280,height:1050},query:'theme=light&direction=ltr&density=default&state=schema-form-list',ready:'.visual-schema-form-list'},
  {name:'upload-queue',viewport:{width:1280,height:850},query:'theme=light&direction=ltr&density=default&state=upload-queue',ready:'.visual-upload-queue'},
  {name:'scoped-theme',viewport:{width:1280,height:900},query:'theme=light&direction=ltr&density=default&state=theme',ready:'#visual-scoped-dark'},
  {name:'scoped-theme-portal',viewport:{width:1280,height:900},query:'theme=light&direction=ltr&density=default&state=theme-portal',ready:'.ui-popover-panel[data-ui-teleport-scope]',capture:'viewport',prepare:async page=>{await page.locator('#visual-theme-portal-trigger').scrollIntoViewIfNeeded();await page.waitForTimeout(100)}},
  {name:'scoped-motion',viewport:{width:1280,height:900},query:'theme=light&direction=ltr&density=default&state=motion',ready:'#visual-motion-reduced[data-ui-motion="reduced"]'},
  {name:'api-reference',viewport:{width:1280,height:1100},query:'theme=light&direction=ltr&density=default&state=api-docs',ready:'.api-reference-page',capture:'viewport'},
  {name:'anchor-navigation',viewport:{width:1280,height:900},query:'theme=light&direction=ltr&density=default&state=anchor',ready:'.visual-anchor-showcase',selector:'.visual-anchor-showcase'},
  {name:'product-tour',viewport:{width:1280,height:900},query:'theme=light&direction=ltr&density=default&state=tour',ready:'.ui-tour-panel',capture:'viewport',prepare:async page=>{await page.locator('#visual-tour-showcase').scrollIntoViewIfNeeded();await page.waitForTimeout(150)}},
  {name:'watermark-document',viewport:{width:1280,height:900},query:'theme=light&direction=ltr&density=default&state=watermark',ready:'.visual-watermark-showcase [data-ui-watermark-mode="text"]',selector:'.visual-watermark-showcase'},
  {name:'affix-container',viewport:{width:1280,height:900},query:'theme=light&direction=ltr&density=default&state=affix',ready:'.visual-affix-showcase',selector:'.visual-affix-showcase',prepare:async page=>{await page.locator('.visual-affix-target').evaluate(element=>{element.scrollTop=120;element.dispatchEvent(new Event('scroll'))});await page.waitForSelector('.visual-affix-showcase [data-affixed="true"]');await page.waitForTimeout(100)}},
  {name:'splitter-workspace',viewport:{width:1280,height:900},query:'theme=light&direction=ltr&density=default&state=splitter',ready:'.visual-splitter-showcase [role="separator"]',selector:'.visual-splitter-showcase'},
  {name:'typography-contract',viewport:{width:1280,height:900},query:'theme=light&direction=ltr&density=default&state=typography',ready:'.visual-typography-showcase .ui-typography-action',selector:'.visual-typography-showcase'},
  {name:'list-contract',viewport:{width:1280,height:900},query:'theme=light&direction=ltr&density=default&state=list',ready:'.visual-list-showcase [role="listbox"]',selector:'.visual-list-showcase'},
  {name:'otp-input-contract',viewport:{width:1280,height:900},query:'theme=light&direction=ltr&density=default&state=otp',ready:'.visual-otp-showcase [role="group"]',selector:'.visual-otp-showcase'},
  {name:'mentions-contract',viewport:{width:1280,height:900},query:'theme=light&direction=ltr&density=default&state=mentions',ready:'.visual-mentions-showcase .ui-mentions',selector:'.visual-mentions-showcase'},
  {name:'input-tag-contract',viewport:{width:1280,height:900},query:'theme=light&direction=ltr&density=default&state=input-tag',ready:'.visual-input-tag-showcase .ui-input-tag',selector:'.visual-input-tag-showcase'},
  {name:'query-builder-contract',viewport:{width:1280,height:1000},query:'theme=light&direction=ltr&density=default&state=query-builder',ready:'.visual-query-builder-showcase .ui-query-builder',selector:'.visual-query-builder-showcase'},
  {name:'carousel-contract',viewport:{width:1280,height:900},query:'theme=light&direction=ltr&density=default&state=carousel',ready:'.visual-carousel-showcase .ui-carousel',selector:'.visual-carousel-showcase'},
  {name:'time-range-contract',viewport:{width:1280,height:900},query:'theme=light&direction=ltr&density=default&state=time-range',ready:'.visual-time-range-showcase .ui-time-range-picker',selector:'.visual-time-range-showcase'},
  {name:'date-time-contract',viewport:{width:1280,height:900},query:'theme=light&direction=ltr&density=default&state=date-time',ready:'.visual-date-time-showcase .ui-date-time-range-picker',selector:'.visual-date-time-showcase'},
  {name:'qr-code-contract',viewport:{width:1280,height:900},query:'theme=light&direction=ltr&density=default&state=qr-code',ready:'.visual-qr-code-showcase .ui-qr-code-symbol',selector:'.visual-qr-code-showcase',diffAllowance:.005},
  {name:'barcode-contract',viewport:{width:1280,height:900},query:'theme=light&direction=ltr&density=default&state=barcode',ready:'.visual-barcode-showcase .ui-barcode-symbol',selector:'.visual-barcode-showcase',diffAllowance:.005},
  {name:'cron-editor-contract',viewport:{width:1280,height:900},query:'theme=light&direction=ltr&density=default&state=cron-editor',ready:'.visual-cron-editor-showcase .ui-cron-run-list',selector:'.visual-cron-editor-showcase'},
  {name:'key-value-editor-contract',viewport:{width:1280,height:980},query:'theme=light&direction=ltr&density=default&state=key-value-editor',ready:'.visual-key-value-showcase .ui-key-value-editor',selector:'.visual-key-value-showcase'},
  {name:'page-header-contract',viewport:{width:1280,height:900},query:'theme=light&direction=ltr&density=default&state=page-header',ready:'.visual-page-header-showcase .ui-page-header',selector:'.visual-page-header-showcase'},
  {name:'button-contract',viewport:{width:1280,height:900},query:'theme=dark&direction=rtl&density=compact&state=button',ready:'.visual-button-showcase [data-button-state-contract]',selector:'.visual-button-showcase',diffAllowance:.002},
  {name:'input-contract',viewport:{width:1280,height:900},query:'theme=dark&direction=rtl&density=compact&state=input',ready:'.visual-input-showcase [data-input-state-contract]',selector:'.visual-input-showcase',diffAllowance:.002},
  {name:'textarea-contract',viewport:{width:1280,height:1000},query:'theme=dark&direction=rtl&density=compact&state=textarea',ready:'.visual-textarea-showcase [data-textarea-state-contract]',selector:'.visual-textarea-showcase',diffAllowance:.002},
  {name:'select-contract',viewport:{width:1280,height:1000},query:'theme=dark&direction=rtl&density=compact&state=select',ready:'.visual-select-showcase [data-select-state-contract]',capture:'viewport',prepare:async page=>{await page.locator('.visual-select-showcase').evaluate(element=>element.scrollIntoView({block:'center'}));await page.waitForTimeout(120)},diffAllowance:.002},
  {name:'multi-select-contract',viewport:{width:1280,height:1050},query:'theme=dark&direction=rtl&density=compact&state=multi-select',ready:'.visual-multi-select-showcase [data-multi-select-state-contract]',capture:'viewport',prepare:async page=>{await page.locator('.visual-multi-select-showcase').evaluate(element=>element.scrollIntoView({block:'center'}));await page.waitForTimeout(120)},diffAllowance:.002},
  {name:'tree-select-contract',viewport:{width:1280,height:1150},query:'theme=dark&direction=rtl&density=compact&state=tree-select',ready:'.visual-tree-select-showcase [data-tree-select-state-contract]',selector:'.visual-tree-select-showcase',prepare:async page=>{const showcase=page.locator('.visual-tree-select-showcase');await showcase.evaluate(element=>element.scrollIntoView({block:'center'}));await showcase.locator('.visual-tree-select-stage .ui-tree-trigger').click();await showcase.locator('.ui-tree-select-menu').waitFor();await page.waitForTimeout(120)},diffAllowance:.002},
  {name:'cascader-contract',viewport:{width:1280,height:1050},query:'theme=dark&direction=rtl&density=compact&state=cascader',ready:'.visual-cascader-showcase [data-cascader-state-contract]',selector:'.visual-cascader-showcase',prepare:async page=>{await page.locator('.visual-cascader-showcase').evaluate(element=>element.scrollIntoView({block:'center'}));await page.waitForTimeout(120)},diffAllowance:.002},
  {name:'transfer-contract',viewport:{width:1280,height:980},query:'theme=dark&direction=rtl&density=compact&state=transfer',ready:'.visual-transfer-showcase [data-transfer-state-contract]',selector:'.visual-transfer-showcase',prepare:async page=>{await page.locator('.visual-transfer-showcase').evaluate(element=>element.scrollIntoView({block:'center'}));await page.waitForTimeout(120)},diffAllowance:.002},
  {name:'selection-contract',viewport:{width:1280,height:1000},query:'theme=dark&direction=rtl&density=compact&state=selection',ready:'.visual-selection-showcase [data-selection-state-contract]',selector:'.visual-selection-showcase',diffAllowance:.002},
  {name:'card-contract',viewport:{width:1280,height:900},query:'theme=light&direction=ltr&density=default&state=card',ready:'.visual-card-showcase [data-card-state-contract]',selector:'.visual-card-showcase'},
  {name:'tag-contract',viewport:{width:1280,height:900},query:'theme=light&direction=ltr&density=default&state=tag',ready:'.visual-tag-showcase [data-tag-state-contract]',selector:'.visual-tag-showcase'},
  {name:'steps-contract',viewport:{width:1280,height:1000},query:'theme=light&direction=ltr&density=default&state=steps',ready:'.visual-steps-showcase [data-ui-steps]',selector:'.visual-steps-showcase'},
  {name:'timeline-contract',viewport:{width:1280,height:900},query:'theme=light&direction=ltr&density=default&state=timeline',ready:'.visual-timeline-showcase [data-ui-timeline]',selector:'.visual-timeline-showcase'},
  {name:'breadcrumb-contract',viewport:{width:1280,height:820},query:'theme=light&direction=ltr&density=default&state=breadcrumb',ready:'.visual-breadcrumb-showcase [data-ui-breadcrumb]',selector:'.visual-breadcrumb-showcase'},
  {name:'tooltip-contract',viewport:{width:1280,height:820},query:'theme=light&direction=ltr&density=default&state=tooltip',ready:'.visual-tooltip-showcase [role="tooltip"]',selector:'.visual-tooltip-showcase'},
  {name:'popover-contract',viewport:{width:1280,height:820},query:'theme=light&direction=ltr&density=default&state=popover',ready:'.visual-popover-showcase [data-popover-state-contract]',capture:'viewport'},
  {name:'dropdown-contract',viewport:{width:1280,height:820},query:'theme=light&direction=ltr&density=default&state=dropdown',ready:'.visual-dropdown-showcase [role="menu"]',selector:'.visual-dropdown-showcase'},
  {name:'collapse-contract',viewport:{width:1280,height:900},query:'theme=light&direction=rtl&density=default&state=collapse',ready:'.visual-collapse-showcase [data-ui-collapse]',selector:'.visual-collapse-showcase'},
]
const requestedCases=(process.argv.find(argument=>argument.startsWith('--case='))?.slice('--case='.length)||'').split(',').map(value=>value.trim()).filter(Boolean)
const cases=requestedCases.length?allCases.filter(item=>requestedCases.includes(item.name)):allCases
if(requestedCases.length&&cases.length!==requestedCases.length)throw new Error(`Unknown visual case: ${requestedCases.filter(name=>!cases.some(item=>item.name===name)).join(', ')}`)

const {server,origin}=await startFixtureServer(root)
let browser
try{
  browser=await launchBrowser()
  let failed=0
  for(const item of cases){
    const context=await browser.newContext({viewport:item.viewport,deviceScaleFactor:1,colorScheme:item.name.startsWith('dark')?'dark':'light',locale:'en-US',reducedMotion:'reduce'})
    const page=await context.newPage()
    await navigateFixture(page,`${origin}/visual-regression.html?${item.query}`,{timeout:navigationTimeout})
    await page.waitForSelector('body[data-visual-ready="true"]')
    if(item.ready)await page.waitForSelector(item.ready)
    await item.prepare?.(page)
    const image=item.capture==='viewport'?await page.screenshot({animations:'disabled'}):await page.locator(item.selector||'#visual-fixture').screenshot({animations:'disabled'})
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
    const effectiveMaxDiffRatio=Math.min(.05,maxDiffRatio+(item.diffAllowance??0))
    if(pixels)writeFileSync(resolve(diffDir,`${item.name}.png`),PNG.sync.write(diff))
    if(ratio>effectiveMaxDiffRatio){failed+=1;console.error(`VISUAL FAIL case=${item.name} pixels=${pixels} ratio=${ratio.toFixed(6)} maxDiffRatio=${effectiveMaxDiffRatio}`)}
    else console.log(`VISUAL PASS case=${item.name} pixels=${pixels} ratio=${ratio.toFixed(6)} size=${actual.width}x${actual.height} maxDiffRatio=${effectiveMaxDiffRatio}`)
    await context.close()
  }
  if(failed)process.exitCode=1
  else console.log(`VISUAL_REGRESSION ${update?'UPDATED':'PASS'} cases=${cases.length} platform=${platform} maxDiffRatio=${maxDiffRatio}`)
}finally{
  await browser?.close()
  await server.close()
}
