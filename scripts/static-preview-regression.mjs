import { resolve } from 'node:path'
import {
  launchBrowser,
  navigateFixture,
  resolveBrowserNavigationTimeout,
  startFixtureServer,
} from './browser-runtime.mjs'

const root=resolve(import.meta.dirname,'..')
const navigationTimeout=resolveBrowserNavigationTimeout()
const {server,origin}=await startFixtureServer(root)
let browser

function assert(condition,message){
  if(!condition)throw new Error(message)
}

try{
  browser=await launchBrowser('chromium')
  const page=await browser.newPage({viewport:{width:1440,height:1000}})
  const pageErrors=[]
  page.on('pageerror',error=>pageErrors.push(String(error)))

  await navigateFixture(page,`${origin}/component-preview.html#completion`,{timeout:navigationTimeout})
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
  assert(pageErrors.length===0,`Static preview emitted page errors: ${pageErrors.join(' | ')}`)

  console.log('STATIC_PREVIEW_REGRESSION PASS pageErrors=0 cascaderSearch=1 cascaderNative=1 transferSearch=1 transferNative=2 paginationQuick=65/65 paginationSize=50 paginationNext=2/26 tableKeyboard=current+selected keyboard=pass minimum=invalid')
}finally{
  await browser?.close()
  await server.close()
}
