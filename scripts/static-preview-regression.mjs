import { resolve } from 'node:path'
import {
  closeBrowserResource,
  combineBrowserErrors,
  createFixturePage,
  launchBrowserReady,
  startStaticFixtureServer,
} from './browser-runtime.mjs'

const root=resolve(import.meta.dirname,'..')
const {server,origin}=await startStaticFixtureServer(root,{entry:'component-preview.html',outputDirName:'preview-fixture-dist'})
let browser
let context
let primaryError

function assert(condition,message){
  if(!condition)throw new Error(message)
}

try{
  browser=await launchBrowserReady('chromium',{warmupUrl:`${origin}/component-preview.html#completion`,readySelector:'#previewCascaderTrigger',viewport:{width:1440,height:1000}})
  context=await browser.newContext({viewport:{width:1440,height:1000},locale:'en-US',reducedMotion:'reduce'})
  const page=await createFixturePage(context,`${origin}/component-preview.html#completion`,{readySelector:'#previewCascaderTrigger'})
  const pageErrors=[]
  page.on('pageerror',error=>pageErrors.push(String(error)))

  await page.locator('#previewCascaderTrigger').click()
  const panelOpen=await page.locator('#previewCascaderPanel').evaluate(element=>!element.hidden)
  assert(panelOpen,'Cascader trigger should open the popup panel')
  await page.locator('#previewCascaderSearch').fill('前端')

  const resultOptions=page.locator('#previewCascaderColumns [role="option"]')
  assert(await resultOptions.count()===1,'Cascader search should return one frontend path')
  await resultOptions.click()
  assert(await page.locator('#previewCascaderNative option:checked').count()===1,'Cascader selection should synchronize the native field')

  await page.locator('#previewCascaderSearch').press('Escape')
  assert(await page.locator('#previewCascaderPanel').evaluate(element=>element.hidden),'Escape should close the Cascader panel')
  await page.locator('#previewCascaderClear').click()
  assert(await page.locator('#previewCascaderState').textContent()==='minimum 1 · invalid','The minimum-selection state should be visible')

  await page.locator('#previewTransferLeftSearch').fill('键盘')
  const transferOptions=page.locator('#previewTransferLeft [role="option"]')
  assert(await transferOptions.count()===1,'Transfer search should return one keyboard resource')
  await page.locator('#previewTransferLeft').focus()
  await page.locator('#previewTransferLeft').press('Space')
  await page.locator('#previewTransferLeft').press('Enter')
  assert(await page.locator('#previewTransferNative option:checked').count()===2,'Transfer keyboard move should synchronize two native values')
  await page.locator('#previewTransferRightAll').click()
  await page.locator('#previewTransferLeftAction').click()
  assert(await page.locator('#previewTransferState').textContent()==='minimum 1 · invalid','Transfer minimum constraint should reject removing all target values')

  await page.locator('#previewPaginationJump').fill('999')
  await page.locator('#previewPaginationJump').press('Enter')
  assert((await page.locator('#previewPaginationState').textContent())?.includes('第 65 / 65 页 · quick-jump'),'Pagination quick jump should clamp to its last page')
  await page.locator('#previewPaginationSize').selectOption('50')
  assert((await page.locator('#previewPaginationTotal').textContent())?.includes('显示 1–50 条'),'Pagination size changes should reset the static preview to page one')
  await page.locator('#previewPaginationNext').click()
  assert((await page.locator('#previewPaginationState').textContent())?.includes('第 2 / 26 页 · next'),'Pagination next should publish the normalized page state')
  const staticTableRows=page.locator('#previewTableBody .preview-data-row')
  await staticTableRows.nth(0).focus()
  await staticTableRows.nth(0).press('ArrowDown')
  assert(await staticTableRows.nth(1).evaluate(element=>element.classList.contains('current')&&element.tabIndex===0),'Table ArrowDown should move the roving current row')
  await staticTableRows.nth(1).press('Space')
  assert(await staticTableRows.nth(1).locator('.preview-row-check').isChecked(),'Table Space should toggle row selection')
  assert((await page.locator('#previewTableState').textContent())?.includes('CUS-02 · keyboard'),'Table keyboard selection should publish the current row state')
  const previewDate=page.locator('#previewProductionDate')
  await previewDate.focus();await previewDate.press('ArrowDown')
  assert(!(await page.locator('#previewDatePanel').evaluate(element=>element.hidden)),'DatePicker ArrowDown should open its calendar panel')
  await page.locator('#previewDatePanel [data-preview-date="2026-08-25"]').dispatchEvent('click')
  assert(await previewDate.inputValue()==='2026-08-25','DatePicker calendar selection should synchronize the field')
  await previewDate.press('ArrowDown');await page.locator('#previewDatePanel').press('Escape')
  assert(await page.locator('#previewDatePanel').evaluate(element=>element.hidden),'DatePicker Escape should close the panel')
  const previewLayoutGrid=page.locator('#previewLayoutGrid'),previewLayoutState=page.locator('#previewLayoutState'),previewLayoutRtl=page.locator('#previewLayoutRtl')
  await page.locator('#previewLayoutColumns').selectOption('8')
  assert(await previewLayoutGrid.evaluate(element=>element.style.getPropertyValue('--grid-columns'))==='8','Layout preview columns should update the real grid variable')
  await page.locator('#previewLayoutMode').selectOption('auto-fit')
  assert(await previewLayoutGrid.getAttribute('class').then(value=>value.includes('mode-auto-fit')),'Layout preview should switch to auto-fit')
  await previewLayoutRtl.click()
  assert(await previewLayoutGrid.getAttribute('dir')==='rtl'&&(await previewLayoutState.textContent())?.includes('RTL'),'Layout preview RTL control should update direction and state')
  assert(await page.locator('#previewLayoutRoot .ui-space-separator').count()===2,'Layout preview should keep separators between rendered items')

  await page.locator('#previewDateClear').dispatchEvent('click')
  assert(await previewDate.inputValue()===''&&(await page.locator('#previewDateState').textContent())?.includes('clear'),'DatePicker clear should publish empty state')
  const previewRangeStart=page.locator('#previewDateRangeStart'),previewRangeEnd=page.locator('#previewDateRangeEnd'),previewRangePanel=page.locator('#previewDateRangePanel'),previewRangeToggle=page.locator('#previewDateRangeToggle'),previewRangeState=page.locator('#previewDateRangeState')
  await previewRangeToggle.click()
  assert(!(await previewRangePanel.evaluate(element=>element.hidden)),'DateRangePicker toggle should open its real panel')
  const previewRangeStartDay=page.locator('#previewDateRangePanel [data-preview-range-date="2026-08-20"]'),previewRangeEndDay=page.locator('#previewDateRangePanel [data-preview-range-date="2026-08-24"]')
  await previewRangeStartDay.dispatchEvent('click')
  assert(!(await previewRangePanel.evaluate(element=>element.hidden))&&await previewRangeStart.inputValue()==='2026-08-20'&&await previewRangeEnd.inputValue()===''&&(await previewRangeState.textContent())?.includes('start pending'),'DateRangePicker first selection should keep the panel open with a pending start')
  await previewRangeEndDay.dispatchEvent('click')
  assert(await previewRangePanel.evaluate(element=>element.hidden)&&await previewRangeEnd.inputValue()==='2026-08-24'&&(await previewRangeState.textContent())?.includes('complete'),'DateRangePicker second selection should commit and close the complete range')
  await previewRangeToggle.click();await previewRangePanel.press('Escape')
  assert(await previewRangePanel.evaluate(element=>element.hidden),'DateRangePicker Escape should close the panel')
  await previewRangeToggle.click();const previewRangePreset=page.locator('[data-preview-range-preset="release"]');await previewRangePreset.dispatchEvent('click')
  assert(await previewRangeStart.inputValue()==='2026-08-20'&&await previewRangeEnd.inputValue()==='2026-08-24','DateRangePicker preset should publish its complete range')
  await previewRangeToggle.click();await page.locator('#previewDateRangeClear').dispatchEvent('click')
  assert(await previewRangeStart.inputValue()===''&&await previewRangeEnd.inputValue()===''&&(await previewRangeState.textContent())?.includes('start pending'),'DateRangePicker clear should reset the range state')
  const previewFloatTrigger=page.locator('#previewFloatTrigger'),previewFloatActions=page.locator('#previewFloatActions'),previewFloatState=page.locator('#previewFloatState')
  await previewFloatTrigger.click()
  assert(!(await previewFloatActions.evaluate(element=>element.hidden))&&await previewFloatTrigger.getAttribute('aria-expanded')==='true','FloatButton trigger should open the static speed dial')
  await page.locator('#previewFloatActions [data-preview-float-action="new"]').click()
  assert((await previewFloatState.textContent())?.includes('selected · new')&&await previewFloatActions.evaluate(element=>element.hidden),'FloatButton selection should close the speed dial')
  await previewFloatTrigger.click();await previewFloatTrigger.press('Escape')
  assert(await previewFloatActions.evaluate(element=>element.hidden),'FloatButton Escape should close the speed dial')
  await page.locator('#previewBackTop').click()
  assert((await previewFloatState.textContent())?.includes('back-top · activated'),'FloatButton back-to-top should publish activation state')
  const previewSkeleton=page.locator('#previewSkeleton'),previewSkeletonToggle=page.locator('#previewSkeletonToggle'),previewSkeletonState=page.locator('#previewSkeletonState')
  assert(await previewSkeleton.getAttribute('role')==='status'&&await previewSkeleton.getAttribute('aria-busy')==='true','Skeleton preview should expose status/busy semantics while loading')
  await previewSkeletonToggle.click()
  assert(await previewSkeleton.getAttribute('role')===null&&await previewSkeleton.getAttribute('aria-busy')==='false'&&await page.locator('#previewSkeletonLoaded').isVisible(),'Skeleton preview toggle should replace placeholder with loaded content')
  assert((await previewSkeletonState.textContent())?.trim()==='content','Skeleton preview should publish content state')
  await previewSkeletonToggle.click()
  assert(await previewSkeleton.getAttribute('role')==='status'&&await previewSkeleton.getAttribute('aria-busy')==='true'&& (await previewSkeletonState.textContent())?.trim()==='loading','Skeleton preview should restore loading semantics')
  assert(pageErrors.length===0,`Static preview emitted page errors: ${pageErrors.join(' | ')}`)

  console.log('STATIC_PREVIEW_REGRESSION PASS pageErrors=0 cascaderSearch=1 cascaderNative=1 transferSearch=1 transferNative=2 paginationQuick=65/65 paginationSize=50 paginationNext=2/26 tableKeyboard=current+selected datePicker=keyboard+selection+escape+clear dateRange=preview+complete+preset+escape+clear floatButton=open+select+escape+backtop layout=columns+mode+rtl+separator skeleton=loading+content+loading keyboard=pass minimum=invalid')
}catch(error){
  primaryError=error
}finally{
  const cleanupErrors=[]
  const contextCleanup=await closeBrowserResource(context,'preview-context')
  if(contextCleanup)cleanupErrors.push(contextCleanup)
  const browserCleanup=await closeBrowserResource(browser,'preview-browser')
  if(browserCleanup)cleanupErrors.push(browserCleanup)
  const serverCleanup=await closeBrowserResource(server,'preview-server')
  if(serverCleanup)cleanupErrors.push(serverCleanup)
  const combined=combineBrowserErrors(primaryError,cleanupErrors,'static preview regression')
  if(combined)throw combined
}
