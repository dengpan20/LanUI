import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import axe from 'axe-core'
import { closeBrowserResource, combineBrowserErrors, launchBrowser, resolveBrowserNavigationTimeout, startStaticFixtureServer } from './browser-runtime.mjs'

const root=resolve(import.meta.dirname,'..')
const reportDir=resolve(root,'.verify/accessibility',process.platform)
mkdirSync(reportDir,{recursive:true})
const requestedCases=(process.argv.find(argument=>argument.startsWith('--case='))?.slice('--case='.length)||'').split(',').map(value=>value.trim()).filter(Boolean)
const navigationTimeout=resolveBrowserNavigationTimeout()
const browserEngine=process.env.LAN_UI_A11Y_BROWSER||'chromium'
const stageTimeout=Number(process.env.LAN_UI_A11Y_STAGE_TIMEOUT??'30000')
if(!Number.isFinite(stageTimeout)||stageTimeout<5000||stageTimeout>120000)throw new Error('LAN_UI_A11Y_STAGE_TIMEOUT must be between 5000 and 120000')

async function runStage(caseName,stage,task){
  const started=Date.now()
  let timer
  try{
    return await Promise.race([
      Promise.resolve().then(task),
      new Promise((_,reject)=>{timer=setTimeout(()=>{const error=new Error(`A11Y_TIMEOUT case=${caseName} stage=${stage} timeoutMs=${stageTimeout}`);error.a11yStage=stage;reject(error)},stageTimeout)})
    ])
  }catch(error){
    if(!error.a11yStage)error.a11yStage=stage
    throw error
  }finally{
    clearTimeout(timer)
    console.log(`A11Y STAGE case=${caseName} stage=${stage} elapsedMs=${Date.now()-started}`)
  }
}

const cases=[
  {name:'light-ltr-default',viewport:{width:1280,height:1100},query:'theme=light&direction=ltr&density=default'},
  {name:'dark-rtl-compact',viewport:{width:1280,height:1100},query:'theme=dark&direction=rtl&density=compact'},
  {name:'light-ltr-mobile',viewport:{width:390,height:1600},query:'theme=light&direction=ltr&density=default'},
  {name:'select-open',viewport:{width:1280,height:1100},query:'theme=light&direction=ltr&density=default',prepare:async page=>{await page.getByRole('combobox').first().click();await page.locator('.ui-select-menu [role="listbox"]').waitFor()}},
  {name:'autocomplete-open',viewport:{width:1280,height:1100},query:'theme=light&direction=ltr&density=default',prepare:async page=>{await page.locator('.ui-autocomplete-input').click();await page.locator('.ui-autocomplete-menu[role="listbox"]').waitFor()}},
  {name:'modal-open',viewport:{width:1280,height:1100},query:'theme=light&direction=ltr&density=default&state=modal',ready:'[role="dialog"][aria-modal="true"]'},
  {name:'drawer-rtl-open',viewport:{width:1280,height:1100},query:'theme=dark&direction=rtl&density=compact&state=drawer',ready:'[role="dialog"][aria-modal="true"]'},
  {name:'multi-select-open',viewport:{width:1280,height:1300},query:'theme=light&direction=ltr&density=default&state=advanced',prepare:async page=>{await page.locator('.ui-multi-select-trigger').click();await page.locator('.ui-multi-menu').waitFor()}},
  {name:'tree-select-open',viewport:{width:1280,height:1300},query:'theme=light&direction=ltr&density=default&state=advanced',prepare:async page=>{await page.locator('.ui-tree-trigger').click();await page.locator('.ui-tree-menu').waitFor()}},
  {name:'tree-enterprise',viewport:{width:1280,height:1300},query:'theme=light&direction=ltr&density=default&state=advanced',prepare:async page=>{await page.getByRole('tree',{name:'Resource permissions'}).focus()}},
  {name:'cascader-open',viewport:{width:1280,height:1300},query:'theme=dark&direction=rtl&density=compact&state=cascader',ready:'.visual-cascader-showcase [data-cascader-state-contract]',prepare:async page=>{await page.locator('.visual-cascader-stage .ui-cascader-menu').waitFor()}},
  {name:'transfer-contract',viewport:{width:1280,height:1100},query:'theme=dark&direction=rtl&density=compact&state=transfer',ready:'.visual-transfer-showcase [data-transfer-state-contract]',prepare:async page=>{await page.getByRole('listbox',{name:/Available|可选/}).focus()}},
  {name:'pagination-contract',viewport:{width:1280,height:900},query:'theme=dark&direction=rtl&density=compact&state=pagination',ready:'.visual-pagination-showcase [data-pagination-state-contract]',prepare:async page=>{await page.getByRole('navigation',{name:'Release evidence pages'}).focus()}},
  {name:'table-contract',viewport:{width:1280,height:920},query:'theme=dark&direction=rtl&density=compact&state=table',ready:'.visual-table-showcase [data-table-state-contract]',prepare:async page=>{await page.locator('.visual-table-showcase .ui-table-row').first().focus()}},
  {name:'date-picker-contract',viewport:{width:1280,height:920},query:'theme=dark&direction=rtl&density=compact&state=date-picker',ready:'.visual-date-picker-showcase [data-date-picker-state-contract]',prepare:async page=>{const day=page.locator('.visual-date-picker-showcase .ui-calendar-day[data-date="2026-08-24"]');await day.waitFor();await day.focus()}},
  {name:'date-range-picker-contract',viewport:{width:1280,height:1000},query:'theme=dark&direction=rtl&density=compact&state=date-range',ready:'.visual-date-range-showcase [data-date-range-state-contract]',prepare:async page=>{const day=page.locator('.visual-date-range-showcase .ui-calendar-day[data-date="2026-08-24"]');await day.waitFor();await day.focus()}},
  {name:'float-button-contract',viewport:{width:1280,height:900},query:'theme=dark&direction=rtl&density=compact&state=float-button',ready:'.visual-float-button-showcase [data-float-button-state-contract]',prepare:async page=>{await page.locator('.visual-float-button-showcase').scrollIntoViewIfNeeded()}},
  {name:'layout-contract',viewport:{width:1280,height:1000},query:'theme=dark&direction=rtl&density=compact&state=layout',ready:'.visual-layout-showcase [data-layout-state-contract]',prepare:async page=>{await page.locator('.visual-layout-showcase').scrollIntoViewIfNeeded()}},
  {name:'command-palette-open',viewport:{width:1280,height:1300},query:'theme=light&direction=ltr&density=default&state=advanced',prepare:async page=>{await page.locator('#visual-command-trigger').click();await page.locator('.ui-command-palette[role="dialog"]').waitFor()}},
  {name:'color-picker-open',viewport:{width:1280,height:1300},query:'theme=dark&direction=rtl&density=compact&state=advanced',prepare:async page=>{await page.locator('#visual-color-trigger').click();await page.locator('.ui-color-panel[role="dialog"]').waitFor()}},
  {name:'rate-focused',viewport:{width:1280,height:1300},query:'theme=light&direction=rtl&density=compact&state=advanced',prepare:async page=>{await page.getByRole('slider',{name:'Advanced rating'}).focus()}},
  {name:'calendar-focused',viewport:{width:1280,height:1400},query:'theme=light&direction=ltr&density=default',prepare:async page=>{await page.locator('.ui-calendar-day[data-date="2026-08-10"]').focus()}},
  {name:'image-focused',viewport:{width:1280,height:1500},query:'theme=light&direction=ltr&density=default',prepare:async page=>{await page.locator('.ui-image-media').scrollIntoViewIfNeeded();await page.locator('.ui-image-open').focus()}},
  {name:'image-preview-open',viewport:{width:1280,height:900},query:'theme=dark&direction=rtl&density=compact',prepare:async page=>{await page.locator('.ui-image-media').scrollIntoViewIfNeeded();await page.locator('.ui-image-open').click();await page.locator('.ui-image-preview[role="dialog"]').waitFor()}},
  {name:'virtual-list-focused',viewport:{width:1280,height:1500},query:'theme=light&direction=ltr&density=default',prepare:async page=>{await page.getByRole('listbox',{name:'Virtualized records'}).focus()}},
  {name:'data-grid-focused',viewport:{width:1280,height:2000},query:'theme=light&direction=ltr&density=default',prepare:async page=>{await page.getByRole('textbox',{name:/^(Search data|搜索数据)$/}).focus()}},
  {name:'data-grid-columns-open',viewport:{width:1280,height:2000},query:'theme=dark&direction=rtl&density=compact',prepare:async page=>{await page.getByRole('button',{name:/^(Display columns|显示列)$/}).click();await page.getByRole('group',{name:/^(Column settings|列设置)$/}).waitFor()}},
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
  {name:'textarea-contract',viewport:{width:1280,height:1100},query:'theme=dark&direction=rtl&density=compact&state=textarea',ready:'.visual-textarea-showcase [data-textarea-state-contract]'},
  {name:'select-contract',viewport:{width:1280,height:1100},query:'theme=dark&direction=rtl&density=compact&state=select',ready:'.visual-select-showcase [data-select-state-contract]'},
  {name:'multi-select-contract',viewport:{width:1280,height:1150},query:'theme=dark&direction=rtl&density=compact&state=multi-select',ready:'.visual-multi-select-showcase [data-multi-select-state-contract]'},
  {name:'tree-select-contract',viewport:{width:1280,height:1250},query:'theme=dark&direction=rtl&density=compact&state=tree-select',ready:'.visual-tree-select-showcase [data-tree-select-state-contract]',prepare:async page=>{const showcase=page.locator('.visual-tree-select-showcase');await showcase.evaluate(element=>element.scrollIntoView({block:'center'}));await showcase.locator('.visual-tree-select-stage .ui-tree-trigger').click();await showcase.locator('.ui-tree-select-menu').waitFor()}},
  {name:'selection-contract',viewport:{width:1280,height:1100},query:'theme=dark&direction=rtl&density=compact&state=selection',ready:'.visual-selection-showcase [data-selection-state-contract]'},
]
const selectedCases=requestedCases.length?cases.filter(item=>requestedCases.includes(item.name)):cases
if(requestedCases.length&&selectedCases.length!==requestedCases.length)throw new Error(`Unknown accessibility case: ${requestedCases.filter(name=>!selectedCases.some(item=>item.name===name)).join(', ')}`)
const tags=['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22a','wcag22aa','best-practice']
const {server,origin}=await startStaticFixtureServer(root,{entry:'visual-regression.html',outputDirName:'a11y-fixture-dist'})
let browser
let failed=0
try{
  const browserStarted=Date.now()
  browser=await runStage('suite','browser-launch',()=>launchBrowser(browserEngine))
  console.log(`A11Y SUITE stage=browser-launch elapsedMs=${Date.now()-browserStarted}`)
  for(const item of selectedCases){
    const caseStarted=Date.now()
    console.log(`A11Y START case=${item.name}`)
    let context
    let page
    try{
      context=await runStage(item.name,'context-create',()=>browser.newContext({viewport:item.viewport,deviceScaleFactor:1,colorScheme:item.name.startsWith('dark')||item.name.includes('rtl')?'dark':'light',locale:'en-US',reducedMotion:'reduce'}))
      page=await runStage(item.name,'page-create',()=>context.newPage())
      page.setDefaultTimeout(stageTimeout)
      page.setDefaultNavigationTimeout(Math.min(navigationTimeout,stageTimeout))
      await runStage(item.name,'navigate',()=>page.goto(`${origin}/visual-regression.html?${item.query}`,{waitUntil:'commit',timeout:Math.min(navigationTimeout,stageTimeout)}))
      await runStage(item.name,'visual-ready',()=>page.waitForSelector('body[data-visual-ready="true"]'))
      if(item.ready)await runStage(item.name,'case-ready',()=>page.waitForSelector(item.ready))
      if(item.prepare)await runStage(item.name,'prepare',()=>item.prepare(page))
      await runStage(item.name,'axe-script',()=>page.addScriptTag({content:axe.source}))
      const result=await runStage(item.name,'axe-evaluate',()=>page.evaluate(async ruleTags=>{
        const axeTimeout=new Promise((_,reject)=>setTimeout(()=>reject(new Error('A11Y page axe timeout')),15000))
        const evaluation=globalThis.axe.run(document,{runOnly:{type:'tag',values:ruleTags},resultTypes:['violations','incomplete','passes']})
        return Promise.race([evaluation,axeTimeout])
      },tags))
      const report={case:item.name,url:page.url(),axeVersion:result.testEngine.version,timestamp:result.timestamp,violations:result.violations,incomplete:result.incomplete,passes:result.passes.map(({id,impact,tags})=>({id,impact,tags}))}
      writeFileSync(resolve(reportDir,`${item.name}.json`),JSON.stringify(report,null,2)+'\n','utf8')
      if(result.violations.length){
        failed+=1
        console.error(`A11Y FAIL case=${item.name} stage=axe violations=${result.violations.length}`)
        for(const violation of result.violations)console.error(`- ${violation.id} impact=${violation.impact} nodes=${violation.nodes.length} ${violation.help}`)
      }else console.log(`A11Y PASS case=${item.name} violations=0 incomplete=${result.incomplete.length} passes=${result.passes.length} elapsedMs=${Date.now()-caseStarted}`)
    }catch(error){
      failed+=1
      console.error(`A11Y FAIL case=${item.name} stage=${error.a11yStage||'unknown'} error=${error?.stack||error}`)
    }finally{
      if(page){
        try{await runStage(item.name,'page-close',()=>page.close({runBeforeUnload:false}))}
        catch(error){failed+=1;console.error(`A11Y FAIL case=${item.name} stage=${error.a11yStage||'page-close'} error=${error?.stack||error}`)}
      }
      if(context){
        try{await runStage(item.name,'context-close',()=>context.close())}
        catch(error){failed+=1;console.error(`A11Y FAIL case=${item.name} stage=${error.a11yStage||'context-close'} error=${error?.stack||error}`)}
      }
    }
  }
  if(failed)process.exitCode=1
  else console.log(`ACCESSIBILITY_REGRESSION PASS cases=${selectedCases.length} axe=${axe.version} tags=${tags.length} platform=${process.platform}`)
}finally{
  if(browser){
    try{await runStage('suite','browser-close',()=>browser.close())}
    catch(error){failed+=1;console.error(`A11Y FAIL case=suite stage=${error.a11yStage||'browser-close'} error=${error?.stack||error}`)}
  }
  const serverCleanup=await closeBrowserResource(server,'a11y-server')
  if(serverCleanup){failed+=1;console.error(`A11Y FAIL case=suite stage=server-close error=${serverCleanup?.stack||serverCleanup}`)}
  if(failed)process.exitCode=1
}
