import assert from 'node:assert/strict'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { launchBrowser, startFixtureServer } from './browser-runtime.mjs'

const root = resolve(import.meta.dirname, '..')
const reportDir = resolve(root, '.verify/interaction', process.platform)
mkdirSync(reportDir, { recursive: true })
const browserArgument=process.argv.find(argument=>argument.startsWith('--browser='))?.split('=')[1]
const requestedBrowsers=browserArgument||process.env.LAN_UI_INTERACTION_BROWSERS||'chromium'
const browserNames=requestedBrowsers==='all'?['chromium','firefox','webkit']:[...new Set(requestedBrowsers.split(',').map(value=>value.trim()).filter(Boolean))]
for(const browserName of browserNames)if(!['chromium','firefox','webkit'].includes(browserName))throw new Error(`Unsupported interaction browser: ${browserName}`)
const caseArgument=process.argv.find(argument=>argument.startsWith('--case='))?.slice('--case='.length)

const allCases = [
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
      await page.locator('.ui-select-menu[role="listbox"]').waitFor()
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
      assert.equal(await paginationCase.getByRole('button', { name: '2', exact: true }).getAttribute('aria-current'), 'page')
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
    name: 'upload-validation-remove',
    run: async page => {
      const input = page.locator('.ui-upload-input')
      await input.setInputFiles({ name: 'fixture.txt', mimeType: 'text/plain', buffer: Buffer.from('Lan UI') })
      await expectText(page, 'upload-output', 'files=1 error=none')
      await input.setInputFiles({ name: 'fixture.png', mimeType: 'image/png', buffer: Buffer.from('not-an-image') })
      assert.match(await page.getByTestId('upload-output').innerText(), /files=1 error=.*fixture\.png/)
      await page.locator('.ui-upload-file .icon-btn').click()
      assert.match(await page.getByTestId('upload-output').innerText(), /^files=0 error=/)
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
      await page.getByRole('button', { name: 'Submit form' }).click()
      await expectText(page, 'form-output', 'invalid')
      assert.equal(await page.getByRole('alert').innerText(), 'Name is required')
      const input = page.getByRole('textbox', { name: 'Name' })
      assert.equal(await input.evaluate(node => node === document.activeElement), true)
      await input.fill('Lan UI')
      await page.getByRole('button', { name: 'Submit form' }).click()
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
]
const requestedCases=caseArgument?[...new Set(caseArgument.split(',').map(value=>value.trim()).filter(Boolean))]:[]
const cases=requestedCases.length?allCases.filter(item=>requestedCases.includes(item.name)):allCases
if(requestedCases.length&&cases.length!==requestedCases.length)throw new Error(`Unknown interaction case: ${requestedCases.filter(name=>!cases.some(item=>item.name===name)).join(', ')}`)

async function expectText(page, testId, expected) {
  const target = page.getByTestId(testId)
  await target.waitFor()
  await page.waitForFunction(([selector, value]) => document.querySelector(selector)?.textContent?.trim() === value, [`[data-testid="${testId}"]`, expected])
  assert.equal((await target.innerText()).trim(), expected)
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
          await page.goto(`${origin}/interaction-regression.html?${item.query || 'direction=ltr'}`, { waitUntil: 'domcontentloaded', timeout: 60000 })
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
