import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import axe from 'axe-core'
import { launchBrowser, startFixtureServer } from './browser-runtime.mjs'

const root=resolve(import.meta.dirname,'..')
const reportDir=resolve(root,'.verify/accessibility',process.platform)
mkdirSync(reportDir,{recursive:true})

const cases=[
  {name:'light-ltr-default',viewport:{width:1280,height:1100},query:'theme=light&direction=ltr&density=default'},
  {name:'dark-rtl-compact',viewport:{width:1280,height:1100},query:'theme=dark&direction=rtl&density=compact'},
  {name:'light-ltr-mobile',viewport:{width:390,height:1600},query:'theme=light&direction=ltr&density=default'},
  {name:'select-open',viewport:{width:1280,height:1100},query:'theme=light&direction=ltr&density=default',prepare:async page=>{await page.getByRole('combobox').first().click();await page.getByRole('listbox').waitFor()}},
  {name:'autocomplete-open',viewport:{width:1280,height:1100},query:'theme=light&direction=ltr&density=default',prepare:async page=>{await page.getByRole('combobox',{name:'Office city'}).click();await page.getByRole('listbox',{name:'Suggestions'}).waitFor()}},
  {name:'modal-open',viewport:{width:1280,height:1100},query:'theme=light&direction=ltr&density=default&state=modal',ready:'[role="dialog"][aria-modal="true"]'},
  {name:'drawer-rtl-open',viewport:{width:1280,height:1100},query:'theme=dark&direction=rtl&density=compact&state=drawer',ready:'[role="dialog"][aria-modal="true"]'},
  {name:'multi-select-open',viewport:{width:1280,height:1300},query:'theme=light&direction=ltr&density=default&state=advanced',prepare:async page=>{await page.locator('.ui-multi-select-trigger').click();await page.locator('.ui-multi-menu').waitFor()}},
  {name:'tree-select-open',viewport:{width:1280,height:1300},query:'theme=light&direction=ltr&density=default&state=advanced',prepare:async page=>{await page.locator('.ui-tree-trigger').click();await page.locator('.ui-tree-menu').waitFor()}},
  {name:'tree-enterprise',viewport:{width:1280,height:1300},query:'theme=light&direction=ltr&density=default&state=advanced',prepare:async page=>{await page.getByRole('tree',{name:'Resource permissions'}).focus()}},
  {name:'cascader-open',viewport:{width:1280,height:1300},query:'theme=dark&direction=rtl&density=compact&state=advanced',prepare:async page=>{await page.locator('.ui-cascader-trigger').click();await page.locator('.ui-cascader-menu').waitFor()}},
  {name:'command-palette-open',viewport:{width:1280,height:1300},query:'theme=light&direction=ltr&density=default&state=advanced',prepare:async page=>{await page.locator('#visual-command-trigger').click();await page.getByRole('dialog',{name:'Quick commands'}).waitFor()}},
  {name:'color-picker-open',viewport:{width:1280,height:1300},query:'theme=dark&direction=rtl&density=compact&state=advanced',prepare:async page=>{await page.locator('#visual-color-trigger').click();await page.getByRole('dialog',{name:'Color picker'}).waitFor()}},
]
const tags=['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22a','wcag22aa','best-practice']
const {server,origin}=await startFixtureServer(root)
let browser
let failed=0
try{
  browser=await launchBrowser()
  for(const item of cases){
    const context=await browser.newContext({viewport:item.viewport,deviceScaleFactor:1,colorScheme:item.name.startsWith('dark')||item.name.includes('rtl')?'dark':'light',locale:'en-US',reducedMotion:'reduce'})
    const page=await context.newPage()
    await page.goto(`${origin}/visual-regression.html?${item.query}`,{waitUntil:'networkidle'})
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
  else console.log(`ACCESSIBILITY_REGRESSION PASS cases=${cases.length} axe=${axe.version} tags=${tags.length} platform=${process.platform}`)
}finally{
  await browser?.close()
  await server.close()
}
