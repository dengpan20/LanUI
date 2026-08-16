// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import UiQRCode from '../src/components/UiQRCode.vue'
import UiConfigProvider from '../src/components/UiConfigProvider.vue'

const value='https://lan-ui.example/components/qr-code'

afterEach(()=>vi.restoreAllMocks())

describe('P54 UiQRCode',()=>{
  it('renders a real crisp SVG module matrix with accessible naming',()=>{
    const wrapper=mount(UiQRCode,{props:{value,label:'Project sign-in code'}})
    const svg=wrapper.get('svg')
    expect(svg.attributes('role')).toBe('img')
    expect(svg.attributes('shape-rendering')).toBe('crispEdges')
    expect(svg.get('title').text()).toBe('Project sign-in code')
    expect(svg.get('path').attributes('d')).toMatch(/^M0 0h1v1h-1z/)
    expect(svg.attributes('viewBox')).toMatch(/^0 0 \d+ \d+$/)
    expect(wrapper.attributes('data-level')).toBe('M')
    expect(wrapper.attributes('data-status')).toBe('active')
  })

  it('re-encodes value and error-correction level reactively',async()=>{
    const wrapper=mount(UiQRCode,{props:{value:'A',level:'L'}})
    const first=wrapper.get('path').attributes('d')
    await wrapper.setProps({value:'A much longer scheduling payload with UTF-8 内容',level:'H'})
    expect(wrapper.attributes('data-level')).toBe('H')
    expect(wrapper.get('path').attributes('d')).not.toBe(first)
  })

  it('clamps unsafe display dimensions and margins',()=>{
    const wrapper=mount(UiQRCode,{props:{value,size:12,margin:99}})
    expect(wrapper.get('svg').attributes('width')).toBe('64')
    expect(wrapper.get('svg').attributes('height')).toBe('64')
    expect(wrapper.get('svg').attributes('viewBox')).toBe('0 0 61 61')
  })

  it('adds an icon plate without removing the encoded matrix',()=>{
    const wrapper=mount(UiQRCode,{props:{value,icon:'data:image/svg+xml,%3Csvg/%3E',iconSize:40}})
    expect(wrapper.get('path').attributes('d').length).toBeGreaterThan(100)
    expect(wrapper.get('image').attributes('href')).toContain('data:image/svg+xml')
    expect(Number(wrapper.get('image').attributes('width'))).toBeGreaterThan(0)
  })

  it.each([
    ['loading','正在生成二维码'],
    ['scanned','二维码已扫描'],
  ])('announces the %s state',async(status,text)=>{
    const wrapper=mount(UiQRCode,{props:{value,status}})
    expect(wrapper.attributes('data-status')).toBe(status)
    expect(wrapper.get('.ui-qr-code-overlay').attributes('role')).toBe('status')
    expect(wrapper.get('.ui-qr-code-overlay').text()).toContain(text)
    if(status==='loading')expect(wrapper.get('.ui-qr-code-frame').attributes('aria-busy')).toBe('true')
  })

  it('emits a refresh request from the expired state',async()=>{
    const wrapper=mount(UiQRCode,{props:{value,status:'expired'}})
    await wrapper.get('.ui-qr-code-action').trigger('click')
    expect(wrapper.emitted('refresh')).toEqual([[{value}]])
  })

  it('surfaces encoding overflow as an alert and error event',async()=>{
    const wrapper=mount(UiQRCode,{props:{value:'x'.repeat(5000)}})
    await wrapper.vm.$nextTick()
    expect(wrapper.attributes('data-status')).toBe('invalid')
    expect(wrapper.find('.ui-qr-code-symbol').exists()).toBe(false)
    expect(wrapper.get('[role="alert"]').text()).toContain('二维码数据无效')
    expect(wrapper.emitted('error')?.[0]?.[0]).toBeInstanceOf(Error)
  })

  it('uses provider locale copy',()=>{
    const wrapper=mount({render:()=>h(UiConfigProvider,{locale:'en-US'},()=>h(UiQRCode,{value,status:'expired'}))})
    expect(wrapper.text()).toContain('QR code expired')
    expect(wrapper.text()).toContain('Refresh')
  })

  it('exposes deterministic SVG serialization',()=>{
    const wrapper=mount(UiQRCode,{props:{value,size:128,level:'Q',label:'Download code'}})
    const source=wrapper.vm.toSvg()
    expect(source).toContain('xmlns="http://www.w3.org/2000/svg"')
    expect(source).toContain('aria-label="Download code"')
    expect(source).toContain('width="128" height="128"')
    expect(wrapper.vm.toSvg()).toBe(source)
  })

  it('downloads serialized SVG and emits metadata',async()=>{
    const createObjectURL=vi.spyOn(URL,'createObjectURL').mockReturnValue('blob:qr-code')
    const revokeObjectURL=vi.spyOn(URL,'revokeObjectURL').mockImplementation(()=>{})
    const click=vi.spyOn(HTMLAnchorElement.prototype,'click').mockImplementation(()=>{})
    const wrapper=mount(UiQRCode,{props:{value,downloadable:true,downloadName:'release-window'}})
    await wrapper.get('.ui-qr-code-caption .ui-qr-code-action').trigger('click')
    expect(createObjectURL).toHaveBeenCalledOnce()
    expect(click).toHaveBeenCalledOnce()
    expect(wrapper.emitted('download')?.[0]?.[0]).toMatchObject({value,filename:'release-window.svg'})
    expect(wrapper.emitted('download')?.[0]?.[0].svg).toContain('<svg')
    await new Promise(resolve=>setTimeout(resolve,0))
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:qr-code')
  })

  it('supports overlay, caption and actions slots',()=>{
    const wrapper=mount(UiQRCode,{props:{value,status:'expired',caption:'Fallback'},slots:{
      overlay:({status})=>h('strong',`overlay:${status}`),
      caption:({status})=>h('span',`caption:${status}`),
      actions:({status})=>h('span',`actions:${status}`),
    }})
    expect(wrapper.text()).toContain('overlay:expired')
    expect(wrapper.text()).toContain('caption:expired')
    expect(wrapper.text()).toContain('actions:expired')
    expect(wrapper.text()).not.toContain('Fallback')
  })

  it('renders deterministic accessible SVG during SSR',async()=>{
    const app=createSSRApp({render:()=>h(UiQRCode,{value,label:'SSR QR code',status:'scanned'})})
    const html=await renderToString(app)
    expect(html).toContain('class="ui-qr-code')
    expect(html).toContain('role="img"')
    expect(html).toContain('SSR QR code')
    expect(html).toContain('data-status="scanned"')
  })
})
