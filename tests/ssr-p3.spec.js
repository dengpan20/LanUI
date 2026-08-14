import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { describe, expect, it } from 'vitest'
import UiButton from '../src/components/UiButton.vue'
import UiCalendar from '../src/components/UiCalendar.vue'
import UiAutoComplete from '../src/components/UiAutoComplete.vue'
import UiConfigProvider from '../src/components/UiConfigProvider.vue'
import UiDataGrid from '../src/components/UiDataGrid.vue'
import UiDateRangePicker from '../src/components/UiDateRangePicker.vue'
import UiTimePicker from '../src/components/UiTimePicker.vue'
import UiDrawer from '../src/components/UiDrawer.vue'
import UiModal from '../src/components/UiModal.vue'
import UiMentions from '../src/components/UiMentions.vue'
import UiInputTag from '../src/components/UiInputTag.vue'
import UiQueryBuilder from '../src/components/UiQueryBuilder.vue'
import UiNumberInput from '../src/components/UiNumberInput.vue'
import UiOtpInput from '../src/components/UiOtpInput.vue'
import UiSlider from '../src/components/UiSlider.vue'
import UiPopover from '../src/components/UiPopover.vue'
import UiToastHost from '../src/components/UiToastHost.vue'
import UiTree from '../src/components/UiTree.vue'
import UiCommandPalette from '../src/components/UiCommandPalette.vue'
import UiColorPicker from '../src/components/UiColorPicker.vue'
import UiRate from '../src/components/UiRate.vue'
import UiStatistic from '../src/components/UiStatistic.vue'
import UiImage from '../src/components/UiImage.vue'
import UiStatusPage from '../src/components/UiStatusPage.vue'
import UiList from '../src/components/UiList.vue'
import UiVirtualList from '../src/components/UiVirtualList.vue'
import UiWatermark from '../src/components/UiWatermark.vue'
import UiAffix from '../src/components/UiAffix.vue'
import UiSplitter from '../src/components/UiSplitter.vue'
import UiTypography from '../src/components/UiTypography.vue'
import { openOverlay, overlayCount } from '../src/components/overlayManager.js'
import { createLanUi } from '../src/plugin.js'
import { useToast } from '../src/feedback.js'

async function renderFixture() {
  const context = {}
  const app = createSSRApp({
    render: () => h(UiConfigProvider, { locale:'en-US', size:'lg' }, {
      default: () => [
        h(UiButton, null, () => 'Save'),
        h(UiCalendar, { modelValue:['2026-08-10','2026-08-16'], selectionMode:'range', viewDate:'2026-08-01', today:'2026-08-12', showWeekNumbers:true, ariaLabel:'SSR release calendar' }),
        h(UiAutoComplete, { modelValue:'hangzhou', options:[{label:'Hangzhou',value:'hangzhou'}], 'aria-label':'SSR city' }),
        h(UiDataGrid, { columns:[{key:'name',label:'Name',sortable:true},{key:'status',label:'Status'}], rows:[{id:1,name:'SSR DataGrid row',status:'Ready'}], queryFields:['name'], pageSize:10, ariaLabel:'SSR release data grid' }),
        h(UiDateRangePicker, { modelValue:['2026-08-01','2026-08-11'] }),
        h(UiTimePicker, { modelValue:new Date('2026-08-12T01:30:00.000Z'), valueType:'date', timeZone:'Asia/Shanghai' }),
        h(UiNumberInput, { modelValue:12.5, min:0, max:100, step:0.25 }),
        h(UiMentions, { modelValue:'Review with @ada', options:[{label:'Ada Lovelace',value:'ada'}], 'aria-label':'SSR reviewers' }),
        h(UiInputTag, { modelValue:['Vue 3','SSR'], name:'capabilities', editable:true, clearable:true, ariaLabel:'SSR capability tags' }),
        h(UiQueryBuilder, { modelValue:{combinator:'and',rules:[{field:'status',operator:'equals',value:'Ready'}]}, fields:[{key:'status',label:'Status',type:'select',options:['Ready','Review']}], name:'filters', ariaLabel:'SSR release filters' }),
        h(UiOtpInput, { modelValue:'2048', length:4, separator:'-', separatorEvery:2, ariaLabel:'SSR verification code' }),
        h(UiSlider, { modelValue:[25,75], range:true, ariaLabel:'SSR range' }),
        h(UiTree, { data:[{label:'Workspace',value:'workspace',children:[{label:'Dashboard',value:'dashboard'}]}], defaultExpandedKeys:['workspace'], modelValue:'dashboard', 'aria-label':'SSR resources' }),
        h(UiCommandPalette, { defaultOpen:true, commands:[{key:'dashboard',label:'Open dashboard',group:'Navigate'}] }),
        h(UiColorPicker, { modelValue:'#1677FFCC', alpha:true, defaultOpen:true, 'aria-label':'SSR brand color' }),
        h(UiRate, { modelValue:3.5, step:.5, showText:true, ariaLabel:'SSR service rating' }),
        h(UiStatistic, { value:2864000, title:'SSR revenue', prefix:'$', trend:12.6, precision:0 }),
        h(UiImage, { src:'/ssr-thumbnail.jpg', alt:'SSR architecture', preview:true, previewOpen:true, previewList:['/ssr-large-a.jpg','/ssr-large-b.jpg'], previewIndex:1 }),
        h(UiList, { items:[{id:'ssr-list-a',title:'SSR audit item',description:'Review ready'},{id:'ssr-list-b',title:'SSR release item',description:'Published'}], itemKey:'id', modelValue:['ssr-list-a'], selectionMode:'multiple', pagination:{pageSize:1}, ariaLabel:'SSR semantic records' }),
        h(UiVirtualList, { items:Array.from({length:6},(_,index)=>({id:`ssr-${index}`,label:`SSR row ${index+1}`})), modelValue:'ssr-1', selectionMode:'single', height:120, itemSize:40, ariaLabel:'SSR virtual records' }),
        h(UiStatusPage, { status:'403', embedded:true }),
        h(UiWatermark, { content:['Lan UI','SSR'], ariaLabel:'SSR protected document' }, { default:() => h('article', 'SSR watermark content') }),
        h(UiAffix, { position:'top', offset:12 }, { default:() => h('button', 'SSR sticky action') }),
        h(UiSplitter, { panels:[{key:'nav',label:'Navigation',defaultSize:'25%'},{key:'main',label:'Workspace',defaultSize:'50%'},{key:'tools',label:'Inspector',defaultSize:'25%'}], modelValue:[25,50,25], ariaLabel:'SSR splitter' }, { panel:({panel}) => h('section', panel.label) }),
        h(UiTypography, { content:'SSR semantic release note', variant:'paragraph', copyable:true, editable:true, ellipsis:{rows:2,expandable:true}, ariaLabel:'SSR typography' }),
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
    expect(result.html).toContain('SSR release calendar')
    expect(result.html).toContain('aria-multiselectable="true"')
    expect(result.html).toContain('data-date="2026-08-12"')
    expect(result.html).toContain('role="combobox"')
    expect(result.html).toContain('SSR city')
    expect(result.html).toContain('aria-label="SSR release data grid"')
    expect(result.html).toContain('SSR DataGrid row')
    expect(result.html).toContain('Search data')
    expect(result.html).toContain('Start date')
    expect(result.html).toContain('value="09:30"')
    expect(result.html).toContain('role="spinbutton"')
    expect(result.html).toContain('aria-label="SSR reviewers"')
    expect(result.html).toContain('Review with @ada')
    expect(result.html).toContain('aria-label="SSR capability tags"')
    expect(result.html).toContain('class="ui-input-tag-chip"')
    expect(result.html).toContain('name="capabilities"')
    expect(result.html).toContain('aria-label="SSR release filters"')
    expect(result.html).toContain('class="ui-query-builder')
    expect(result.html).toContain('name="filters"')
    expect(result.html).toContain('aria-label="SSR verification code"')
    expect(result.html).toContain('ui-otp-input-separator')
    expect(result.html).toContain('role="slider"')
    expect(result.html).toContain('SSR range Range start')
    expect(result.html).toContain('aria-label="SSR splitter"')
    expect(result.html).toContain('data-ui-splitter="horizontal"')
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
    expect(result.html).toContain('SSR service rating')
    expect(result.html).toContain('3.5 of 5')
    expect(result.html).toContain('SSR revenue')
    expect(result.html).toContain('2,864,000')
    expect(result.html).toContain('Up 12.6%')
    expect(result.html).toContain('src="/ssr-thumbnail.jpg"')
    expect(result.html).toContain('SSR architecture')
    expect(result.teleports.body).toContain('src="/ssr-large-b.jpg"')
    expect(result.teleports.body).toContain('Image 2 of 2')
    expect(result.html).toContain('aria-label="SSR semantic records"')
    expect(result.html).toContain('SSR audit item')
    expect(result.html).toContain('aria-posinset="1"')
    expect(result.html).toContain('aria-label="SSR virtual records"')
    expect(result.html).toContain('aria-setsize="6"')
    expect(result.html).toContain('SSR protected document')
    expect(result.html).toContain('SSR watermark content')
    expect(result.html).toContain('data-ui-affix="top"')
    expect(result.html).toContain('SSR sticky action')
    expect(result.html).toContain('SSR semantic release note')
    expect(result.html).toContain('data-ui-typography="paragraph"')
    expect(result.html).toContain('SSR row 2')
    expect(result.html).toContain('data-status="403"')
    expect(result.html).toContain('Access denied')
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
