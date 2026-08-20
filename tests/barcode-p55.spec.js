// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import UiBarcode from '../src/components/UiBarcode.vue'
import UiConfigProvider from '../src/components/UiConfigProvider.vue'

const value='LAN-UI-151'

afterEach(()=>vi.restoreAllMocks())

describe('P55 UiBarcode',()=>{
  it('renders a real crisp SVG encoding with accessible naming',()=>{
    const wrapper=mount(UiBarcode,{props:{value,label:'Release asset barcode'}})
    const svg=wrapper.get('svg')
    expect(svg.attributes('role')).toBe('img')
    expect(svg.attributes('shape-rendering')).toBe('crispEdges')
    expect(svg.get('title').text()).toBe('Release asset barcode')
    expect(svg.get('path').attributes('d')).toMatch(/^M\d+ \d+h\d+v\d+h-\d+z/)
    expect(wrapper.attributes('data-format')).toBe('CODE128')
    expect(wrapper.attributes('data-status')).toBe('active')
    expect(wrapper.vm.getEncoding()).toMatchObject({format:'CODE128',modules:145,segments:1})
    expect(wrapper.vm.getEncoding().bits).toMatch(/^[01]+$/)
  })

  it.each([
    ['CODE39','LANUI151',160],['EAN13','5901234123457',95],['EAN8','96385074',67],['UPC','123456789999',95],
    ['ITF14','10012345000017',135],['codabar','A123456A',81],['pharmacode','1234',38],
  ])('encodes %s as a scanner-readable binary stream',(format,input,modules)=>{
    const wrapper=mount(UiBarcode,{props:{value:input,format}})
    expect(wrapper.vm.getEncoding()).toMatchObject({format,modules})
    expect(wrapper.vm.getEncoding().bits).toHaveLength(modules)
  })

  it('re-encodes value and format reactively',async()=>{
    const wrapper=mount(UiBarcode,{props:{value:'LANUI',format:'CODE39'}})
    const first=wrapper.vm.getEncoding().bits
    await wrapper.setProps({value:'96385074',format:'EAN8'})
    expect(wrapper.attributes('data-format')).toBe('EAN8')
    expect(wrapper.vm.getEncoding().bits).not.toBe(first)
    expect(wrapper.vm.getEncoding().modules).toBe(67)
  })

  it('clamps unsafe rendering dimensions and can hide display text',()=>{
    const wrapper=mount(UiBarcode,{props:{value:'A',width:.1,height:1,margin:99,fontSize:2,textMargin:99,displayValue:false}})
    const svg=wrapper.get('svg')
    expect(Number(svg.attributes('width'))).toBe(wrapper.vm.getEncoding().modules*.5+128)
    expect(svg.attributes('height')).toBe('152')
    expect(wrapper.find('text').exists()).toBe(false)
  })

  it.each([['loading','正在生成条形码'],['scanned','条形码已扫描']])('announces the %s state',async(status,text)=>{
    const wrapper=mount(UiBarcode,{props:{value,status}})
    expect(wrapper.attributes('data-status')).toBe(status)
    expect(wrapper.get('.ui-barcode-overlay').attributes('role')).toBe('status')
    expect(wrapper.get('.ui-barcode-overlay').text()).toContain(text)
    if(status==='loading')expect(wrapper.get('.ui-barcode-frame').attributes('aria-busy')).toBe('true')
  })

  it('emits a refresh request from the expired state',async()=>{
    const wrapper=mount(UiBarcode,{props:{value,status:'expired'}})
    await wrapper.get('.ui-barcode-action').trigger('click')
    expect(wrapper.emitted('refresh')).toEqual([[{value,format:'CODE128'}]])
  })

  it.each([{format:'EAN13',value:'not-digits'},{format:'made-up',value}])('surfaces invalid input as an alert and error event',async props=>{
    const wrapper=mount(UiBarcode,{props})
    await wrapper.vm.$nextTick()
    expect(wrapper.attributes('data-status')).toBe('invalid')
    expect(wrapper.find('.ui-barcode-symbol').exists()).toBe(false)
    expect(wrapper.get('[role="alert"]').text()).toContain('条形码数据或格式无效')
    expect(wrapper.emitted('error')?.[0]?.[0]).toBeInstanceOf(Error)
    expect(wrapper.vm.toSvg()).toBe('')
    expect(wrapper.vm.getEncoding()).toBeNull()
  })

  it('uses provider locale copy',()=>{
    const wrapper=mount({render:()=>h(UiConfigProvider,{locale:'en-US'},()=>h(UiBarcode,{value,status:'expired'}))})
    expect(wrapper.text()).toContain('Barcode expired')
    expect(wrapper.text()).toContain('Refresh')
  })

  it('exposes deterministic escaped SVG serialization',()=>{
    const wrapper=mount(UiBarcode,{props:{value,width:2,height:80,label:'Asset <code>',text:'LOT & 151'}})
    const source=wrapper.vm.toSvg()
    expect(source).toContain('xmlns="http://www.w3.org/2000/svg"')
    expect(source).toContain('aria-label="Asset &lt;code&gt;"')
    expect(source).toContain('LOT &amp; 151')
    expect(source).toContain('shape-rendering="crispEdges"')
    expect(wrapper.vm.toSvg()).toBe(source)
  })

  it('downloads serialized SVG and emits metadata',async()=>{
    const createObjectURL=vi.spyOn(URL,'createObjectURL').mockReturnValue('blob:barcode')
    const revokeObjectURL=vi.spyOn(URL,'revokeObjectURL').mockImplementation(()=>{})
    const click=vi.spyOn(HTMLAnchorElement.prototype,'click').mockImplementation(()=>{})
    const wrapper=mount(UiBarcode,{props:{value,downloadable:true,downloadName:'asset-label'}})
    await wrapper.get('.ui-barcode-caption .ui-barcode-action').trigger('click')
    expect(createObjectURL).toHaveBeenCalledOnce()
    expect(click).toHaveBeenCalledOnce()
    expect(wrapper.emitted('download')?.[0]?.[0]).toMatchObject({value,format:'CODE128',filename:'asset-label.svg'})
    expect(wrapper.emitted('download')?.[0]?.[0].svg).toContain('<svg')
    await new Promise(resolve=>setTimeout(resolve,0))
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:barcode')
  })

  it('supports overlay, caption and actions slots',()=>{
    const wrapper=mount(UiBarcode,{props:{value,status:'expired',caption:'Fallback'},slots:{
      overlay:({status})=>h('strong',`overlay:${status}`),
      caption:({format})=>h('span',`caption:${format}`),
      actions:({status})=>h('span',`actions:${status}`),
    }})
    expect(wrapper.text()).toContain('overlay:expired')
    expect(wrapper.text()).toContain('caption:CODE128')
    expect(wrapper.text()).toContain('actions:expired')
    expect(wrapper.text()).not.toContain('Fallback')
  })

  it('renders deterministic accessible SVG during SSR',async()=>{
    const app=createSSRApp({render:()=>h(UiBarcode,{value:'5901234123457',format:'EAN13',label:'SSR asset barcode',status:'scanned'})})
    const html=await renderToString(app)
    expect(html).toContain('class="ui-barcode')
    expect(html).toContain('role="img"')
    expect(html).toContain('SSR asset barcode')
    expect(html).toContain('data-format="EAN13"')
    expect(html).toContain('status-scanned')
    expect(html).toContain('<path')
  })
})
