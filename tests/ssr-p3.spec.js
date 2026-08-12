import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { describe, expect, it } from 'vitest'
import UiButton from '../src/components/UiButton.vue'
import UiAutoComplete from '../src/components/UiAutoComplete.vue'
import UiConfigProvider from '../src/components/UiConfigProvider.vue'
import UiDateRangePicker from '../src/components/UiDateRangePicker.vue'
import UiTimePicker from '../src/components/UiTimePicker.vue'
import UiDrawer from '../src/components/UiDrawer.vue'
import UiModal from '../src/components/UiModal.vue'
import UiNumberInput from '../src/components/UiNumberInput.vue'
import UiSlider from '../src/components/UiSlider.vue'
import UiPopover from '../src/components/UiPopover.vue'
import UiToastHost from '../src/components/UiToastHost.vue'
import UiTree from '../src/components/UiTree.vue'
import UiCommandPalette from '../src/components/UiCommandPalette.vue'
import UiColorPicker from '../src/components/UiColorPicker.vue'
import { openOverlay, overlayCount } from '../src/components/overlayManager.js'
import { createLanUi } from '../src/plugin.js'
import { useToast } from '../src/feedback.js'

async function renderFixture() {
  const context = {}
  const app = createSSRApp({
    render: () => h(UiConfigProvider, { locale:'en-US', size:'lg' }, {
      default: () => [
        h(UiButton, null, () => 'Save'),
        h(UiAutoComplete, { modelValue:'hangzhou', options:[{label:'Hangzhou',value:'hangzhou'}], 'aria-label':'SSR city' }),
        h(UiDateRangePicker, { modelValue:['2026-08-01','2026-08-11'] }),
        h(UiTimePicker, { modelValue:new Date('2026-08-12T01:30:00.000Z'), valueType:'date', timeZone:'Asia/Shanghai' }),
        h(UiNumberInput, { modelValue:12.5, min:0, max:100, step:0.25 }),
        h(UiSlider, { modelValue:[25,75], range:true, ariaLabel:'SSR range' }),
        h(UiTree, { data:[{label:'Workspace',value:'workspace',children:[{label:'Dashboard',value:'dashboard'}]}], defaultExpandedKeys:['workspace'], modelValue:'dashboard', 'aria-label':'SSR resources' }),
        h(UiCommandPalette, { defaultOpen:true, commands:[{key:'dashboard',label:'Open dashboard',group:'Navigate'}] }),
        h(UiColorPicker, { modelValue:'#1677FFCC', alpha:true, defaultOpen:true, 'aria-label':'SSR brand color' }),
        h(UiPopover, { modelValue:true, title:'Details' }, { trigger:() => h('button', 'Open'), default:() => 'Popover content' }),
        h(UiModal, { modelValue:true, title:'Review' }, { default:() => 'Modal content' }),
        h(UiDrawer, { modelValue:true, title:'Filters' }, { default:() => 'Drawer content' }),
      ],
    }),
  })
  const html = await renderToString(app, context)
  return { html, teleports:context.teleports || {} }
}

describe('server rendering', () => {
  it('renders browser-dependent components without a DOM', async () => {
    expect(typeof document).toBe('undefined')
    const result = await renderFixture()
    expect(result.html).toContain('data-ui-locale="en-US"')
    expect(result.html).toContain('btn-lg')
    expect(result.html).toContain('role="combobox"')
    expect(result.html).toContain('SSR city')
    expect(result.html).toContain('Start date')
    expect(result.html).toContain('value="09:30"')
    expect(result.html).toContain('role="spinbutton"')
    expect(result.html).toContain('role="slider"')
    expect(result.html).toContain('SSR range Range start')
    expect(result.html).toContain('role="tree"')
    expect(result.html).toContain('Dashboard')
    expect(result.html).toMatch(/id="ui-number-input-v-\d/)
    expect(result.teleports.body).toContain('Modal content')
    expect(result.teleports.body).toContain('Drawer content')
    expect(result.teleports.body).toContain('Popover content')
    expect(result.teleports.body).toContain('Open dashboard')
    expect(result.teleports.body).toContain('role="listbox"')
    expect(result.teleports.body).toContain('aria-label="Color picker"')
    expect(result.teleports.body).toContain('Saturation and brightness')
    expect(result.html).toContain('SSR brand color')
  })

  it('keeps generated ids stable across equivalent app renders', async () => {
    const first = await renderFixture()
    const second = await renderFixture()
    expect(second.html).toBe(first.html)
    expect(second.teleports.body).toBe(first.teleports.body)
    expect(first.teleports.body).toMatch(/ui-modal-v-\d/)
    expect(first.teleports.body).toMatch(/ui-drawer-v-\d/)
  })

  it('makes the overlay manager a server-side no-op', () => {
    expect(openOverlay('ssr-overlay')).toBe(300)
    expect(overlayCount()).toBe(0)
  })

  it('keeps concurrent request feedback isolated without a DOM',async()=>{
    async function renderRequest(label){
      const plugin=createLanUi({isolated:true})
      const RequestRoot={
        setup(){useToast().success(label,{duration:0});return()=>h(UiToastHost)},
      }
      const app=createSSRApp(RequestRoot)
      app.use(plugin)
      const context={}
      await renderToString(app,context)
      const teleports=context.teleports?.body??''
      plugin.dispose()
      return {teleports,plugin}
    }

    expect(typeof document).toBe('undefined')
    const [first,second]=await Promise.all([renderRequest('Request A'),renderRequest('Request B')])
    expect(first.teleports).toContain('Request A')
    expect(first.teleports).not.toContain('Request B')
    expect(second.teleports).toContain('Request B')
    expect(second.teleports).not.toContain('Request A')
    expect(first.plugin.feedback.disposed).toBe(true)
    expect(second.plugin.feedback.disposed).toBe(true)
  })
})
