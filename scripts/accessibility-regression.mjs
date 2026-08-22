import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import axe from 'axe-core'
import { launchBrowser, navigateFixture, resolveBrowserNavigationTimeout, startFixtureServer } from './browser-runtime.mjs'

const root=resolve(import.meta.dirname,'..')
const reportDir=resolve(root,'.verify/accessibility',process.platform)
mkdirSync(reportDir,{recursive:true})
const requestedCases=(process.argv.find(argument=>argument.startsWith('--case='))?.slice('--case='.length)||'').split(',').map(value=>value.trim()).filter(Boolean)
const navigationTimeout=resolveBrowserNavigationTimeout()

const cases=[
  {name:'light-ltr-default',viewport:{width:1280,height:1100},query:'theme=light&direction=ltr&density=default'},
  {name:'dark-rtl-compact',viewport:{width:1280,height:1100},query:'theme=dark&direction=rtl&density=compact'},
  {name:'light-ltr-mobile',viewport:{width:390,height:1600},query:'theme=light&direction=ltr&density=default'},
  {name:'select-open',viewport:{width:1280,height:1100},query:'theme=light&direction=ltr&density=default',prepare:async page=>{await page.getByRole('combobox').first().click();await page.locator('.ui-select-menu[role="listbox"]').waitFor()}},
  {name:'autocomplete-open',viewport:{width:1280,height:1100},query:'theme=light&direction=ltr&density=default',prepare:async page=>{await page.getByRole('combobox',{name:'Office city'}).click();await page.getByRole('listbox',{name:'Suggestions'}).waitFor()}},
  {name:'modal-open',viewport:{width:1280,height:1100},query:'theme=light&direction=ltr&density=default&state=modal',ready:'[role="dialog"][aria-modal="true"]'},
  {name:'drawer-rtl-open',viewport:{width:1280,height:1100},query:'theme=dark&direction=rtl&density=compact&state=drawer',ready:'[role="dialog"][aria-modal="true"]'},
  {name:'multi-select-open',viewport:{width:1280,height:1300},query:'theme=light&direction=ltr&density=default&state=advanced',prepare:async page=>{await page.locator('.ui-multi-select-trigger').click();await page.locator('.ui-multi-menu').waitFor()}},
  {name:'tree-select-open',viewport:{width:1280,height:1300},query:'theme=light&direction=ltr&density=default&state=advanced',prepare:async page=>{await page.locator('.ui-tree-trigger').click();await page.locator('.ui-tree-menu').waitFor()}},
  {name:'tree-enterprise',viewport:{width:1280,height:1300},query:'theme=light&direction=ltr&density=default&state=advanced',prepare:async page=>{await page.getByRole('tree',{name:'Resource permissions'}).focus()}},
  {name:'cascader-open',viewport:{width:1280,height:1300},query:'theme=dark&direction=rtl&density=compact&state=advanced',prepare:async page=>{await page.locator('.ui-cascader-trigger').click();await page.locator('.ui-cascader-menu').waitFor()}},
  {name:'command-palette-open',viewport:{width:1280,height:1300},query:'theme=light&direction=ltr&density=default&state=advanced',prepare:async page=>{await page.locator('#visual-command-trigger').click();await page.getByRole('dialog',{name:'Quick commands'}).waitFor()}},
  {name:'color-picker-open',viewport:{width:1280,height:1300},query:'theme=dark&direction=rtl&density=compact&state=advanced',prepare:async page=>{await page.locator('#visual-color-trigger').click();await page.getByRole('dialog',{name:'Color picker'}).waitFor()}},
  {name:'rate-focused',viewport:{width:1280,height:1300},query:'theme=light&direction=rtl&density=compact&state=advanced',prepare:async page=>{await page.getByRole('slider',{name:'Advanced rating'}).focus()}},
  {name:'calendar-focused',viewport:{width:1280,height:1400},query:'theme=light&direction=ltr&density=default',prepare:async page=>{await page.locator('.ui-calendar-day[data-date="2026-08-10"]').focus()}},
  {name:'image-focused',viewport:{width:1280,height:1500},query:'theme=light&direction=ltr&density=default',prepare:async page=>{await page.getByRole('button',{name:'Preview image: Release media'}).focus()}},
  {name:'image-preview-open',viewport:{width:1280,height:900},query:'theme=dark&direction=rtl&density=compact',prepare:async page=>{await page.getByRole('button',{name:'Preview image: Release media'}).click();await page.getByRole('dialog',{name:'Release media'}).waitFor()}},
  {name:'virtual-list-focused',viewport:{width:1280,height:1500},query:'theme=light&direction=ltr&density=default',prepare:async page=>{await page.getByRole('listbox',{name:'Virtualized records'}).focus()}},
  {name:'data-grid-focused',viewport:{width:1280,height:2000},query:'theme=light&direction=ltr&density=default',prepare:async page=>{await page.getByRole('textbox',{name:'Search data'}).focus()}},
  {name:'data-grid-columns-open',viewport:{width:1280,height:2000},query:'theme=dark&direction=rtl&density=compact',prepare:async page=>{await page.getByRole('button',{name:'Display columns'}).click();await page.getByRole('group',{name:'Column settings'}).waitFor()}},
  {name:'status-page-500',viewport:{width:1280,height:1800},query:'theme=light&direction=ltr&density=default&state=status',ready:'[data-status="500"]'},
  {name:'managed-form-error',viewport:{width:1280,height:1000},query:'theme=light&direction=ltr&density=default&state=form',ready:'.ui-form-error-summary'},
  {name:'dynamic-form-list',viewport:{width:1280,height:1100},query:'theme=light&direction=ltr&density=default&state=form-list',ready:'.visual-form-list'},
  {name:'schema-form',viewport:{width:1280,height:1100},query:'theme=light&direction=ltr&density=default&state=schema-form',ready:'.visual-schema-form'},
  {name:'schema-form-list',viewport:{width:1280,height:1200},query:'theme=light&direction=ltr&density=default&state=schema-form-list',ready:'.visual-schema-form-list'},
  {name:'upload-queue',viewport:{width:1280,height:900},query:'theme=light&direction=ltr&density=default&state=upload-queue',ready:'.visual-upload-queue'},
  {name:'scoped-theme-dark',viewport:{width:1280,height:2000},query:'theme=light&direction=ltr&density=default&state=theme',ready:'#visual-scoped-dark'},
  {name:'scoped-theme-portal',viewport:{width:1280,height:1000},query:'theme=light&direction=ltr&density=default&state=theme-portal',ready:'.ui-popover-panel[data-ui-teleport-scope]'},
  {name:'scoped-motion-preferences',viewport:{width:1280,height:1000},query:'theme=light&direction=ltr&density=default&state=motion',ready:'#visual-motion-reduced[data-ui-motion="reduced"]'},
  {name:'api-reference',viewport:{width:1280,height:1200},query:'theme=light&direction=ltr&density=default&state=api-docs',ready:'.api-reference-page'},
  {name:'anchor-navigation',viewport:{width:1280,height:1000},query:'theme=light&direction=ltr&density=default&state=anchor',ready:'.visual-anchor-showcase'},
  {name:'product-tour',viewport:{width:1280,height:1000},query:'theme=light&direction=ltr&density=default&state=tour',ready:'.ui-tour-panel'},
  {name:'watermark-document',viewport:{width:1280,height:1000},query:'theme=light&direction=ltr&density=default&state=watermark',ready:'.visual-watermark-showcase [data-ui-watermark-mode="text"]'},
  {name:'affix-container',viewport:{width:1280,height:1000},query:'theme=light&direction=ltr&density=default&state=affix',ready:'.visual-affix-showcase',prepare:async page=>{await page.locator('.visual-affix-target').evaluate(element=>{element.scrollTop=120;element.dispatchEvent(new Event('scroll'))});await page.waitForSelector('.visual-affix-showcase [data-affixed="true"]')}},
  {name:'splitter-workspace',viewport:{width:1280,height:1000},query:'theme=light&direction=ltr&density=default&state=splitter',ready:'.visual-splitter-showcase [role="separator"]'},
  {name:'typography-contract',viewport:{width:1280,height:1000},query:'theme=light&direction=ltr&density=default&state=typography',ready:'.visual-typography-showcase .ui-typography-action'},
  {name:'list-contract',viewport:{width:1280,height:1000},query:'theme=light&direction=ltr&density=default&state=list',ready:'.visual-list-showcase [role="listbox"]'},
  {name:'otp-input-contract',viewport:{width:1280,height:1000},query:'theme=light&direction=ltr&density=default&state=otp',ready:'.visual-otp-showcase [role="group"]'},
  {name:'mentions-contract',viewport:{width:1280,height:1000},query:'theme=light&direction=ltr&density=default&state=mentions',ready:'.visual-mentions-showcase .ui-mentions',prepare:async page=>{const input=page.getByRole('textbox',{name:'Release comment'});await input.fill('Review @de');await page.getByRole('listbox',{name:'Release comment'}).waitFor()}},
  {name:'input-tag-contract',viewport:{width:1280,height:1000},query:'theme=light&direction=ltr&density=default&state=input-tag',ready:'.visual-input-tag-showcase .ui-input-tag',prepare:async page=>{await page.getByRole('textbox',{name:'Release capabilities'}).focus()}},
  {name:'query-builder-contract',viewport:{width:1280,height:1100},query:'theme=light&direction=ltr&density=default&state=query-builder',ready:'.visual-query-builder-showcase .ui-query-builder'},
  {name:'carousel-contract',viewport:{width:1280,height:1000},query:'theme=light&direction=ltr&density=default&state=carousel',ready:'.visual-carousel-showcase .ui-carousel'},
  {name:'time-range-contract',viewport:{width:1280,height:1000},query:'theme=light&direction=ltr&density=default&state=time-range',ready:'.visual-time-range-showcase .ui-time-range-picker'},
  {name:'date-time-contract',viewport:{width:1280,height:1000},query:'theme=light&direction=ltr&density=default&state=date-time',ready:'.visual-date-time-showcase .ui-date-time-range-picker'},
  {name:'qr-code-contract',viewport:{width:1280,height:1000},query:'theme=light&direction=ltr&density=default&state=qr-code',ready:'.visual-qr-code-showcase .ui-qr-code-symbol'},
  {name:'barcode-contract',viewport:{width:1280,height:1000},query:'theme=light&direction=ltr&density=default&state=barcode',ready:'.visual-barcode-showcase .ui-barcode-symbol'},
  {name:'cron-editor-contract',viewport:{width:1280,height:1000},query:'theme=light&direction=ltr&density=default&state=cron-editor',ready:'.visual-cron-editor-showcase .ui-cron-run-list'},
  {name:'key-value-editor-contract',viewport:{width:1280,height:1100},query:'theme=light&direction=ltr&density=default&state=key-value-editor',ready:'.visual-key-value-showcase .ui-key-value-editor'},
  {name:'page-header-contract',viewport:{width:1280,height:900},query:'theme=light&direction=ltr&density=default&state=page-header',ready:'.visual-page-header-showcase .ui-page-header'},
  {name:'card-contract',viewport:{width:1280,height:900},query:'theme=light&direction=ltr&density=default&state=card',ready:'.visual-card-showcase [data-card-state-contract]'},
  {name:'tag-contract',viewport:{width:1280,height:900},query:'theme=light&direction=ltr&density=default&state=tag',ready:'.visual-tag-showcase [data-tag-state-contract]'},
  {name:'steps-contract',viewport:{width:1280,height:1100},query:'theme=light&direction=ltr&density=default&state=steps',ready:'.visual-steps-showcase [data-ui-steps]'},
  {name:'timeline-contract',viewport:{width:1280,height:900},query:'theme=light&direction=ltr&density=default&state=timeline',ready:'.visual-timeline-showcase [data-ui-timeline]'},
  {name:'breadcrumb-contract',viewport:{width:1280,height:900},query:'theme=light&direction=rtl&density=default&state=breadcrumb',ready:'.visual-breadcrumb-showcase [data-ui-breadcrumb]'},
  {name:'tooltip-contract',viewport:{width:1280,height:900},query:'theme=dark&direction=rtl&density=compact&state=tooltip',ready:'.visual-tooltip-showcase [role="tooltip"]'},
  {name:'popover-contract',viewport:{width:1280,height:900},query:'theme=dark&direction=rtl&density=compact&state=popover',ready:'.visual-popover-showcase [role="dialog"]'},
  {name:'dropdown-contract',viewport:{width:1280,height:900},query:'theme=dark&direction=rtl&density=compact&state=dropdown',ready:'.visual-dropdown-showcase [role="menu"]'},
  {name:'collapse-contract',viewport:{width:1280,height:1000},query:'theme=dark&direction=rtl&density=compact&state=collapse',ready:'.visual-collapse-showcase [data-ui-collapse]'},
  {name:'button-contract',viewport:{width:1280,height:1000},query:'theme=dark&direction=rtl&density=compact&state=button',ready:'.visual-button-showcase [data-button-state-contract]'},
  {name:'input-contract',viewport:{width:1280,height:1000},query:'theme=dark&direction=rtl&density=compact&state=input',ready:'.visual-input-showcase [data-input-state-contract]'},
]
const selectedCases=requestedCases.length?cases.filter(item=>requestedCases.includes(item.name)):cases
if(requestedCases.length&&selectedCases.length!==requestedCases.length)throw new Error(`Unknown accessibility case: ${requestedCases.filter(name=>!selectedCases.some(item=>item.name===name)).join(', ')}`)
const tags=['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22a','wcag22aa','best-practice']
const {server,origin}=await startFixtureServer(root)
let browser
let failed=0
try{
  browser=await launchBrowser()
  for(const item of selectedCases){
    const context=await browser.newContext({viewport:item.viewport,deviceScaleFactor:1,colorScheme:item.name.startsWith('dark')||item.name.includes('rtl')?'dark':'light',locale:'en-US',reducedMotion:'reduce'})
    const page=await context.newPage()
    await navigateFixture(page,`${origin}/visual-regression.html?${item.query}`,{timeout:navigationTimeout})
    await page.waitForSelector('body[data-visual-ready="true"]')
    if(item.ready)await page.waitForSelector(item.ready)
    await item.prepare?.(page)
    await page.addScriptTag({content:axe.source})
    const result=await page.evaluate(async ruleTags=>globalThis.axe.run(document,{runOnly:{type:'tag',values:ruleTags},resultTypes:['violations','incomplete','passes']}),tags)
    const report={case:item.name,url:page.url(),axeVersion:result.testEngine.version,timestamp:result.timestamp,violations:result.violations,incomplete:result.incomplete,passes:result.passes.map(({id,impact,tags})=>({id,impact,tags}))}
    writeFileSync(resolve(reportDir,`${item.name}.json`),JSON.stringify(report,null,2)+'\n','utf8')
    if(result.violations.length){
      failed+=1
      console.error(`A11Y FAIL case=${item.name} violations=${result.violations.length}`)
      for(const violation of result.violations)console.error(`- ${violation.id} impact=${violation.impact} nodes=${violation.nodes.length} ${violation.help}`)
    }else console.log(`A11Y PASS case=${item.name} violations=0 incomplete=${result.incomplete.length} passes=${result.passes.length}`)
    await context.close()
  }
  if(failed)process.exitCode=1
  else console.log(`ACCESSIBILITY_REGRESSION PASS cases=${selectedCases.length} axe=${axe.version} tags=${tags.length} platform=${process.platform}`)
}finally{
  await browser?.close()
  await server.close()
}
