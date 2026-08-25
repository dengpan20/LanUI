import assert from 'node:assert/strict'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { launchBrowser, navigateFixture, resolveBrowserNavigationTimeout, startFixtureServer } from './browser-runtime.mjs'

const root = resolve(import.meta.dirname, '..')
const reportDir = resolve(root, '.verify/interaction', process.platform)
mkdirSync(reportDir, { recursive: true })
const browserArgument=process.argv.find(argument=>argument.startsWith('--browser='))?.split('=')[1]
const requestedBrowsers=browserArgument||process.env.LAN_UI_INTERACTION_BROWSERS||'chromium'
const browserNames=requestedBrowsers==='all'?['chromium','firefox','webkit']:[...new Set(requestedBrowsers.split(',').map(value=>value.trim()).filter(Boolean))]
for(const browserName of browserNames)if(!['chromium','firefox','webkit'].includes(browserName))throw new Error(`Unsupported interaction browser: ${browserName}`)
const caseArgument=process.argv.find(argument=>argument.startsWith('--case='))?.slice('--case='.length)
const navigationTimeout=resolveBrowserNavigationTimeout()

const allCases = [
  {
    name:'product-tour-rtl-keyboard',
    query:'direction=rtl',
    run:async page=>{
      const trigger=page.locator('#open-product-tour')
      await trigger.click()
      const dialog=page.getByRole('dialog',{name:'Release product tour'})
      await dialog.waitFor()
      assert.equal(await dialog.getAttribute('aria-modal'),'true')
      assert.match(await page.locator('#tour-target-create').getAttribute('aria-describedby'),/ui-tour-/)
      await dialog.focus()
      await page.keyboard.press('ArrowLeft')
      await expectText(page,'tour-output','change:1:next')
      assert.match(await dialog.innerText(),/Preview the release/)
      await dialog.focus()
      await page.keyboard.press('End')
      await expectText(page,'tour-output','change:2:keyboard')
      await dialog.getByRole('button',{name:'Finish'}).click()
      await expectText(page,'tour-output','close:finish:2')
      await dialog.waitFor({state:'hidden'})
      await expectFocused(page,trigger)
    },
  },
  {
    name: 'color-picker-keyboard',
    run: async page => {
      const trigger = page.getByRole('button', { name: 'Brand color' })
      await trigger.click()
      const dialog = page.getByRole('dialog', { name: 'Color picker' })
      const plane = dialog.getByRole('slider', { name: 'Saturation and brightness' })
      await plane.waitFor()
      assert.equal(await trigger.getAttribute('aria-expanded'), 'true')
      await page.keyboard.press('End')
      await page.keyboard.press('ArrowDown')
      const input = dialog.getByRole('textbox', { name: 'Color value' })
      await input.fill('#FF000080')
      await page.keyboard.press('Enter')
      await expectText(page, 'color-output', '#FF000080')
      await page.keyboard.press('Escape')
      await dialog.waitFor({ state:'hidden' })
      await expectFocused(page, trigger)
    },
  },
  {
    name: 'command-palette-keyboard',
    run: async page => {
      const trigger = page.locator('#open-command-palette')
      await trigger.click()
      const input = page.getByRole('combobox', { name: 'Command palette' })
      await input.waitFor()
      assert.equal(await page.getByRole('dialog', { name:'Quick commands' }).getAttribute('aria-modal'), 'true')
      await input.fill('sett')
      await page.keyboard.press('Enter')
      await expectText(page, 'command-output', 'settings')
      await expectFocused(page, trigger)
      await page.keyboard.press('Control+k')
      await input.waitFor()
      await page.keyboard.press('Escape')
      await expectFocused(page, trigger)
    },
  },
  {
    name: 'tree-enterprise-keyboard',
    run: async page => {
      const tree = page.getByRole('tree', { name: 'Fixture resources' })
      await tree.focus()
      await page.keyboard.press('ArrowRight')
      await page.keyboard.press('ArrowDown')
      await page.keyboard.press('ArrowRight')
      await page.keyboard.press('ArrowRight')
      await page.keyboard.press('Space')
      await expectText(page, 'tree-output', 'selected=empty checked=settings,security loads=0')
      await page.keyboard.press('Enter')
      await expectText(page, 'tree-output', 'selected=security checked=settings,security loads=0')
      await page.keyboard.press('End')
      await page.keyboard.press('ArrowRight')
      await page.getByRole('treeitem', { name:/Remote child/ }).waitFor()
      await expectText(page, 'tree-output', 'selected=security checked=settings,security loads=1')
      assert.equal(await tree.getAttribute('aria-busy'), null)
    },
  },
  {
    name: 'autocomplete-keyboard',
    run: async page => {
      const input = page.getByRole('combobox', { name: 'Office city' })
      await input.fill('bei')
      const listbox = page.getByRole('listbox', { name: 'Suggestions' })
      await listbox.waitFor()
      assert.match(await input.getAttribute('aria-activedescendant'), /ui-autocomplete-option-/)
      await page.keyboard.press('Enter')
      await expectText(page, 'autocomplete-output', 'beijing')
      assert.equal(await input.getAttribute('aria-expanded'), 'false')
      assert.equal(await input.inputValue(), 'Beijing')
    },
  },
  {
    name: 'select-keyboard',
    run: async page => {
      const trigger = page.getByRole('combobox', { name: 'Region' })
      await trigger.focus()
      await page.keyboard.press('ArrowDown')
      await page.locator('.ui-select-menu [role="listbox"]').waitFor()
      assert.equal(await trigger.getAttribute('aria-expanded'), 'true')
      await page.keyboard.press('ArrowDown')
      await page.keyboard.press('Enter')
      await expectText(page, 'select-output', 'north')
      assert.equal(await trigger.getAttribute('aria-expanded'), 'false')
      assert.equal(await trigger.evaluate(node => node === document.activeElement), true)
    },
  },
  {
    name: 'number-input-keyboard',
    run: async page => {
      const spinbutton = page.getByRole('spinbutton', { name: 'Quantity' })
      await spinbutton.focus()
      await page.keyboard.press('ArrowUp')
      await expectText(page, 'number-output', '12.75')
      await page.keyboard.press('PageDown')
      await expectText(page, 'number-output', '10.25')
      await page.keyboard.press('End')
      await expectText(page, 'number-output', '100.00')
      await page.keyboard.press('Home')
      await expectText(page, 'number-output', '0.00')
      assert.equal(await spinbutton.getAttribute('aria-valuenow'), '0')
    },
  },
  {
    name: 'slider-keyboard',
    run: async page => {
      const volume = page.getByRole('slider', { name: 'Volume' })
      await volume.focus()
      await page.keyboard.press('ArrowRight')
      await expectText(page, 'slider-output', '45 / 20-80')
      await page.keyboard.press('PageUp')
      await expectText(page, 'slider-output', '95 / 20-80')
      await page.keyboard.press('Home')
      await expectText(page, 'slider-output', '0 / 20-80')
      const start = page.getByRole('slider', { name: 'Price start' })
      await start.focus()
      for(let index=0;index<20;index+=1)await page.keyboard.press('ArrowRight')
      await expectText(page, 'slider-output', '0 / 60-80')
      assert.equal(await start.getAttribute('aria-valuenow'), '60')
    },
  },
  {
    name: 'rate-keyboard',
    run: async page => {
      const rate = page.getByRole('slider', { name: 'Service rating' })
      await rate.focus()
      await page.keyboard.press('ArrowRight')
      await expectText(page, 'rate-output', '4.0')
      await page.keyboard.press('PageDown')
      await expectText(page, 'rate-output', '1.5')
      await page.keyboard.press('End')
      await expectText(page, 'rate-output', '5.0')
      await page.keyboard.press('Delete')
      await expectText(page, 'rate-output', '0.0')
      assert.equal(await rate.getAttribute('aria-valuenow'), '0')
      assert.equal(await rate.getAttribute('aria-valuetext'), 'Not rated')
    },
  },
  {
    name: 'statistic-live-update',
    run: async page => {
      const statistic=page.getByRole('group',{name:'Revenue'})
      const output=statistic.locator('output')
      assert.equal(await output.getAttribute('aria-live'),'polite')
      assert.equal(await output.getAttribute('aria-label'),'$1,000')
      assert.equal(await statistic.locator('.ui-statistic-trend').getAttribute('aria-label'),'Up 5%')
      await page.locator('#refresh-statistic').click()
      assert.equal(await statistic.getAttribute('aria-busy'),'true')
      assert.equal(await output.getAttribute('aria-label'),'Loading statistic')
      await expectText(page,'statistic-output','1250 / -2.5 / ready')
      assert.equal(await statistic.getAttribute('aria-busy'),null)
      assert.equal(await output.getAttribute('aria-label'),'$1,250')
      assert.equal(await statistic.locator('.ui-statistic-trend').getAttribute('aria-label'),'Down 2.5%')
    },
  },
  {
    name: 'calendar-range-keyboard',
    run: async page => {
      const calendar=page.getByRole('region',{name:'Release calendar'})
      const start=calendar.locator('[data-date="2026-08-12"]')
      await start.focus()
      await page.keyboard.press('PageDown')
      assert.equal(await calendar.getByRole('grid').getAttribute('aria-label'),'September 2026')
      const septemberStart=calendar.locator('[data-date="2026-09-12"]')
      assert.equal(await septemberStart.getAttribute('tabindex'),'0')
      await page.keyboard.press('Enter')
      await expectText(page,'calendar-output','2026-09-12')
      await page.keyboard.press('ArrowRight')
      await page.keyboard.press('Enter')
      await expectText(page,'calendar-output','2026-09-12 to 2026-09-13')
      assert.equal(await calendar.locator('[data-date="2026-09-12"]').getAttribute('aria-selected'),'true')
      await page.keyboard.press('Delete')
      await expectText(page,'calendar-output','empty')
    },
  },
  {
    name: 'image-preview-keyboard',
    run: async page => {
      const opener=page.getByRole('button',{name:'Preview image: Interaction gallery'})
      await opener.click()
      const dialog=page.getByRole('dialog',{name:'Interaction gallery'})
      await dialog.waitFor()
      await expectText(page,'image-output','open / 0')
      assert.equal(await page.getByRole('button',{name:'Close image preview'}).evaluate(node=>node===document.activeElement),true)
      await page.keyboard.press('ArrowRight')
      await expectText(page,'image-output','open / 1')
      assert.equal(await dialog.locator('.ui-image-preview-media').getAttribute('alt'),'Interaction gallery')
      await page.keyboard.press('+')
      assert.equal((await page.getByRole('button',{name:'Reset image transform'}).innerText()).trim(),'125%')
      await page.keyboard.press('r')
      assert.match(await dialog.locator('.ui-image-preview-media').getAttribute('style'),/rotate\(90deg\)/)
      await page.keyboard.press('Shift+Tab')
      assert.equal(await page.getByRole('button',{name:'Rotate right'}).evaluate(node=>node===document.activeElement),true)
      await page.keyboard.press('Escape')
      await dialog.waitFor({state:'hidden'})
      await expectText(page,'image-output','closed / 1')
      await expectFocused(page,opener)
    },
  },
  {
    name: 'tabs-ltr-keyboard',
    run: async page => {
      await page.getByRole('tab', { name: 'Overview' }).focus()
      await page.keyboard.press('ArrowRight')
      await expectText(page, 'tabs-output', 'usage')
      assert.equal(await page.getByRole('tab', { name: 'Usage' }).getAttribute('aria-selected'), 'true')
      await page.keyboard.press('End')
      await expectText(page, 'tabs-output', 'api')
    },
  },
  {
    name: 'tabs-rtl-keyboard',
    query: 'direction=rtl',
    run: async page => {
      await page.getByRole('tab', { name: 'Overview' }).focus()
      await page.keyboard.press('ArrowLeft')
      await expectText(page, 'tabs-output', 'usage')
      assert.equal(await page.getByRole('tab', { name: 'Usage' }).evaluate(node => node === document.activeElement), true)
    },
  },
  {
    name: 'modal-focus-trap-restore',
    run: async page => {
      const opener = page.locator('#open-modal')
      await opener.click()
      const dialog = page.getByRole('dialog', { name: 'Review changes' })
      await dialog.waitFor()
      const first = dialog.locator('button').first()
      const last = dialog.getByRole('button', { name: 'Confirm' })
      assert.equal(await first.evaluate(node => node === document.activeElement), true)
      await page.keyboard.press('Shift+Tab')
      assert.equal(await last.evaluate(node => node === document.activeElement), true)
      await page.keyboard.press('Tab')
      assert.equal(await first.evaluate(node => node === document.activeElement), true)
      await page.keyboard.press('Escape')
      await dialog.waitFor({ state: 'hidden' })
      await expectFocused(page, opener)
    },
  },
  {
    name: 'nested-overlay-stack',
    run: async page => {
      const modalOpener = page.locator('#open-modal')
      await modalOpener.click()
      const modal = page.getByRole('dialog', { name: 'Review changes' })
      const drawerOpener = modal.locator('#open-drawer')
      await drawerOpener.click()
      const drawer = page.getByRole('dialog', { name: 'Change details' })
      await drawer.waitFor()
      await page.keyboard.press('Escape')
      await drawer.waitFor({ state: 'hidden' })
      assert.equal(await modal.isVisible(), true)
      await expectFocused(page, drawerOpener)
      await page.keyboard.press('Escape')
      await modal.waitFor({ state: 'hidden' })
      await expectFocused(page, modalOpener)
    },
  },
  {
    name: 'popconfirm-cancel-confirm',
    run: async page => {
      const trigger = page.locator('#delete-record')
      await trigger.click()
      const dialog = page.getByRole('alertdialog', { name: 'Delete record?' })
      await dialog.waitFor()
      await expectFocused(page, dialog.getByRole('button', { name: 'Cancel' }))
      await page.keyboard.press('Escape')
      await dialog.waitFor({ state: 'hidden' })
      await expectText(page, 'confirm-output', 'cancelled')
      assert.equal(await trigger.evaluate(node => node === document.activeElement), true)
      await trigger.click()
      await dialog.getByRole('button', { name: 'Confirm' }).click()
      await dialog.waitFor({ state: 'hidden' })
      await expectText(page, 'confirm-output', 'confirmed')
      assert.equal(await trigger.evaluate(node => node === document.activeElement), true)
    },
  },
  {
    name: 'pagination-switch',
    run: async page => {
      const paginationCase = page.locator('.interaction-pagination-case')
      await paginationCase.getByRole('button', { name: 'Next page' }).click()
      await expectText(page, 'pagination-output', '2 / 10')
      assert.equal(await paginationCase.getByRole('button', { name: 'Page 2, current page', exact: true }).getAttribute('aria-current'), 'page')
      const size = paginationCase.locator('.ui-pagination-size [role="combobox"]')
      await size.focus()
      await page.keyboard.press('ArrowDown')
      await page.keyboard.press('ArrowDown')
      await page.keyboard.press('Enter')
      await expectText(page, 'pagination-output', '1 / 20')
      const toggle = page.getByRole('switch', { name: 'Enable notifications' })
      await toggle.focus()
      await page.keyboard.press('Space')
      await expectText(page, 'switch-output', 'enabled')
      assert.equal(await toggle.getAttribute('aria-checked'), 'true')
    },
  },
  {
    name:'pagination-production-window-quick-size-guard-api-rtl',
    query:'direction=rtl',
    run:async page=>{
      const section=page.locator('.interaction-pagination-production-case')
      const pagination=section.getByRole('navigation',{name:'Production release pages'})
      await pagination.getByRole('button',{name:'Page 50, current page'}).press('ArrowLeft')
      await expectText(page,'pagination-production-output','change:keyboard:51:20')
      await pagination.getByRole('button',{name:/Jump forward/}).click()
      await expectText(page,'pagination-production-output','change:jump-forward:54:20')
      const jump=pagination.getByRole('spinbutton',{name:'Enter a page to jump to'})
      await jump.fill('999')
      await jump.press('Enter')
      await expectText(page,'pagination-production-output','change:quick-jump:65:20')
      const size=pagination.locator('.ui-pagination-size [role="combobox"]')
      await size.click()
      await page.getByRole('option',{name:'50',exact:true}).click()
      await expectText(page,'pagination-production-output','change:size:26:50')
      await pagination.getByRole('button',{name:'First page'}).click()
      await expectText(page,'pagination-production-output','change:pointer:1:50')
      await section.locator('#production-pagination-api-next').click()
      await expectText(page,'pagination-production-output','change:api:2:50')
      await jump.fill('13')
      await jump.press('Enter')
      await expectText(page,'pagination-production-output','invalid:guard-rejected:2:50')
      assert.equal(await pagination.getByRole('button',{name:'Page 2, current page'}).getAttribute('aria-current'),'page')
    },
  },
  {
    name:'table-production-selection-expansion-filter-resize-keyboard-api-rtl',
    query:'direction=rtl',
    run:async page=>{
      const section=page.locator('.interaction-table-production-case')
      const table=section.getByRole('table',{name:'Production table evidence'})
      const rows=table.locator('tbody .ui-table-row')
      await rows.nth(0).focus()
      await page.keyboard.press('ArrowDown')
      await expectFocused(page,rows.nth(1))
      await page.keyboard.press('Space')
      await expectText(page,'production-table-output','selection:keyboard:table-1,table-2')
      await page.keyboard.press('Enter')
      await expectText(page,'production-table-output','expand:keyboard:table-2')
      assert.equal(await rows.nth(1).getAttribute('aria-current'),'true')
      assert.equal(await rows.nth(1).getAttribute('aria-selected'),'true')

      const filter=table.getByRole('button',{name:'Filter Status'})
      await filter.focus()
      await page.keyboard.press('Enter')
      const menu=table.getByRole('menu',{name:'Status filter options'})
      await menu.waitFor()
      await expectFocused(page,menu.getByRole('menuitemradio',{name:'All'}))
      await page.keyboard.press('ArrowDown')
      await page.keyboard.press('ArrowDown')
      await expectFocused(page,menu.getByRole('menuitemradio',{name:'Review'}))
      await page.keyboard.press('Enter')
      await expectText(page,'production-table-output','filter:keyboard:Review')
      await expectFocused(page,filter)

      const separator=table.getByRole('separator',{name:'Resize Evidence column'})
      await separator.focus()
      await page.keyboard.press('ArrowLeft')
      await expectText(page,'production-table-output','resize:keyboard:name:216')
      await section.locator('#interaction-production-table-api-width').click()
      await expectText(page,'production-table-output','resize:fixture-api:name:256')
      await section.locator('#interaction-production-table-api-select').click()
      await expectText(page,'production-table-output','invalid:guard-rejected:selection')
      assert.deepEqual(await table.locator('tbody .ui-table-row.selected').evaluateAll(nodes=>nodes.map(node=>node.dataset.rowKey)),['table-1','table-2'])
    },
  },
  {
    name:'date-picker-production-calendar-presets-guards-keyboard-api-rtl',
    query:'direction=rtl',
    run:async page=>{
      const section=page.locator('.interaction-date-picker-production-case')
      const input=section.locator('#interaction-production-date-picker')
      await input.focus()
      await page.keyboard.press('ArrowDown')
      const panel=section.getByRole('dialog',{name:'Date picker calendar'})
      await panel.waitFor()
      assert.equal(await section.locator('.calendar-action').getAttribute('aria-expanded'),'true')
      await panel.locator('.ui-calendar-day[data-date="2026-08-25"]').click()
      await expectText(page,'production-date-picker-output','open:selection:false / 2026-08-25 / closed / 2026-08-01')
      await input.focus()
      await page.keyboard.press('ArrowDown')
      await section.getByRole('button',{name:'Guarded day'}).click()
      await expectText(page,'production-date-picker-output','invalid:guard-rejected:preset / 2026-08-25 / open / 2026-08-01')
      await page.keyboard.press('Escape')
      await expectText(page,'production-date-picker-output','open:escape:false / 2026-08-25 / closed / 2026-08-01')
      await section.locator('#interaction-production-date-picker-api').click()
      await expectText(page,'production-date-picker-output','change:api:2026-09-08 / 2026-09-08 / closed / 2026-08-01')
      await section.locator('#interaction-production-date-picker-clear').click()
      await expectTextContains(page,'production-date-picker-output','change:api:')
      assert.equal(await section.locator('.calendar-action').getAttribute('aria-haspopup'),'dialog')
    },
  },
  {
    name:'date-range-picker-production-preview-complete-escape-api',
    run:async page=>{
      const section=page.locator('.interaction-date-range-production-case')
      const range=section.getByRole('group',{name:'Production release window'})
      const start=range.locator('input').first()
      await start.focus()
      await page.keyboard.press('ArrowDown')
      const panel=section.getByRole('dialog',{name:'Date picker calendar'})
      await panel.waitFor()
      assert.equal(await range.locator('.calendar-action').getAttribute('aria-expanded'),'true')
      await panel.locator('.ui-calendar-day[data-date="2026-08-20"]').click()
      await expectText(page,'production-date-range-output','change:calendar:false:2026-08-20 / 2026-08-20 / open / 2026-08-01')
      assert.equal(await range.getAttribute('data-state'),'open')
      await panel.locator('.ui-calendar-day[data-date="2026-08-24"]').click()
      await expectText(page,'production-date-range-output','change:calendar:true:2026-08-20:2026-08-24 / 2026-08-20:2026-08-24 / closed / 2026-08-01')
      assert.equal(await range.getAttribute('data-state'),'closed')
      await start.focus();await page.keyboard.press('ArrowDown');await panel.waitFor();await page.keyboard.press('Escape')
      assert.equal(await range.getAttribute('data-state'),'closed')
      await section.locator('#interaction-production-date-range-api').click()
      await expectText(page,'production-date-range-output','change:api:true:2026-08-20:2026-08-24 / 2026-08-20:2026-08-24 / closed / 2026-08-01')
      await section.locator('#interaction-production-date-range-clear').click()
      await expectTextContains(page,'production-date-range-output','change:api:true:')
    },
  },
  {
    name:'select-production-search-native-keyboard-api',
    run:async page=>{
      const section=page.locator('.interaction-select-production-case')
      const trigger=section.locator('#interaction-production-select')
      const select=trigger.locator('..')
      await trigger.click()
      const search=select.locator('.ui-select-search input')
      await search.fill('global')
      assert.equal(await select.getByRole('option').count(),1)
      await page.keyboard.press('Enter')
      await expectText(page,'production-select-output','select:keyboard:global')
      assert.equal(await select.locator('select[name="releaseCluster"]').inputValue(),'global')
      await select.locator('.ui-select-clear').click()
      await expectText(page,'production-select-output','clear:clear:')
      await trigger.focus()
      await page.keyboard.press('ArrowDown')
      await select.locator('[role="listbox"]').waitFor()
      await page.keyboard.press('End')
      assert.match(await select.locator('[role="option"].active').innerText(),/Global cluster/)
      await page.keyboard.press('Enter')
      await expectText(page,'production-select-output','select:keyboard:global')
      await section.locator('#interaction-production-select-api').click()
      await expectText(page,'production-select-output','select:fixture-api:east')
      await section.locator('#interaction-production-readonly-select').click()
      await expectText(page,'production-select-output','invalid:readonly')
      const remoteTrigger=section.locator('#interaction-production-remote-select')
      const remote=remoteTrigger.locator('..')
      await remoteTrigger.click()
      await remote.locator('.ui-select-search input').fill('next')
      const remoteOption=remote.getByRole('option',{name:/Next lane/})
      await remoteOption.waitFor()
      await remoteOption.click()
      await expectText(page,'production-select-output','remote:pointer:next')
    },
  },
  {
    name:'multi-select-production-array-limits-search-native-api',
    run:async page=>{
      const section=page.locator('.interaction-multi-select-production-case')
      const trigger=section.locator('#interaction-production-multi-select')
      const multi=trigger.locator('..')
      await trigger.click()
      const search=multi.locator('.ui-multi-search input')
      await search.fill('global')
      assert.equal(await multi.getByRole('option').count(),1)
      await page.keyboard.press('Enter')
      await expectText(page,'production-multi-select-output','multi:keyboard:east,global')
      assert.deepEqual(await multi.locator('select[name="releaseClusters"]').evaluate(element=>[...element.selectedOptions].map(option=>option.value)),['east','global'])
      assert.equal(await multi.getByRole('option',{name:/North cluster/}).getAttribute('aria-disabled'),'true')
      await section.locator('#interaction-production-multi-select-api').click()
      await expectText(page,'production-multi-select-output','max:2:east,global')
      await multi.locator('.ui-multi-tag button').first().click()
      await expectText(page,'production-multi-select-output','remove:tag:east')
      await section.locator('#interaction-production-multi-select-api').click()
      await expectText(page,'production-multi-select-output','multi:fixture-api:global,north')
      await trigger.focus()
      await page.keyboard.press('Backspace')
      await expectText(page,'production-multi-select-output','remove:backspace:north')
      if(await multi.locator('.ui-multi-select-all').count()===0)await trigger.click()
      await multi.locator('.ui-multi-select-all').click()
      await expectText(page,'production-multi-select-output','all:true:global,east')
      await section.locator('#interaction-production-multi-select-close-api').click({force:true})
      assert.equal(await trigger.getAttribute('aria-expanded'),'false')
      await section.locator('#interaction-production-readonly-multi-select').click()
      await expectText(page,'production-multi-select-output','invalid:readonly')
      const remoteTrigger=section.locator('#interaction-production-remote-multi-select')
      const remote=remoteTrigger.locator('..')
      await remoteTrigger.click()
      await remote.locator('.ui-multi-search input').fill('next')
      const remoteOption=remote.getByRole('option',{name:/Next lane/})
      await remoteOption.waitFor()
      await remoteOption.click()
      await expectText(page,'production-multi-select-output','remote:pointer:next')
    },
  },
  {
    name:'tree-select-production-hierarchy-search-lazy-native-api',
    run:async page=>{
      const section=page.locator('.interaction-tree-select-production-case')
      const trigger=section.locator('#interaction-production-tree-select')
      const treeSelect=trigger.locator('..')
      await trigger.click()
      const search=treeSelect.locator('.ui-tree-select-search input')
      await search.fill('backend')
      assert.equal(await treeSelect.getByRole('treeitem').count(),2)
      await treeSelect.getByRole('treeitem',{name:/Backend platform/}).getByRole('button',{name:/Backend platform/}).click()
      await expectText(page,'production-tree-select-output','tree:pointer:frontend,backend,product')
      assert.deepEqual(await treeSelect.locator('select[name="deliveryTeams"]').evaluate(element=>[...element.selectedOptions].map(option=>option.value)),['product','frontend','backend'])
      await section.locator('#interaction-production-tree-select-api').click()
      await expectText(page,'production-tree-select-output','invalid:max-count')
      await treeSelect.locator('.ui-tree-select-tag button').filter({hasText:''}).first().click()
      await expectText(page,'production-tree-select-output','tree:tag:backend')
      await section.locator('#interaction-production-tree-select-api').click()
      await expectText(page,'production-tree-select-output','tree:fixture-api:backend,design,experience')
      await section.locator('#interaction-production-tree-select-load-api').click()
      await expectText(page,'production-tree-select-output','expand:fixture-api:experience:true')
      await section.locator('#interaction-production-tree-select-close-api').click({force:true})
      assert.equal(await trigger.getAttribute('aria-expanded'),'false')
      await section.locator('#interaction-production-readonly-tree-select').click()
      await expectText(page,'production-tree-select-output','invalid:readonly')
      const lazyTrigger=section.locator('#interaction-production-lazy-tree-select')
      await lazyTrigger.click()
      const lazy=lazyTrigger.locator('..')
      await lazy.getByRole('button',{name:/Remote organization/}).first().click()
      await lazy.getByRole('treeitem',{name:/Remote child/}).waitFor()
      await expectText(page,'production-tree-select-output','load:remote:1')
      await page.locator('#interaction-tree-select-form').evaluate(form=>form.reset())
      await expectText(page,'production-tree-select-output','tree:reset:frontend')
      assert.deepEqual(await treeSelect.locator('select[name="deliveryTeams"]').evaluate(element=>[...element.selectedOptions].map(option=>option.value)),['frontend'])
    },
  },
  {
    name:'cascader-production-path-search-lazy-native-api',
    run:async page=>{
      const section=page.locator('.interaction-cascader-production-case')
      const trigger=section.locator('#interaction-production-cascader')
      const cascader=trigger.locator('..')
      await trigger.click()
      const search=cascader.locator('.ui-cascader-search input')
      await search.fill('backend')
      assert.equal(await cascader.getByRole('option').count(),1)
      await cascader.getByRole('option',{name:/Backend services/}).click()
      await expectText(page,'production-cascader-output','cascader:search:2')
      assert.deepEqual(await cascader.locator('select[name="deliveryPaths"]').evaluate(element=>[...element.selectedOptions].map(option=>option.value)),['product / platform / frontend','product / platform / backend'])
      await section.locator('#interaction-production-cascader-api').click()
      await expectText(page,'production-cascader-output','invalid:max-count')
      await cascader.locator('.ui-cascader-tag button').first().click()
      await expectText(page,'production-cascader-output','cascader:tag:1')
      await section.locator('#interaction-production-cascader-api').click()
      await expectText(page,'production-cascader-output','cascader:fixture-api:2')
      await section.locator('#interaction-production-cascader-close-api').click({force:true})
      assert.equal(await trigger.getAttribute('aria-expanded'),'false')
      await section.locator('#interaction-production-readonly-cascader').click()
      await expectText(page,'production-cascader-output','invalid:readonly')
      const lazyTrigger=section.locator('#interaction-production-lazy-cascader')
      await lazyTrigger.click()
      const lazy=lazyTrigger.locator('..')
      await lazy.getByRole('option',{name:/Remote regions/}).click()
      await lazy.getByRole('option',{name:/Remote site/}).waitFor()
      await expectText(page,'production-cascader-output','load:remote-regions:1')
      await page.locator('#interaction-cascader-form').evaluate(form=>form.reset())
      await expectText(page,'production-cascader-output','cascader:reset:1')
      assert.deepEqual(await cascader.locator('select[name="deliveryPaths"]').evaluate(element=>[...element.selectedOptions].map(option=>option.value)),['product / platform / frontend'])
    },
  },
  {
    name:'transfer-production-search-limits-virtual-native-api',
    run:async page=>{
      const section=page.locator('.interaction-transfer-production-case')
      const transfer=section.locator('#interaction-production-transfer')
      const left=transfer.locator('.ui-transfer-panel[data-direction="left"]')
      const right=transfer.locator('.ui-transfer-panel[data-direction="right"]')
      const leftList=left.getByRole('listbox')
      await left.locator('input').fill('API')
      await expectText(page,'production-transfer-output','search:left:input:API')
      assert.equal(await left.getByRole('option').count(),1)
      await left.getByRole('option',{name:/API access/}).click()
      await expectText(page,'production-transfer-output','selection:pointer:api')
      await section.getByRole('button',{name:'Grant'}).click()
      await expectText(page,'production-transfer-output','transfer:button:token,api')
      assert.deepEqual(await transfer.locator('select[name="permissions"]').evaluate(element=>[...element.selectedOptions].map(option=>option.value)),['token','api'])
      await left.locator('input').fill('Tenant')
      await leftList.press('Space')
      await leftList.press('Enter')
      await expectText(page,'production-transfer-output','transfer:keyboard:token,api,tenant-1')
      await leftList.press('ArrowDown')
      await leftList.press('Space')
      await leftList.press('Enter')
      await expectText(page,'production-transfer-output','invalid:max')
      await section.locator('#interaction-production-transfer-api').click()
      await expectText(page,'production-transfer-output','transfer:fixture-api:token,audit')
      await section.locator('#interaction-production-transfer-clear').click()
      await expectText(page,'production-transfer-output','invalid:min')
      await page.locator('#interaction-transfer-form').evaluate(form=>form.reset())
      await expectText(page,'production-transfer-output','selection:reset:')
      assert.deepEqual(await transfer.locator('select[name="permissions"]').evaluate(element=>[...element.selectedOptions].map(option=>option.value)),['token'])
      await section.locator('#interaction-production-readonly-transfer-api').click()
      await expectText(page,'production-transfer-output','invalid:readonly')
      assert.equal(await transfer.getAttribute('data-state'),'ready')
      assert.equal(await right.getByRole('option',{name:/Design tokens/}).count(),1)
    },
  },
  {
    name:'selection-groups-limits-radio-switch-guard',
    run:async page=>{
      const section=page.locator('.interaction-selection-case')
      const channels=section.getByRole('group',{name:'Notification channels'})
      const email=channels.getByRole('checkbox',{name:'Email'})
      const sms=channels.getByRole('checkbox',{name:'SMS'})
      const inbox=channels.getByRole('checkbox',{name:'Inbox'})
      assert.equal(await email.isChecked(),true)
      await sms.click()
      await expectText(page,'selection-output','checkbox:sms:true:email,sms')
      await inbox.click()
      await expectText(page,'selection-output','limit:max:email,sms')
      assert.equal(await inbox.isChecked(),false)
      await email.click()
      await expectText(page,'selection-output','checkbox:email:false:sms')
      await sms.click()
      await expectText(page,'selection-output','limit:min:sms')
      assert.equal(await sms.isChecked(),true)
      const plans=section.getByRole('radiogroup',{name:'Workspace plan'})
      const team=plans.getByRole('radio',{name:'Team'})
      await team.focus();await page.keyboard.press('ArrowLeft')
      await expectText(page,'selection-output','radio:keyboard:starter')
      assert.equal(await plans.getByRole('radio',{name:'Starter'}).isChecked(),true)
      const toggle=section.getByRole('switch',{name:'Release policy'})
      await toggle.click()
      assert.equal(await toggle.getAttribute('aria-busy'),'true')
      await expectText(page,'selection-output','guard:checking:paused')
      await expectText(page,'selection-output','switch:paused')
      assert.equal(await toggle.getAttribute('aria-checked'),'false')
      assert.equal(await section.locator('input[type="hidden"][name="releasePolicy"]').count(),0)
      assert.equal(await section.getByRole('checkbox',{name:'Mixed selection'}).getAttribute('aria-checked'),'mixed')
      const readonly=section.getByRole('checkbox',{name:'Read-only selection'})
      assert.equal(await readonly.getAttribute('aria-readonly'),'true')
      await readonly.click()
      assert.equal(await readonly.isChecked(),false)
    },
  },
  {
    name: 'upload-validation-remove',
    run: async page => {
      const section=page.locator('.interaction-case').filter({hasText:'Upload validation contract'})
      const input = section.locator('.ui-upload-input')
      await input.setInputFiles({ name: 'fixture.txt', mimeType: 'text/plain', buffer: Buffer.from('Lan UI') })
      await expectText(page, 'upload-output', 'files=1 error=none')
      await input.setInputFiles({ name: 'fixture.png', mimeType: 'image/png', buffer: Buffer.from('not-an-image') })
      assert.match(await page.getByTestId('upload-output').innerText(), /files=1 error=.*fixture\.png/)
      await section.locator('.ui-upload-file .icon-btn').click()
      assert.match(await page.getByTestId('upload-output').innerText(), /^files=0 error=/)
    },
  },
  {
    name: 'upload-queue-lifecycle',
    run: async page => {
      const section=page.locator('.interaction-upload-queue')
      const input=section.locator('.ui-upload-input')
      await input.setInputFiles({name:'retry-fixture.txt',mimeType:'text/plain',buffer:Buffer.from('retry')})
      await expectText(page,'upload-queue-output','error:retry-fixture.txt')
      assert.equal(await section.getByRole('button',{name:'Retry upload for retry-fixture.txt'}).isVisible(),true)
      await section.getByRole('button',{name:'Retry upload for retry-fixture.txt'}).click()
      await expectText(page,'upload-queue-output','success:retry-fixture.txt')
      await input.setInputFiles({name:'slow-fixture.txt',mimeType:'text/plain',buffer:Buffer.from('slow')})
      const cancel=section.getByRole('button',{name:'Cancel upload for slow-fixture.txt'})
      await cancel.waitFor();await cancel.click()
      await expectText(page,'upload-queue-output','abort:slow-fixture.txt')
      assert.equal(await section.locator('.ui-upload-file.status-success').count(),1)
      assert.equal(await section.locator('.ui-upload-file.status-canceled').count(),1)
    },
  },
  {
    name: 'table-state-contract',
    run: async page => {
      const tableCase = page.locator('.interaction-table-case')
      await tableCase.getByRole('button', { name: 'Name' }).click()
      await expectText(page, 'table-output', 'sort=name:asc selected=none expanded=none')
      await tableCase.locator('tbody input[type="checkbox"]').first().check()
      await tableCase.locator('tbody .ui-table-expand').first().click()
      await expectText(page, 'table-output', 'sort=name:asc selected=1 expanded=1')
      assert.equal(await tableCase.getByText('Expanded Foundation').isVisible(), true)
    },
  },
  {
    name: 'form-validation-focus',
    run: async page => {
      const section=page.locator('.interaction-case').filter({hasText:'Form validation and focus contract'})
      await section.getByRole('button', { name: 'Submit form' }).click()
      await expectText(page, 'form-output', 'invalid')
      assert.equal(await section.getByRole('alert').innerText(), 'Name is required')
      const input = section.getByRole('textbox', { name: 'Name' })
      assert.equal(await input.evaluate(node => node === document.activeElement), true)
      await input.fill('Lan UI')
      await section.getByRole('button', { name: 'Submit form' }).click()
      await expectText(page, 'form-output', 'submitted')
    },
  },
  {
    name: 'managed-form-nested-summary-server-error',
    run: async page => {
      const section=page.locator('.interaction-case').filter({hasText:'Managed nested form contract'})
      const input=section.getByRole('textbox',{name:'Account email'})
      await section.getByRole('button',{name:'Submit managed form'}).click()
      await expectText(page,'managed-form-output','invalid')
      assert.match(await section.locator('.ui-form-error-summary').innerText(),/Account email is required/)
      assert.equal(await input.evaluate(node=>node===document.activeElement),true)
      await input.fill('owner@example.com')
      await section.getByRole('button',{name:'Submit managed form'}).click()
      await expectText(page,'managed-form-output','submitted')
      await section.locator('.ui-form-error-summary').waitFor({state:'detached'})
      assert.equal(await section.locator('.ui-form-error-summary').count(),0)
      await section.getByRole('button',{name:'Set server error'}).click()
      await expectText(page,'managed-form-output','server-error')
      assert.match(await section.locator('.ui-form-error-summary').innerText(),/already belongs/)
      await section.locator('.ui-form-error-summary button').click()
      assert.equal(await input.evaluate(node=>node===document.activeElement),true)
      await section.getByRole('button',{name:'Reset managed email'}).click()
      await expectText(page,'managed-form-output','reset')
      await page.waitForFunction(node=>node?.value==='',await input.elementHandle())
      assert.equal(await input.inputValue(),'')
      await section.locator('.ui-form-error-summary').waitFor({state:'detached'})
      assert.equal(await section.locator('.ui-form-error-summary').count(),0)
    },
  },
  {
    name: 'dynamic-form-list-dependency',
    run: async page => {
      const section=page.locator('.interaction-case').filter({hasText:'Dynamic form list and dependency contract'})
      await section.getByRole('button',{name:'Add contact'}).click()
      await expectText(page,'dynamic-form-output','contacts=2')
      const secondEmail=section.getByRole('textbox',{name:'Contact email 2'})
      await secondEmail.fill('second@example.com')
      await section.getByRole('button',{name:'Move contact 2 up'}).click()
      const firstEmail=section.getByRole('textbox',{name:'Contact email 1'})
      await page.waitForFunction(node=>node?.value==='second@example.com',await firstEmail.elementHandle())
      assert.equal(await firstEmail.inputValue(),'second@example.com')
      await section.getByRole('button',{name:'Remove contact 1'}).click()
      await expectText(page,'dynamic-form-output','contacts=1')
      const passwordInputs=section.locator('input[type="password"]')
      const confirm=passwordInputs.nth(1)
      await section.getByRole('button',{name:'Validate dependency fields'}).click()
      await passwordInputs.nth(0).fill('changed123')
      await passwordInputs.nth(0).blur()
      await section.getByRole('alert').waitFor()
      assert.equal(await section.getByRole('alert').innerText(),'Passwords differ')
      await confirm.fill('changed123')
      await confirm.blur()
      await section.getByRole('alert').waitFor({state:'detached'})
    },
  },
  {
    name: 'schema-form-conditional-orchestration',
    run: async page => {
      const section=page.locator('.interaction-schema-form')
      const accountType=section.getByRole('combobox',{name:'Account type'})
      assert.equal(await section.getByRole('textbox',{name:'Tax ID'}).count(),1)
      await accountType.click()
      await page.getByRole('option',{name:'Personal',exact:true}).click()
      await expectText(page,'schema-form-output','idle / account.type / personal')
      assert.equal(await section.getByRole('textbox',{name:'Tax ID'}).count(),0)
      await accountType.click()
      await page.getByRole('option',{name:'Business',exact:true}).click()
      await section.getByRole('button',{name:'Submit schema form'}).click()
      await expectText(page,'schema-form-output','invalid / account.type / business')
      const taxId=section.getByRole('textbox',{name:'Tax ID'})
      assert.equal(await taxId.evaluate(node=>node===document.activeElement),true)
      assert.match(await section.locator('.ui-form-error-summary').innerText(),/Tax ID is required/)
      await taxId.fill('91330000LANUI2026')
      await section.getByRole('button',{name:'Submit schema form'}).click()
      await expectText(page,'schema-form-output','submitted / taxId / business')
      await section.locator('.ui-form-error-summary').waitFor({state:'detached'})
    },
  },
  {
    name: 'schema-form-repeatable-list',
    run: async page => {
      const section=page.locator('.interaction-schema-list')
      assert.equal(await section.locator('.ui-schema-form-list-item').count(),1)
      await section.getByRole('button',{name:'Add reviewer'}).click()
      await expectText(page,'schema-list-output','add:2:Lin')
      assert.equal(await section.locator('.ui-schema-form-list-item').count(),2)
      const names=section.getByRole('textbox',{name:'Name'})
      const emails=section.getByRole('textbox',{name:'Email'})
      await names.nth(1).fill('Chen')
      await emails.nth(1).fill('reviewer@example.com')
      await section.getByRole('button',{name:'Move reviewer up'}).nth(1).click()
      await expectText(page,'schema-list-output','move:2:Chen')
      assert.equal(await names.nth(0).inputValue(),'Chen')
      await section.getByRole('button',{name:'Remove reviewer'}).first().click()
      await expectText(page,'schema-list-output','remove:1:Lin')
      assert.equal(await section.locator('.ui-schema-form-list-item').count(),1)
      assert.equal(await names.nth(0).inputValue(),'Lin')
    },
  },
  {
    name: 'menu-directional-keyboard',
    run: async page => {
      const workspace = page.getByRole('menuitem', { name: 'Workspace' })
      await workspace.focus()
      await page.keyboard.press('ArrowRight')
      const overview = page.getByRole('menuitem', { name: 'Overview' })
      assert.equal(await workspace.getAttribute('aria-expanded'), 'true')
      assert.equal(await overview.evaluate(node => node === document.activeElement), true)
      await page.keyboard.press('Enter')
      await expectText(page, 'menu-output', 'overview')
    },
  },
  {
    name: 'data-grid-client-contract',
    run: async page => {
      const grid = page.locator('.interaction-data-grid')
      const search = grid.getByRole('textbox', { name: 'Search data' })
      await search.fill('Grid 12')
      await expectText(page, 'data-grid-output', 'q=Grid 12 page=1 size=5 sort=none:none selected=none visible=name,team,status')
      assert.equal(await grid.locator('tbody .ui-table-row').count(), 1)
      await search.fill('')
      await grid.getByRole('button', { name: 'Name' }).click()
      await grid.getByRole('checkbox', { name: 'Select grid-1' }).check()
      await grid.getByRole('button', { name: 'Next page' }).click()
      await expectText(page, 'data-grid-output', 'q=empty page=2 size=5 sort=name:asc selected=grid-1 visible=name,team,status')
    },
  },
  {
    name: 'data-grid-columns-keyboard',
    run: async page => {
      const grid = page.locator('.interaction-data-grid')
      const trigger = grid.getByRole('button', { name: 'Display columns' })
      await trigger.click()
      const group = grid.getByRole('group', { name: 'Column settings' })
      const status = group.getByRole('checkbox', { name: 'Status' })
      await status.uncheck()
      await status.focus()
      await page.keyboard.press('Escape')
      assert.equal(await trigger.getAttribute('aria-expanded'), 'false')
      assert.equal(await trigger.evaluate(node => node === document.activeElement), true)
      await expectText(page, 'data-grid-output', 'q=empty page=1 size=5 sort=none:none selected=none visible=name,team')
    },
  },
  {
    name: 'virtual-list-keyboard',
    run: async page => {
      const listbox = page.getByRole('listbox', { name: 'Fixture virtual records' })
      await listbox.focus()
      await page.keyboard.press('ArrowDown')
      await page.keyboard.press('ArrowDown')
      await page.keyboard.press('Enter')
      await expectText(page, 'virtual-list-output', 'virtual-2 / 2')
      assert.equal(await listbox.getAttribute('aria-activedescendant'), await page.getByRole('option', { name: /Record 003/ }).getAttribute('id'))
      assert.ok(await page.getByRole('option').count() < 120, 'Virtual list should render a bounded window')
      await page.keyboard.press('End')
      await page.getByRole('option', { name: /Record 120/ }).waitFor()
      await page.keyboard.press('Enter')
      await expectText(page, 'virtual-list-output', 'virtual-119 / 119')
      await page.keyboard.press('Home')
      await page.getByRole('option', { name: /Record 001/ }).waitFor()
      await expectText(page, 'virtual-list-output', 'virtual-119 / 0')
    },
  },
  {
    name: 'status-page-actions',
    run: async page => {
      const status = page.locator('.interaction-status-page')
      assert.equal(await status.locator('[data-status="403"]').getAttribute('role'), 'region')
      await status.getByRole('button', { name: 'Go back' }).click()
      await expectText(page, 'status-output', 'back')
      await status.getByRole('button', { name: 'Back to home' }).click()
      await expectText(page, 'status-output', 'home')
    },
  },
  {
    name:'scoped-theme-system',
    run:async page=>{
      const provider=page.locator('#scoped-theme-provider')
      assert.equal(await provider.getAttribute('data-ui-appearance'),'light')
      assert.equal(await provider.getAttribute('data-theme'),'light')
      await page.locator('#theme-dark').click()
      assert.equal(await provider.getAttribute('data-ui-appearance'),'dark')
      assert.equal(await provider.getAttribute('data-theme'),'dark')
      assert.equal((await provider.evaluate(node=>getComputedStyle(node).getPropertyValue('--brand-600'))).trim(),'#7C3AED')
      await page.locator('#theme-system').click()
      assert.equal(await provider.getAttribute('data-ui-appearance'),'system')
      assert.equal(await provider.getAttribute('data-theme'),'light')
      await page.emulateMedia({colorScheme:'dark'})
      await page.waitForFunction(()=>document.querySelector('#scoped-theme-provider')?.getAttribute('data-theme')==='dark')
      assert.equal(await provider.getAttribute('data-ui-resolved-appearance'),'dark')
      await page.locator('#theme-light').click()
      assert.equal(await provider.getAttribute('data-theme'),'light')
      await expectText(page,'theme-output','light')
    },
  },
  {
    name:'scoped-theme-portal',
    run:async page=>{
      const provider=page.locator('#scoped-theme-provider')
      await page.locator('#theme-dark').click()
      await page.locator('#theme-portal-trigger').click()
      const panel=page.getByRole('dialog',{name:'Scoped tenant panel'})
      await panel.waitFor()
      assert.equal(await panel.getAttribute('data-ui-teleport-scope'),'')
      assert.equal(await panel.getAttribute('data-theme'),'dark')
      assert.equal(await panel.getAttribute('data-ui-appearance'),'dark')
      assert.equal(await panel.getAttribute('data-ui-resolved-appearance'),'dark')
      assert.equal(await panel.getAttribute('data-ui-theme'),'custom')
      assert.equal((await panel.evaluate(node=>getComputedStyle(node).getPropertyValue('--brand-600'))).trim(),'#7C3AED')
      assert.equal((await panel.evaluate(node=>getComputedStyle(node).colorScheme)).trim(),'dark')
      await page.locator('#theme-system').click()
      await panel.waitFor({state:'hidden'})
      await page.locator('#theme-portal-trigger').click()
      await panel.waitFor()
      await page.emulateMedia({colorScheme:'dark'})
      await page.waitForFunction(()=>document.querySelector('.ui-popover-panel')?.getAttribute('data-ui-resolved-appearance')==='dark')
      assert.equal(await panel.getAttribute('data-ui-appearance'),'system')
      await page.emulateMedia({colorScheme:'light'})
      await page.waitForFunction(()=>document.querySelector('.ui-popover-panel')?.getAttribute('data-theme')==='light')
      assert.equal(await panel.getAttribute('data-ui-resolved-appearance'),'light')
      assert.equal(await provider.getAttribute('data-theme'),'light')
    },
  },
  {
    name:'scoped-motion-system',
    run:async page=>{
      const provider=page.locator('#scoped-motion-provider')
      assert.equal(await provider.getAttribute('data-ui-motion-preference'),'system')
      assert.equal(await provider.getAttribute('data-ui-motion'),'reduced')
      assert.equal((await provider.evaluate(node=>getComputedStyle(node).getPropertyValue('--motion-time'))).trim(),'.01ms')
      await page.locator('#motion-portal-trigger').click()
      const panel=page.getByRole('dialog',{name:'Scoped motion panel'})
      await panel.waitFor()
      assert.equal(await panel.getAttribute('data-ui-motion-preference'),'system')
      assert.equal(await panel.getAttribute('data-ui-motion'),'reduced')
      assert.equal((await panel.evaluate(node=>getComputedStyle(node).getPropertyValue('--motion-count'))).trim(),'1')
      await page.locator('#motion-full').click()
      assert.equal(await provider.getAttribute('data-ui-motion'),'full')
      await panel.waitFor({state:'hidden'})
      await page.locator('#motion-portal-trigger').click()
      await panel.waitFor()
      assert.equal(await panel.getAttribute('data-ui-motion'),'full')
      assert.equal((await panel.evaluate(node=>getComputedStyle(node).getPropertyValue('--motion-time'))).trim(),'' )
      await page.locator('#motion-system').click()
      assert.equal(await provider.getAttribute('data-ui-motion'),'reduced')
      await panel.waitFor({state:'hidden'})
      await page.locator('#motion-portal-trigger').click()
      await panel.waitFor()
      await page.emulateMedia({reducedMotion:'no-preference'})
      await page.waitForFunction(()=>document.querySelector('#scoped-motion-provider')?.getAttribute('data-ui-motion')==='full')
      assert.equal(await panel.getAttribute('data-ui-motion'),'full')
      await expectText(page,'motion-output','system')
    },
  },
  {
    name:'anchor-scroll-keyboard',
    run:async page=>{
      const navigation=page.getByRole('navigation',{name:'Anchor fixture'})
      const overview=navigation.getByRole('link',{name:'Overview'})
      const api=navigation.getByRole('link',{name:'API contract'})
      await overview.focus()
      await page.keyboard.press('ArrowDown')
      assert.equal(await api.evaluate(node=>node===document.activeElement),true)
      await page.keyboard.press('Enter')
      await expectText(page,'anchor-output','fixture-anchor-api')
      assert.equal(await api.getAttribute('aria-current'),'location')
      assert.ok(await page.locator('#fixture-anchor-scroller').evaluate(node=>node.scrollTop>0))
      assert.equal(await navigation.getByRole('link',{name:'Disabled'}).getAttribute('aria-disabled'),'true')
    },
  },
  {
    name:'watermark-mutation-recovery',
    run:async page=>{
      const root=page.locator('#interaction-watermark')
      let layer=root.locator('[data-ui-watermark-layer]')
      await layer.waitFor()
      assert.equal(await layer.getAttribute('role'),'img')
      assert.equal(await layer.getAttribute('aria-label'),'Protected release record watermark')
      assert.equal(await layer.evaluate(node=>getComputedStyle(node).pointerEvents),'none')
      await page.locator('#watermark-content-action').click()
      await expectText(page,'watermark-output','action')
      await page.locator('#remove-watermark').click()
      await expectText(page,'watermark-output','restored:removed')
      layer=root.locator('[data-ui-watermark-layer]')
      assert.equal(await layer.count(),1)
      assert.match(await layer.evaluate(node=>node.style.backgroundImage),/data:image\/png/)
      await layer.evaluate(node=>{node.style.backgroundImage='none'})
      await expectText(page,'watermark-output','restored:modified')
      assert.match(await layer.evaluate(node=>node.style.backgroundImage),/data:image\/png/)
      await page.locator('#rotate-watermark').click()
      await expectText(page,'watermark-output','rotation:-35')
      assert.equal(await layer.getAttribute('data-ui-watermark-mode'),'text')
    },
  },
  {
    name:'affix-container-lifecycle',
    run:async page=>{
      const target=page.locator('#interaction-affix-target')
      const root=page.locator('#interaction-affix')
      const content=root.locator('.ui-affix-content')
      await target.scrollIntoViewIfNeeded()
      assert.equal(await root.getAttribute('data-affixed'),'false')
      await target.evaluate(element=>{element.scrollTop=120;element.dispatchEvent(new Event('scroll'))})
      await page.waitForFunction(()=>document.querySelector('#interaction-affix')?.dataset.affixed==='true')
      assert.equal(await content.evaluate(node=>getComputedStyle(node).position),'fixed')
      const geometry=await page.evaluate(()=>{const target=document.querySelector('#interaction-affix-target').getBoundingClientRect(),root=document.querySelector('#interaction-affix').getBoundingClientRect(),content=document.querySelector('#interaction-affix .ui-affix-content').getBoundingClientRect();return {targetTop:target.top,rootLeft:root.left,contentTop:content.top,contentLeft:content.left,contentWidth:content.width,rootWidth:root.width}})
      assert.ok(Math.abs(geometry.contentTop-(geometry.targetTop+10))<=1)
      assert.ok(Math.abs(geometry.contentLeft-geometry.rootLeft)<=1)
      assert.ok(Math.abs(geometry.contentWidth-geometry.rootWidth)<=1)
      await page.locator('#affix-content-action').click()
      await expectText(page,'affix-output','action')
      await page.locator('#disable-affix').click()
      await page.waitForFunction(()=>document.querySelector('#interaction-affix')?.dataset.affixed==='false')
      assert.notEqual(await content.evaluate(node=>getComputedStyle(node).position),'fixed')
      await page.locator('#disable-affix').click()
      await target.evaluate(element=>element.dispatchEvent(new Event('scroll')))
      await page.waitForFunction(()=>document.querySelector('#interaction-affix')?.dataset.affixed==='true')
      await target.evaluate(element=>{element.scrollTop=0;element.dispatchEvent(new Event('scroll'))})
      await page.waitForFunction(()=>document.querySelector('#interaction-affix')?.dataset.affixed==='false')
    },
  },
  {
    name:'splitter-keyboard-pointer-rtl',
    query:'direction=rtl',
    run:async page=>{
      const root=page.locator('#interaction-splitter')
      await root.scrollIntoViewIfNeeded()
      const bars=root.getByRole('separator')
      assert.equal(await bars.count(),2)
      assert.equal(await bars.first().getAttribute('aria-orientation'),'vertical')
      assert.match(await bars.first().getAttribute('aria-controls'),/panel-0.*panel-1/)
      const initial=Number(await bars.first().getAttribute('aria-valuenow'))
      await bars.first().focus()
      await page.keyboard.press('ArrowRight')
      await expectTextContains(page,'splitter-output','end:keyboard:')
      const keyboardValue=Number(await bars.first().getAttribute('aria-valuenow'))
      assert.ok(keyboardValue<initial,'RTL ArrowRight should reduce the leading panel')
      const box=await bars.first().boundingBox()
      assert.ok(box)
      await page.mouse.move(box.x+box.width/2,box.y+box.height/2)
      await page.mouse.down()
      await page.mouse.move(box.x+box.width/2+46,box.y+box.height/2,{steps:4})
      assert.ok(await root.locator('.ui-splitter-ghost').isVisible())
      await page.mouse.up()
      await expectTextContains(page,'splitter-output','end:pointer:')
      await bars.nth(1).focus()
      await page.keyboard.press('Enter')
      await expectText(page,'splitter-output','collapse:true:keyboard')
      assert.ok(await root.locator('.ui-splitter-panel').nth(2).evaluate(node=>node.classList.contains('collapsed')))
      await page.keyboard.press('Enter')
      await expectText(page,'splitter-output','collapse:false:keyboard')
      await page.locator('#splitter-reset').click()
      await expectText(page,'splitter-output','end:reset:24')
    },
  },
  {
    name:'typography-copy-edit-expand',
    run:async page=>{
      const root=page.locator('#interaction-typography')
      await root.scrollIntoViewIfNeeded()
      await root.locator('.ui-typography-content').dblclick()
      await expectText(page,'typography-output','start:text')
      const updated='Approved release handoff keeps copy, long-form documentation, expansion and keyboard-confirmed inline editing consistent for every independent consumer workspace.'
      const editor=root.locator('.ui-typography-editor-control')
      await editor.fill(updated)
      await editor.press('Control+Enter')
      await expectText(page,'typography-output',`save:${updated}`)
      await page.locator('#interaction-typography[data-overflowing="true"]').waitFor()
      const expand=root.locator('.ui-typography-action.is-expand')
      await expand.waitFor()
      assert.equal(await expand.getAttribute('aria-label'),'Expand text')
      await expand.click()
      await expectText(page,'typography-output','expand:true:2')
      assert.equal(await expand.getAttribute('aria-expanded'),'true')
      await root.getByRole('button',{name:'Collapse text'}).click()
      await expectText(page,'typography-output','expand:false:2')
      await root.locator('.ui-typography-content').dblclick()
      await root.locator('.ui-typography-editor-control').press('Escape')
      await expectText(page,'typography-output','cancel:keyboard')
    },
  },
  {
    name:'list-selection-actions-pagination-rtl',
    query:'direction=rtl',
    run:async page=>{
      const root=page.locator('#interaction-list')
      await root.scrollIntoViewIfNeeded()
      const listbox=root.getByRole('listbox',{name:'Interaction release list'})
      await listbox.focus()
      await page.keyboard.press('ArrowLeft')
      await expectText(page,'list-output','active:1:keyboard')
      assert.match(await listbox.getAttribute('aria-activedescendant'),/-1$/)
      await page.keyboard.press('Space')
      await expectText(page,'list-output','select:interaction-list-0|interaction-list-1')
      await page.locator('#list-action-interaction-list-1').click()
      await expectText(page,'list-output','action:interaction-list-1')
      await root.getByRole('button',{name:'Go to page 2',exact:true}).click()
      await expectText(page,'list-output','page:2:3')
      await listbox.focus()
      await page.keyboard.press('Control+a')
      await expectText(page,'list-output','select:interaction-list-0|interaction-list-1|interaction-list-3|interaction-list-4|interaction-list-5|interaction-list-6')
    },
  },
  {
    name:'mentions-caret-keyboard-multi-trigger-rtl',
    query:'direction=rtl',
    run:async page=>{
      const root=page.getByRole('combobox',{name:'Interaction release comment'})
      const input=root.getByRole('textbox',{name:'Interaction release comment'})
      await input.scrollIntoViewIfNeeded()
      await input.fill('Review @al')
      const memberList=page.getByRole('listbox',{name:'Suggestions'})
      await memberList.waitFor()
      assert.equal(await root.getAttribute('aria-expanded'),'true')
      assert.equal(await memberList.getAttribute('data-placement'),'bottom-end')
      assert.equal(await memberList.getByRole('option').count(),2)
      await input.press('Enter')
      await expectText(page,'mentions-output','select:@:alice:enter')
      assert.equal(await input.inputValue(),'Review @alice ')
      await input.fill('Review @alice #re')
      await memberList.waitFor()
      assert.equal(await memberList.getByRole('option').count(),1)
      await input.press('Tab')
      await expectText(page,'mentions-output','select:#:release:tab')
      assert.equal(await input.inputValue(),'Review @alice #release ')
      assert.equal(await root.getAttribute('aria-expanded'),'false')
    },
  },
  {
    name:'input-tag-tokenize-edit-remove-rtl',
    query:'direction=rtl',
    run:async page=>{
      const root=page.locator('.interaction-input-tag-case .ui-input-tag')
      const input=page.getByRole('textbox',{name:'Interaction capability tags'})
      await root.scrollIntoViewIfNeeded()
      await input.pressSequentially('Vue，TypeScript；')
      await expectText(page,'input-tag-output','change:separator:Vue|TypeScript')
      assert.equal(await root.locator('.ui-input-tag-chip').count(),2)
      await input.fill('vue')
      await input.press('Enter')
      await expectText(page,'input-tag-output','invalid:duplicate:vue')
      await input.press('ArrowRight')
      assert.ok((await root.locator('.ui-input-tag-chip').last().getAttribute('class'))?.split(/\s+/).includes('active'))
      await input.press('Backspace')
      await expectText(page,'input-tag-output','change:backspace:Vue')
      await root.locator('.ui-input-tag-label').first().dblclick()
      const edit=root.locator('.ui-input-tag-edit')
      await edit.fill('Vue 4')
      await edit.press('Enter')
      await expectText(page,'input-tag-output','change:edit-enter:Vue 4')
      await input.fill('Design,System,')
      await expectText(page,'input-tag-output','change:separator:Vue 4|Design|System')
      await root.getByRole('button',{name:'Clear all tags'}).click()
      await expectText(page,'input-tag-output','change:button:')
      await page.waitForFunction(()=>!document.querySelector('.interaction-input-tag-case .ui-input-tag-chip'))
      assert.equal(await root.locator('.ui-input-tag-chip').count(),0)
      await expectFocused(page,input)
    },
  },
  {
    name:'query-builder-recursive-keyboard-evaluate',
    query:'direction=ltr',
    run:async page=>{
      const root=page.getByRole('group',{name:'Interaction release query'})
      await root.scrollIntoViewIfNeeded()
      assert.equal(await root.locator(':scope > .ui-query-builder-rules > .ui-query-builder-rule').count(),2)
      assert.match(await page.locator('input[name="interactionQuery"]').inputValue(),/"priority"/)
      await page.locator('#evaluate-query').click()
      await expectText(page,'query-builder-output','match:true')
      await root.getByRole('button',{name:'Add condition'}).click()
      await expectText(page,'query-builder-output','add:rule:2:')
      let rules=root.locator(':scope > .ui-query-builder-rules > .ui-query-builder-rule')
      assert.equal(await rules.count(),3)
      await rules.nth(2).press('Control+d')
      await expectText(page,'query-builder-output','duplicate:rule:3:')
      rules=root.locator(':scope > .ui-query-builder-rules > .ui-query-builder-rule')
      assert.equal(await rules.count(),4)
      await rules.nth(2).press('Alt+ArrowUp')
      await expectText(page,'query-builder-output','move:rule:2:1')
      rules=root.locator(':scope > .ui-query-builder-rules > .ui-query-builder-rule')
      await rules.nth(1).press('Alt+Backspace')
      await expectText(page,'query-builder-output','remove:rule:1:')
      assert.equal(await rules.count(),3)
      await root.getByRole('button',{name:'Add group'}).click()
      await expectText(page,'query-builder-output','add:group:3:')
      assert.equal(await root.locator('.ui-query-builder.depth-1').count(),1)
      await root.getByRole('button',{name:'NOT',exact:true}).first().click()
      await expectText(page,'query-builder-output','change:not')
      assert.equal(await root.getByRole('button',{name:'NOT',exact:true}).first().getAttribute('aria-pressed'),'true')
    },
  },
  {
    name:'carousel-keyboard-swipe-playback',
    query:'direction=ltr',
    run:async page=>{
      const root=page.getByRole('region',{name:'Interaction release highlights'})
      await root.scrollIntoViewIfNeeded()
      await root.focus()
      await root.press('ArrowRight')
      await expectText(page,'carousel-output','change:keyboard:1:next')
      assert.equal(await root.getAttribute('data-active-index'),'1')
      await root.press('End')
      await expectText(page,'carousel-output','change:keyboard-end:2:next')
      await root.press('Home')
      await expectText(page,'carousel-output','change:keyboard-home:0:previous')
      const viewport=root.locator('.ui-carousel-viewport')
      const box=await viewport.boundingBox()
      assert.ok(box)
      await page.mouse.move(box.x+box.width*.75,box.y+box.height*.5)
      await page.mouse.down()
      await page.mouse.move(box.x+box.width*.25,box.y+box.height*.5,{steps:4})
      await page.mouse.up()
      await page.waitForTimeout(100)
      const gestureOutput=(await page.getByTestId('carousel-output').innerText()).trim()
      assert.equal(await root.getAttribute('data-active-index'),'1',`Swipe did not advance: ${gestureOutput}`)
      assert.equal(gestureOutput,'drag:true:1')
      const pause=root.getByRole('button',{name:'Pause automatic rotation'})
      assert.equal(await pause.getAttribute('aria-pressed'),'true')
      await pause.click()
      const play=root.getByRole('button',{name:'Start automatic rotation'})
      assert.equal(await play.getAttribute('aria-pressed'),'false')
      await play.click()
      await root.getByRole('button',{name:/Show item 3 of 3/}).click()
      await expectText(page,'carousel-output','change:indicator:2:next')
    },
  },
  {
    name:'time-range-value-validation-focus',
    query:'direction=ltr',
    run:async page=>{
      const root=page.getByRole('group',{name:'Interaction service window'})
      await root.scrollIntoViewIfNeeded()
      const start=root.getByLabel('Start time')
      const end=root.getByLabel('End time')
      assert.equal(await start.getAttribute('type'),'time')
      assert.equal(await end.getAttribute('type'),'time')
      assert.equal(await start.getAttribute('min'),'08:00')
      assert.equal(await end.getAttribute('max'),'22:00')
      await start.focus()
      await expectText(page,'time-range-output','focus:0')
      await start.fill('18:00')
      await expectText(page,'time-range-output','invalid:range-order')
      assert.equal(await root.getAttribute('aria-invalid'),'true')
      // Firefox exposes the native time field's hour/minute segments as extra
      // Tab stops. Advance until the next public control receives focus while
      // keeping the same keyboard-only contract in every browser.
      for(let attempt=0;attempt<4&&!await end.evaluate(node=>node===document.activeElement);attempt+=1)await page.keyboard.press('Tab')
      await expectFocused(page,end)
      await expectText(page,'time-range-output','focus:1')
      await end.fill('19:00')
      await expectText(page,'time-range-output','change:true:18:00:19:00')
      assert.equal(await root.getAttribute('aria-invalid'),null)
      await root.getByRole('button',{name:'Clear date or time'}).click()
      await expectText(page,'time-range-output','clear')
      assert.equal(await start.inputValue(),'')
      assert.equal(await end.inputValue(),'')
    },
  },
  {
    name:'date-time-value-range-focus',
    query:'direction=ltr',
    run:async page=>{
      const single=page.getByLabel('Interaction release starts')
      const range=page.getByRole('group',{name:'Interaction release window'})
      const start=range.getByLabel('Window starts')
      const end=range.getByLabel('Window ends')
      await range.scrollIntoViewIfNeeded()
      assert.equal(await single.getAttribute('type'),'datetime-local')
      assert.equal(await start.getAttribute('type'),'datetime-local')
      assert.equal(await end.getAttribute('type'),'datetime-local')
      assert.equal(await single.getAttribute('min'),'2026-08-15T08:00')
      await single.focus()
      await expectText(page,'date-time-output','single-focus')
      await single.fill('2026-08-16T10:45')
      await expectText(page,'date-time-output','single:2026-08-16T10:45')
      await start.focus()
      await expectText(page,'date-time-output','range-focus:0')
      await start.fill('2026-08-16T18:00')
      await expectText(page,'date-time-output','invalid:range-order')
      assert.equal(await range.getAttribute('aria-invalid'),'true')
      for(let attempt=0;attempt<8&&!await end.evaluate(node=>node===document.activeElement);attempt+=1)await page.keyboard.press('Tab')
      await expectFocused(page,end)
      await expectText(page,'date-time-output','range-focus:1')
      await end.fill('2026-08-16T19:00')
      await expectText(page,'date-time-output','range:true:2026-08-16T18:00:2026-08-16T19:00')
      assert.equal(await range.getAttribute('aria-invalid'),null)
      await range.getByRole('button',{name:'Clear date or time'}).click()
      await expectText(page,'date-time-output','range-clear')
    },
  },
  {
    name:'qr-code-lifecycle-refresh',
    query:'direction=ltr',
    run:async page=>{
      const root=page.locator('.interaction-qr-code-case .ui-qr-code')
      await root.scrollIntoViewIfNeeded()
      assert.equal(await root.getAttribute('data-status'),'expired')
      assert.equal(await root.getAttribute('data-level'),'H')
      const symbol=root.getByRole('img',{name:'Interaction release QR code'})
      const initialPath=await symbol.locator('path').getAttribute('d')
      assert.ok(initialPath?.length>100)
      const refresh=root.locator('.ui-qr-code-overlay .ui-qr-code-action')
      await refresh.focus()
      await refresh.click()
      await expectText(page,'qr-code-output','refresh:2')
      assert.equal(await root.getAttribute('data-status'),'active')
      assert.notEqual(await symbol.locator('path').getAttribute('d'),initialPath)
      await page.locator('#qr-mark-scanned').click()
      await expectText(page,'qr-code-output','status:scanned')
      assert.equal(await root.getAttribute('data-status'),'scanned')
      assert.equal(await root.locator('.ui-qr-code-overlay').getAttribute('role'),'status')
      await page.locator('#qr-expire').click()
      await expectText(page,'qr-code-output','status:expired')
      assert.equal(await root.getAttribute('data-status'),'expired')
    },
  },
  {
    name:'barcode-lifecycle-refresh',
    query:'direction=ltr',
    run:async page=>{
      const root=page.locator('.interaction-barcode-case .ui-barcode')
      await root.scrollIntoViewIfNeeded()
      assert.equal(await root.getAttribute('data-status'),'expired')
      assert.equal(await root.getAttribute('data-format'),'CODE128')
      const symbol=root.getByRole('img',{name:'Interaction asset barcode'})
      const initialPath=await symbol.locator('path').getAttribute('d')
      assert.ok(initialPath?.length>100)
      assert.equal(await symbol.locator('text').textContent(),'LAN-UI-153-R1')
      const refresh=root.locator('.ui-barcode-overlay .ui-barcode-action')
      await refresh.focus()
      await refresh.click()
      await expectText(page,'barcode-output','refresh:2')
      assert.equal(await root.getAttribute('data-status'),'active')
      assert.notEqual(await symbol.locator('path').getAttribute('d'),initialPath)
      assert.equal(await symbol.locator('text').textContent(),'LAN-UI-153-R2')
      await page.locator('#barcode-mark-scanned').click()
      await expectText(page,'barcode-output','status:scanned')
      assert.equal(await root.getAttribute('data-status'),'scanned')
      assert.equal(await root.locator('.ui-barcode-overlay').getAttribute('role'),'status')
      await page.locator('#barcode-expire').click()
      await expectText(page,'barcode-output','status:expired')
      assert.equal(await root.getAttribute('data-status'),'expired')
    },
  },
  {
    name:'cron-editor-preset-validation-preview',
    query:'direction=ltr',
    run:async page=>{
      const root=page.locator('.interaction-cron-editor-case .ui-cron-editor')
      await root.scrollIntoViewIfNeeded()
      assert.equal(await root.getAttribute('data-valid'),'true')
      assert.equal(await root.getAttribute('data-preset'),'weekdays')
      const input=root.getByRole('textbox',{name:'Interaction release schedule'})
      await root.getByRole('button',{name:'Every 15 minutes'}).click()
      await expectText(page,'cron-output','preset:true:*/15 * * * *')
      assert.equal(await root.getAttribute('data-preset'),'every-15-minutes')
      assert.equal(await root.locator('.ui-cron-run-list li').count(),5)
      await input.fill('61 9 * * *')
      await expectText(page,'cron-output','invalid:out-of-range')
      assert.equal(await root.getAttribute('data-valid'),'false')
      assert.match(await root.getByRole('alert').innerText(),/outside its allowed range/)
      await page.locator('#cron-api-daily').click()
      await expectText(page,'cron-output','fixture-api:true:0 10 * * *')
      assert.equal(await root.getAttribute('data-valid'),'true')
      assert.equal(await input.inputValue(),'0 10 * * *')
      assert.equal(await root.locator('.ui-cron-run-list li').count(),5)
    },
  },
  {
    name:'key-value-editor-edit-import-reorder-validation',
    query:'direction=ltr',
    run:async page=>{
      const root=page.getByRole('group',{name:'Interaction request headers'})
      await root.scrollIntoViewIfNeeded()
      assert.equal(await root.getAttribute('data-valid'),'true')
      const keys=root.locator('.ui-key-value-key')
      assert.equal(await keys.count(),2)
      await keys.nth(1).fill('authorization')
      await expectText(page,'key-value-output','invalid:duplicate-key')
      assert.equal(await root.getAttribute('aria-invalid'),'true')
      await keys.nth(1).fill('X-Region')
      await expectText(page,'key-value-output','key-input:true:Authorization|X-Region')
      assert.equal(await root.getAttribute('aria-invalid'),null)
      await page.locator('#key-value-import').click()
      await expectText(page,'key-value-output','import:true:REGION|RETRIES|TRACE')
      assert.equal(await keys.count(),3)
      await page.locator('#key-value-api-move').click()
      await expectText(page,'key-value-output','fixture-api:true:RETRIES|REGION|TRACE')
      await root.getByRole('checkbox',{name:'Toggle row 1'}).click()
      await expectText(page,'key-value-output','toggle:true:RETRIES|REGION|TRACE')
      assert.equal(await root.getByRole('checkbox',{name:'Toggle row 1'}).isChecked(),false)
      await root.getByRole('button',{name:'Remove row 2'}).click()
      await expectText(page,'key-value-output','button:true:RETRIES|TRACE')
      assert.equal(await keys.count(),2)
    },
  },
  {
    name:'page-header-back-breadcrumb-composition',
    query:'direction=ltr',
    run:async page=>{
      const root=page.locator('.interaction-page-header-case .ui-page-header')
      await root.scrollIntoViewIfNeeded()
      assert.equal(await root.getAttribute('data-ui-page-header'),'')
      assert.equal(await root.getByRole('heading',{name:'Interaction release',level:1}).count(),1)
      const back=root.getByRole('button',{name:'Back'})
      await back.click()
      await expectText(page,'page-header-output','back:pointer')
      await back.focus()
      await back.press('Enter')
      await expectText(page,'page-header-output','back:keyboard')
      await root.getByRole('link',{name:'Workspace'}).click()
      await expectText(page,'page-header-output','breadcrumb:0:Workspace')
      await page.locator('#page-header-action').click()
      await expectText(page,'page-header-output','action:publish')
      assert.equal(await root.getByRole('navigation',{name:'Page header sections'}).count(),1)
    },
  },
  {
    name:'card-pointer-keyboard-selection-nested-action',
    query:'direction=ltr',
    run:async page=>{
      const card=page.locator('#interaction-card')
      await card.scrollIntoViewIfNeeded()
      assert.equal(await card.getAttribute('data-ui-card'),'')
      assert.equal(await card.getAttribute('role'),'button')
      assert.equal(await card.getAttribute('aria-pressed'),'false')
      await card.click()
      await expectText(page,'card-output','activate:pointer:true')
      assert.equal(await card.getAttribute('aria-pressed'),'true')
      await card.focus()
      await card.press('Enter')
      await expectText(page,'card-output','activate:keyboard:false')
      await card.press(' ')
      await expectText(page,'card-output','activate:keyboard:true')
      await page.locator('#card-nested-action').click()
      await expectText(page,'card-output','nested:action')
      const disabled=page.locator('#interaction-card-disabled')
      assert.equal(await disabled.getAttribute('aria-disabled'),'true')
      assert.equal(await disabled.getAttribute('tabindex'),'-1')
    },
  },
  {
    name:'button-async-native-focus-rtl',
    query:'direction=rtl',
    run:async page=>{
      const action=page.locator('#interaction-button-action')
      await action.scrollIntoViewIfNeeded()
      assert.equal(await action.getAttribute('data-ui-button'),'')
      assert.equal(await action.getAttribute('data-state'),'ready')
      await action.click()
      await expectText(page,'button-output','pending:1')
      assert.equal(await action.getAttribute('data-state'),'loading')
      assert.equal(await action.getAttribute('aria-busy'),'true')
      assert.equal(await action.isDisabled(),true)
      await action.evaluate(node=>node.click())
      await expectText(page,'button-output','success:P68:1')
      assert.equal(await action.getAttribute('data-state'),'ready')
      assert.equal(await action.getAttribute('aria-busy'),null)
      const toggle=page.locator('#interaction-button-toggle')
      await toggle.focus();await toggle.press(' ')
      await expectText(page,'button-output','pressed:true')
      assert.equal(await toggle.getAttribute('aria-pressed'),'true')
      await toggle.press('Enter')
      await expectText(page,'button-output','pressed:false')
      const link=page.locator('#interaction-button-link')
      assert.equal(await link.evaluate(node=>node.tagName),'A')
      assert.equal(await link.getAttribute('rel'),'noopener noreferrer')
      assert.equal(await link.getAttribute('data-icon-position'),'end')
      assert.equal(await link.locator('.ui-button-icon-end').count(),1)
      const form=page.locator('#interaction-button-form')
      assert.equal(await form.getAttribute('type'),'submit')
      assert.equal(await form.getAttribute('form'),'interaction-release-form')
      assert.equal(await form.getAttribute('name'),'intent')
      assert.equal(await form.getAttribute('value'),'publish')
      assert.equal(await page.locator('#interaction-button-icon').getAttribute('aria-label'),'More button actions')
      assert.equal(await page.locator('#interaction-button-disabled').isDisabled(),true)
      await page.locator('#interaction-button-focus-api').click()
      await expectFocused(page,page.locator('#interaction-button-focus-target'))
      await expectText(page,'button-output','focus:api')
    },
  },
  {
    name:'input-ime-password-clear-rtl',
    query:'direction=rtl',
    run:async page=>{
      const input=page.locator('#interaction-input')
      await input.scrollIntoViewIfNeeded()
      const root=input.locator('xpath=../..')
      assert.equal(await root.getAttribute('data-ui-input'),'')
      assert.equal(await root.getAttribute('data-state'),'ready')
      assert.equal(await input.getAttribute('name'),'releaseAlias')
      assert.equal(await input.getAttribute('aria-required'),'true')
      await input.focus()
      await input.dispatchEvent('compositionstart',{data:'发'})
      await input.evaluate(node=>{node.value='发布';node.dispatchEvent(new InputEvent('input',{bubbles:true,data:'发布',inputType:'insertCompositionText',isComposing:true}))})
      await expectText(page,'input-output','ready:release draft')
      await input.dispatchEvent('compositionend',{data:'发布'})
      await input.evaluate(node=>node.dispatchEvent(new InputEvent('input',{bubbles:true,data:'发布',inputType:'insertText'})))
      await expectText(page,'input-output','input:composition:发布')
      await input.press('Enter')
      await expectText(page,'input-output','enter:enter:发布')
      await input.press('Escape')
      await expectText(page,'input-output','clear:escape:')
      assert.equal(await input.inputValue(),'')
      const password=page.locator('#interaction-input-password')
      const passwordRoot=password.locator('xpath=../..')
      const toggle=passwordRoot.getByRole('button')
      assert.equal(await password.getAttribute('type'),'password')
      assert.equal(await toggle.getAttribute('aria-pressed'),'false')
      await toggle.click()
      await expectText(page,'input-output','password:control:true')
      assert.equal(await password.getAttribute('type'),'text')
      assert.equal(await toggle.getAttribute('aria-pressed'),'true')
      await page.locator('#interaction-input-set-api').click()
      await expectText(page,'input-output','change:fixture-api:api-release')
      await page.locator('#interaction-input-focus-api').click()
      await expectFocused(page,input)
    },
  },
  {
    name:'textarea-ime-autosize-submit-clear-rtl',
    query:'direction=rtl',
    run:async page=>{
      const textarea=page.locator('#interaction-textarea')
      await textarea.scrollIntoViewIfNeeded()
      const root=textarea.locator('xpath=../..')
      assert.equal(await root.getAttribute('data-ui-textarea'),'')
      assert.equal(await root.getAttribute('data-state'),'ready')
      assert.equal(await textarea.getAttribute('name'),'releaseNotes')
      assert.equal(await textarea.getAttribute('aria-required'),'true')
      const initialHeight=Number.parseFloat(await textarea.evaluate(node=>node.style.height))
      assert.ok(initialHeight>0)
      await textarea.focus()
      await textarea.dispatchEvent('compositionstart',{data:'发'})
      await textarea.evaluate(node=>{node.value='发布说明';node.dispatchEvent(new InputEvent('input',{bubbles:true,data:'发布说明',inputType:'insertCompositionText',isComposing:true}))})
      await expectText(page,'textarea-output','ready:release draft')
      await textarea.dispatchEvent('compositionend',{data:'发布说明'})
      await textarea.evaluate(node=>node.dispatchEvent(new InputEvent('input',{bubbles:true,data:'发布说明',inputType:'insertText'})))
      await expectText(page,'textarea-output','input:composition:发布说明')
      await textarea.fill('发布说明\n第一行\n第二行\n第三行\n第四行')
      const grownHeight=Number.parseFloat(await textarea.evaluate(node=>node.style.height))
      assert.ok(grownHeight>=initialHeight)
      await textarea.press('Control+Enter')
      await expectText(page,'textarea-output','submit:submit:发布说明\n第一行\n第二行\n第三行\n第四行')
      await textarea.press('Escape')
      await expectText(page,'textarea-output','clear:escape:')
      assert.equal(await textarea.inputValue(),'')
      const parser=page.locator('#interaction-textarea-parser')
      assert.equal(await parser.inputValue(),'RELEASE NOTES')
      await parser.focus()
      assert.equal(await parser.inputValue(),'release notes')
      await parser.fill('  PUBLISHED NOTES  ')
      await parser.blur()
      await expectText(page,'textarea-output','change:change:published notes')
      assert.equal(await parser.inputValue(),'PUBLISHED NOTES')
      assert.equal(await page.locator('#interaction-textarea-locked').getAttribute('readonly'),'')
      await page.locator('#interaction-textarea-set-api').click()
      await expectText(page,'textarea-output','change:fixture-api:api notes')
      await page.locator('#interaction-textarea-resize-api').click()
      await page.locator('#interaction-textarea-focus-api').click()
      await expectFocused(page,textarea)
    },
  },
  {
    name:'tag-selection-close-link-keyboard',
    query:'direction=ltr',
    run:async page=>{
      const tag=page.locator('#interaction-tag-checkable .ui-tag-main')
      await tag.scrollIntoViewIfNeeded()
      assert.equal(await tag.getAttribute('aria-pressed'),'false')
      await tag.click()
      await expectText(page,'tag-output','change:pointer:true')
      assert.equal(await tag.getAttribute('aria-pressed'),'true')
      await tag.focus()
      await tag.press(' ')
      await expectText(page,'tag-output','change:keyboard:false')
      assert.equal(await tag.getAttribute('aria-pressed'),'false')
      const close=page.locator('#interaction-tag-removable .ui-tag-close')
      assert.equal(await close.getAttribute('aria-label'),'Remove tag')
      await close.click()
      await expectText(page,'tag-output','close:pointer')
      assert.equal(await page.locator('#interaction-tag-removable').count(),0)
      const link=page.locator('#interaction-tag-link .ui-tag-main')
      assert.equal(await link.getAttribute('target'),'_blank')
      assert.equal(await link.getAttribute('rel'),'noopener noreferrer')
      assert.equal(await page.locator('#interaction-tag-disabled .ui-tag-main').isDisabled(),true)
    },
  },
  {
    name:'timeline-selection-keyboard-link-disabled',
    query:'direction=rtl',
    run:async page=>{
      const timeline=page.locator('#interaction-timeline')
      await timeline.scrollIntoViewIfNeeded()
      const review=timeline.locator('[data-key="review"] .ui-timeline-content')
      await review.click()
      await expectText(page,'timeline-output','change:pointer:review')
      assert.equal(await review.getAttribute('aria-pressed'),'true')
      await review.focus()
      await review.press('ArrowLeft')
      const release=timeline.locator('[data-key="release"] .ui-timeline-content')
      await expectFocused(page,release)
      assert.equal(await release.getAttribute('target'),'_blank')
      assert.equal(await release.getAttribute('rel'),'noopener noreferrer')
      await release.press('Home')
      await expectFocused(page,timeline.locator('[data-key="audit"] .ui-timeline-content'))
      await page.keyboard.press('End')
      await expectFocused(page,release)
      assert.equal(await timeline.locator('[data-key="approval"] .ui-timeline-content').isDisabled(),true)
      assert.equal(await timeline.getAttribute('aria-label'),'Interaction release timeline')
    },
  },
  {
    name:'breadcrumb-collapse-navigation-focus-rtl',
    query:'direction=rtl',
    run:async page=>{
      const root=page.locator('#interaction-breadcrumb')
      await root.scrollIntoViewIfNeeded()
      assert.equal(await root.getAttribute('data-ui-breadcrumb'),'')
      assert.equal(await root.getAttribute('aria-label'),'Interaction release location')
      assert.equal(await root.locator('.ui-breadcrumb-node').count(),4)
      const overflow=root.getByRole('button',{name:'Show 3 hidden levels'})
      await overflow.focus()
      await overflow.press('Enter')
      await expectText(page,'breadcrumb-output','expand:true:keyboard:3')
      assert.equal(await root.locator('.ui-breadcrumb-node').count(),6)
      await expectFocused(page,root.getByRole('link',{name:'Workspace'}))
      await root.getByRole('link',{name:'Components'}).click()
      await expectText(page,'breadcrumb-output','navigate:pointer:components')
      await page.locator('#breadcrumb-api-navigate').click()
      await expectText(page,'breadcrumb-output','navigate:fixture-api:design')
      assert.equal(await root.locator('[data-key="blocked"]').getAttribute('aria-disabled'),'true')
      assert.equal(await root.locator('[data-key="breadcrumb"]').getAttribute('aria-current'),'page')
      await page.locator('#breadcrumb-api-collapse').click()
      await expectText(page,'breadcrumb-output','expand:false:fixture-api:3')
      assert.equal(await root.locator('.ui-breadcrumb-node').count(),4)
    },
  },
  {
    name:'steps-navigation-keyboard-disabled-rtl',
    query:'direction=rtl',
    run:async page=>{
      const steps=page.locator('#interaction-steps')
      await steps.scrollIntoViewIfNeeded()
      const first=steps.locator('[data-index="0"] .ui-step-main')
      const second=steps.locator('[data-index="1"] .ui-step-main')
      const disabled=steps.locator('[data-index="2"] .ui-step-main')
      const release=steps.locator('[data-index="3"] .ui-step-main')
      assert.equal(await steps.locator('.ui-step-connector').count(),3)
      await first.click()
      await expectText(page,'steps-output','change:pointer:0')
      assert.equal(await first.getAttribute('aria-current'),'step')
      await first.focus()
      await first.press('ArrowLeft')
      await expectFocused(page,second)
      await second.press('ArrowLeft')
      await expectFocused(page,release)
      await release.press('Home')
      await expectFocused(page,first)
      await page.keyboard.press('End')
      await expectFocused(page,release)
      assert.equal(await disabled.isDisabled(),true)
      assert.equal(await steps.getAttribute('aria-label'),'Interaction release steps')
    },
  },
  {
    name:'otp-input-autofill-keyboard-rtl',
    query:'direction=rtl',
    run:async page=>{
      const root=page.locator('.interaction-otp-case .ui-otp-input')
      await root.scrollIntoViewIfNeeded()
      const inputs=root.locator('.ui-otp-input-cell')
      assert.equal(await inputs.count(),6)
      await inputs.first().evaluate(input=>{
        input.value='１２a3-4'
        input.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertReplacementText',data:'１２a3-4'}))
      })
      await expectText(page,'otp-output','input:1234:input:0')
      await expectFocused(page,inputs.nth(4))
      await inputs.nth(4).fill('5')
      await expectFocused(page,inputs.nth(5))
      await inputs.nth(5).fill('6')
      assert.equal((await page.getByTestId('otp-output').innerText()).trim(),'complete:123456:input:5')
      assert.ok(await root.evaluate(node=>node.classList.contains('complete')))
      await inputs.nth(5).press('Backspace')
      await expectText(page,'otp-output','input:12345:backspace:5')
      await inputs.nth(5).press('ArrowRight')
      await expectFocused(page,inputs.nth(4))
      await inputs.nth(4).press('End')
      await expectFocused(page,inputs.nth(5))
      await inputs.nth(5).fill('!')
      await expectText(page,'otp-output','invalid:!:5')
    },
  },
  {
    name:'tooltip-trigger-dismissal',
    run:async page=>{
      const clickTrigger=page.getByRole('button',{name:'Tooltip click trigger'})
      await clickTrigger.click()
      const clickTooltip=page.getByRole('tooltip',{name:/Click-triggered release guidance/})
      await clickTooltip.waitFor()
      await expectText(page,'tooltip-output','open:click')
      assert.match(await clickTrigger.getAttribute('aria-describedby'),/ui-tooltip-/)
      assert.equal(await clickTooltip.getAttribute('data-placement'),'bottom-start')
      await page.keyboard.press('Escape')
      await clickTooltip.waitFor({state:'hidden'})
      await expectText(page,'tooltip-output','close:escape')
      assert.equal(await clickTrigger.getAttribute('aria-describedby'),null)
      await clickTrigger.click();await clickTooltip.waitFor()
      await page.getByRole('button',{name:'Outside target',exact:true}).click()
      await clickTooltip.waitFor({state:'hidden'})
      await expectText(page,'tooltip-output','close:outside')
      const focusTrigger=page.getByRole('button',{name:'Tooltip focus trigger'})
      await focusTrigger.focus();await page.waitForTimeout(30)
      const focusTooltip=page.getByRole('tooltip',{name:/Hover and keyboard focus/})
      await focusTooltip.waitFor()
      await page.mouse.move(0,0);await page.waitForTimeout(30)
      assert.equal(await focusTooltip.isVisible(),true)
      await page.getByRole('button',{name:'Outside target',exact:true}).focus();await focusTooltip.waitFor({state:'hidden'})
    },
  },
  {
    name:'popover-focus-dismissal',
    run:async page=>{
      const trigger=page.getByRole('button',{name:'Popover click trigger'})
      await trigger.click()
      const panel=page.getByRole('dialog',{name:'Release actions'})
      await panel.waitFor()
      await expectText(page,'popover-output','open:click')
      assert.equal(await trigger.getAttribute('aria-expanded'),'true')
      assert.match(await trigger.getAttribute('aria-controls'),/ui-popover-/)
      assert.equal(await panel.getAttribute('data-placement'),'bottom-start')
      await expectFocused(page,page.getByRole('button',{name:'Inspect package'}))
      const finish=page.getByRole('button',{name:'Finish review'})
      await finish.focus();await finish.press('Tab')
      await expectFocused(page,page.getByRole('button',{name:'Inspect package'}))
      await page.getByRole('button',{name:'Keep open'}).click()
      assert.equal(await panel.isVisible(),true)
      await finish.click();await panel.waitFor({state:'hidden'})
      await expectText(page,'popover-output','close:content')
      await expectFocused(page,trigger)
      await trigger.click();await panel.waitFor();await page.keyboard.press('Escape');await panel.waitFor({state:'hidden'})
      await expectText(page,'popover-output','close:escape')
      await expectFocused(page,trigger)
      await trigger.click();await panel.waitFor();await page.getByRole('button',{name:'Popover outside target'}).click();await panel.waitFor({state:'hidden'})
      await expectText(page,'popover-output','close:outside')
      const hoverTrigger=page.getByRole('button',{name:'Popover hover trigger'})
      await hoverTrigger.hover();await page.waitForTimeout(30)
      const hoverPanel=page.getByRole('dialog',{name:'Hover details'})
      await hoverPanel.waitFor();await hoverPanel.hover();await page.waitForTimeout(30)
      assert.equal(await hoverPanel.isVisible(),true)
      await page.getByRole('button',{name:'Popover outside target'}).hover();await hoverPanel.waitFor({state:'hidden'})
      assert.equal(await page.getByRole('button',{name:'Disabled popover'}).getAttribute('aria-disabled'),'true')
    },
  },
  {
    name:'dropdown-menu-keyboard-typeahead',
    run:async page=>{
      const trigger=page.getByRole('button',{name:'Dropdown click trigger'})
      await trigger.focus();await trigger.press('ArrowDown')
      const menu=page.getByRole('menu',{name:'Dropdown click trigger'})
      await menu.waitFor()
      assert.equal(await trigger.getAttribute('aria-expanded'),'true')
      assert.match(await trigger.getAttribute('aria-controls'),/ui-dropdown-/)
      await expectFocused(page,page.getByRole('menuitem',{name:/Inspect package/}))
      await page.keyboard.press('ArrowDown')
      await expectFocused(page,page.getByRole('menuitem',{name:/Copy release link/}))
      await page.keyboard.press('End')
      await expectFocused(page,page.getByRole('menuitem',{name:'Run rollback'}))
      await page.keyboard.press('p')
      await expectFocused(page,page.getByRole('menuitemcheckbox',{name:'Pin evidence'}))
      await page.keyboard.press('Enter')
      await expectText(page,'dropdown-output','select:keyboard:pin')
      assert.equal(await menu.isVisible(),true)
      await page.keyboard.press('Escape');await menu.waitFor({state:'hidden'})
      await expectText(page,'dropdown-output','close:escape')
      await expectFocused(page,trigger)
      await trigger.press('ArrowDown');await menu.waitFor();await page.keyboard.press('Tab');await menu.waitFor({state:'hidden'})
      await expectText(page,'dropdown-output','close:tab')
      await expectFocused(page,page.getByRole('button',{name:'Dropdown context trigger'}))
      const contextTrigger=page.getByRole('button',{name:'Dropdown context trigger'})
      await contextTrigger.click({button:'right'})
      const contextMenu=page.getByRole('menu',{name:'Dropdown context trigger'})
      await contextMenu.waitFor();assert.equal(await contextTrigger.getAttribute('aria-expanded'),'true')
      await page.getByRole('button',{name:'Dropdown outside target'}).click();await contextMenu.waitFor({state:'hidden'})
      assert.equal(await page.getByRole('button',{name:'Disabled dropdown'}).getAttribute('aria-disabled'),'true')
    },
  },
  {
    name:'collapse-keyboard-lifecycle-guard',
    query:'direction=rtl',
    run:async page=>{
      const root=page.locator('#interaction-collapse')
      await root.scrollIntoViewIfNeeded()
      assert.equal(await root.getAttribute('data-ui-collapse'),'')
      assert.equal(await root.getAttribute('aria-label'),'Interaction release sections')
      assert.equal(await root.getByRole('region').count(),1)
      const contract=root.getByRole('button',{name:/Public contract/})
      const evidence=root.getByRole('button',{name:/Verification evidence/})
      const rollback=root.getByRole('button',{name:/Rollback lifecycle/})
      assert.equal(await contract.getAttribute('aria-expanded'),'true')
      assert.equal(await contract.getAttribute('aria-controls'),await root.getByRole('region',{name:/Public contract/}).getAttribute('id'))
      await contract.focus();await contract.press('ArrowDown')
      await expectFocused(page,evidence)
      await expectText(page,'collapse-output','focus:keyboard:evidence')
      await evidence.press('Enter')
      await expectText(page,'collapse-output','pending:evidence')
      assert.equal(await root.getAttribute('aria-busy'),'true')
      await expectText(page,'collapse-output','open:keyboard:evidence')
      assert.equal(await evidence.getAttribute('aria-expanded'),'true')
      assert.equal(await root.getByRole('region').count(),2)
      await evidence.press('Enter')
      await expectText(page,'collapse-output','close:keyboard:evidence')
      assert.equal(await root.getByRole('region').count(),1)
      await contract.focus();await contract.press('ArrowUp')
      await expectFocused(page,rollback)
      assert.equal(await root.getByRole('button',{name:/Restricted section/}).isDisabled(),true)
      await page.locator('#collapse-open-all').click()
      await page.waitForFunction(()=>[...document.querySelectorAll('#interaction-collapse .ui-collapse-item:not(.disabled)')].every(item=>item.dataset.open==='true'))
      await page.locator('#collapse-close-all').click()
      await page.waitForFunction(()=>document.querySelectorAll('#interaction-collapse [role="region"]').length===0)
    },
  },
  {
    name:'float-button-group-backtop-keyboard-rtl',
    query:'direction=rtl',
    run:async page=>{
      const section=page.locator('.interaction-float-button-case')
      const trigger=section.getByRole('button',{name:'Interaction quick actions'})
      await trigger.click()
      await expectText(page,'float-button-output','open:click:true')
      const action=section.getByRole('button',{name:'New floating task'})
      await action.click()
      await expectText(page,'float-button-output','select:pointer:new')
      await trigger.click();await trigger.press('ArrowDown');await expectFocused(page,action)
      await page.keyboard.press('Escape');await expectFocused(page,trigger)
      const backTop=section.getByRole('button',{name:'Back to top'})
      await backTop.click();await expectText(page,'float-button-output','back-top:back-top')
      assert.equal(await section.getByRole('link',{name:'Floating release docs'}).count(),1)
      assert.equal(await section.getByRole('button',{name:'Loading floating action'}).getAttribute('aria-busy'),'true')
    },
  },
  {
    name:'api-reference-discovery',
    query:'direction=ltr&state=api-docs',
    run:async page=>{
      const search=page.getByRole('textbox',{name:'搜索组件 API'})
      await search.fill('Upload')
      await page.waitForFunction(()=>document.querySelector('.api-reference-result')?.textContent?.includes('1 个组件'))
      const upload=page.getByRole('button',{name:/UiUpload/})
      await upload.click()
      assert.equal((await page.locator('.api-reference-detail h2').innerText()).trim(),'UiUpload')
      assert.match(page.url(),/#\/api\?component=UiUpload$/)
      const propRow=page.getByRole('row',{name:/autoUpload/})
      await propRow.waitFor()
      assert.match(await propRow.innerText(),/boolean.*true/is)
      await search.fill('')
      assert.equal(await page.locator('.api-reference-index nav button').count(),92)
    },
  },
]
const requestedCases=caseArgument?[...new Set(caseArgument.split(',').map(value=>value.trim()).filter(Boolean))]:[]
const cases=requestedCases.length?allCases.filter(item=>requestedCases.includes(item.name)):allCases
if(requestedCases.length&&cases.length!==requestedCases.length)throw new Error(`Unknown interaction case: ${requestedCases.filter(name=>!cases.some(item=>item.name===name)).join(', ')}`)

async function expectText(page, testId, expected) {
  const target = page.getByTestId(testId)
  await target.waitFor()
  await page.waitForFunction(([selector, value]) => document.querySelector(selector)?.textContent?.trim() === value, [`[data-testid="${testId}"]`, expected])
  assert.equal((await target.textContent()).trim(), expected)
}

async function expectTextContains(page, testId, expected) {
  const target = page.getByTestId(testId)
  await target.waitFor()
  await page.waitForFunction(([selector, value]) => document.querySelector(selector)?.textContent?.includes(value), [`[data-testid="${testId}"]`, expected])
  assert.match((await target.innerText()).trim(), new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
}

async function expectFocused(page, locator) {
  const handle = await locator.elementHandle()
  assert.ok(handle, 'Expected focus target to exist')
  await page.waitForFunction(node => node === document.activeElement, handle)
  assert.equal(await locator.evaluate(node => node === document.activeElement), true)
}

const { server, origin } = await startFixtureServer(root)
let failures = 0
const allResults = []
try {
  for(const browserName of browserNames){
    const browser=await launchBrowser(browserName)
    const browserResults=[]
    try{
      for (const item of cases) {
        const started = performance.now()
        const context = await browser.newContext({ viewport: { width: 1280, height: 1100 }, locale: 'en-US', reducedMotion: 'reduce' })
        const page = await context.newPage()
        try {
          await navigateFixture(page,`${origin}/interaction-regression.html?${item.query || 'direction=ltr'}`,{timeout:navigationTimeout})
          await page.waitForSelector('body[data-interaction-ready="true"]')
          await item.run(page)
          const durationMs = Math.round(performance.now() - started)
          browserResults.push({ browser:browserName, case: item.name, status: 'passed', durationMs })
          console.log(`INTERACTION PASS browser=${browserName} case=${item.name} duration=${durationMs}ms`)
        } catch (error) {
          failures += 1
          const durationMs = Math.round(performance.now() - started)
          browserResults.push({ browser:browserName, case: item.name, status: 'failed', durationMs, error: error.stack || String(error) })
          console.error(`INTERACTION FAIL browser=${browserName} case=${item.name} duration=${durationMs}ms`)
          console.error(error.stack || error)
        } finally {
          await context.close()
        }
      }
    }finally{
      await browser.close()
    }
    allResults.push(...browserResults)
    writeFileSync(resolve(reportDir, `${browserName}.json`), JSON.stringify({ platform: process.platform, browser:browserName, cases: browserResults }, null, 2) + '\n', 'utf8')
    if(!browserResults.some(result=>result.status==='failed'))console.log(`INTERACTION_BROWSER PASS browser=${browserName} cases=${browserResults.length} platform=${process.platform}`)
  }
  writeFileSync(resolve(reportDir, 'report.json'), JSON.stringify({ platform: process.platform, browsers:browserNames, cases: allResults }, null, 2) + '\n', 'utf8')
  if (failures) process.exitCode = 1
  else console.log(`INTERACTION_REGRESSION PASS browsers=${browserNames.length} cases=${allResults.length} platform=${process.platform}`)
} finally {
  await server.close()
}
