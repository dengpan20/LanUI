// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h, nextTick } from 'vue'
import UiConfigProvider from '../src/components/UiConfigProvider.vue'
import UiImage from '../src/components/UiImage.vue'

const wrappers=[]
const render=(props={},slots={})=>{const wrapper=mount(UiImage,{attachTo:document.body,props,slots});wrappers.push(wrapper);return wrapper}
const ready=async wrapper=>{await wrapper.get('.ui-image-media').trigger('load');await nextTick()}
const key=async(value,options={})=>{document.dispatchEvent(new KeyboardEvent('keydown',{key:value,bubbles:true,cancelable:true,...options}));await nextTick()}

afterEach(async()=>{
  for(const wrapper of wrappers.splice(0))wrapper.unmount()
  await nextTick()
  document.body.innerHTML=''
})

describe('maturity P25 image',()=>{
  it('renders native image semantics, sizing, fit and load metadata',async()=>{
    const wrapper=render({src:'/cover.jpg',alt:'Release cover',width:320,height:'180px',aspectRatio:'16/9',fit:'contain',position:'top',radius:12,loading:'eager',crossorigin:'anonymous',referrerpolicy:'no-referrer'})
    const image=wrapper.get('img')
    expect(image.attributes()).toMatchObject({src:'/cover.jpg',alt:'Release cover',loading:'eager',decoding:'async',crossorigin:'anonymous',referrerpolicy:'no-referrer'})
    const figure=wrapper.get('figure')
    expect(figure.attributes('style')).toContain('--ui-image-width: 320px')
    expect(figure.attributes('style')).toContain('--ui-image-fit: contain')
    expect(figure.attributes('aria-busy')).toBe('true')
    await ready(wrapper)
    expect(figure.classes()).toContain('is-loaded')
    expect(wrapper.emitted('load')?.[0]?.[1]).toEqual({src:'/cover.jpg',fallback:false})
  })

  it('normalizes numeric string dimensions while preserving CSS lengths',()=>{
    const pixels=render({src:'/asset.jpg',width:'240',height:'150',radius:'8'})
    expect(pixels.get('figure').attributes('style')).toContain('--ui-image-width: 240px')
    expect(pixels.get('figure').attributes('style')).toContain('--ui-image-height: 150px')
    expect(pixels.get('figure').attributes('style')).toContain('--ui-image-radius: 8px')
    const fluid=render({src:'/fluid.jpg',width:'min(100%, 40rem)',height:'auto'})
    expect(fluid.get('figure').attributes('style')).toContain('--ui-image-width: min(100%, 40rem)')
    expect(fluid.get('figure').attributes('style')).toContain('--ui-image-height: auto')
  })

  it('uses one fallback source, contains terminal errors and retries',async()=>{
    const wrapper=render({src:'/missing.jpg',fallback:'/fallback.jpg',alt:'Fallback'})
    await wrapper.get('img').trigger('error')
    expect(wrapper.get('img').attributes('src')).toBe('/fallback.jpg')
    expect(wrapper.emitted('fallback')?.[0]?.[0]).toMatchObject({failedSrc:'/missing.jpg',fallbackSrc:'/fallback.jpg'})
    await wrapper.get('img').trigger('error')
    expect(wrapper.get('figure').classes()).toContain('is-error')
    expect(wrapper.get('[role="alert"]').text()).toContain('图片加载失败')
    await wrapper.get('.ui-image-retry').trigger('click')
    expect(wrapper.get('img').attributes('src')).toBe('/missing.jpg')
    expect(wrapper.emitted('retry')?.at(-1)).toEqual([{src:'/missing.jpg'}])
  })

  it('opens an accessible preview, locks scroll, traps focus and restores the trigger',async()=>{
    const wrapper=render({src:'/one.jpg',alt:'Architecture diagram',preview:true})
    await ready(wrapper)
    const trigger=wrapper.get('.ui-image-open')
    trigger.element.focus()
    await trigger.trigger('click');await nextTick()
    const dialog=document.body.querySelector('[role="dialog"]')
    expect(dialog?.getAttribute('aria-modal')).toBe('true')
    expect(dialog?.textContent).toContain('100%')
    expect(document.body.style.overflow).toBe('hidden')
    expect(document.activeElement?.classList.contains('ui-image-preview-close')).toBe(true)
    await key('Tab',{shiftKey:true})
    expect(document.activeElement?.getAttribute('aria-label')).toBe('向右旋转')
    document.body.querySelector('.ui-image-preview-close').click();await nextTick();await new Promise(resolve=>setTimeout(resolve,30))
    expect(document.body.querySelector('[role="dialog"]')).toBeNull()
    expect(document.activeElement).toBe(trigger.element)
    expect(wrapper.emitted('preview-close')?.at(-1)?.[0]).toMatchObject({source:'close-button',index:0,src:'/one.jpg'})
  })

  it('navigates a gallery, emits indexes and preloads adjacent images',async()=>{
    const wrapper=render({src:'/thumb.jpg',preview:true,previewList:['/a.jpg','/b.jpg','/c.jpg'],previewIndex:1})
    await ready(wrapper);await wrapper.get('.ui-image-open').trigger('click');await nextTick()
    expect(document.body.querySelector('.ui-image-preview-media')?.getAttribute('src')).toBe('/b.jpg')
    document.body.querySelector('.ui-image-preview-nav.is-next').click();await nextTick()
    expect(document.body.querySelector('.ui-image-preview-media')?.getAttribute('src')).toBe('/c.jpg')
    expect(wrapper.emitted('update:previewIndex')?.at(-1)).toEqual([2])
    expect(wrapper.emitted('preview-change')?.at(-1)).toEqual([{index:2,src:'/c.jpg',source:'control'}])
    document.body.querySelector('.ui-image-preview-nav.is-next').click();await nextTick()
    expect(document.body.querySelector('.ui-image-preview-media')?.getAttribute('src')).toBe('/a.jpg')
  })

  it('honors non-looping gallery boundaries',async()=>{
    const wrapper=render({src:'/thumb.jpg',preview:true,previewList:['/a.jpg','/b.jpg'],loop:false})
    await ready(wrapper);await wrapper.get('.ui-image-open').trigger('click');await nextTick()
    expect(document.body.querySelector('.is-previous').disabled).toBe(true)
    expect(document.body.querySelector('.is-next').disabled).toBe(false)
    document.body.querySelector('.is-next').click();await nextTick()
    expect(document.body.querySelector('.is-next').disabled).toBe(true)
  })

  it('supports gallery, zoom, rotate and reset keyboard operations',async()=>{
    const wrapper=render({src:'/thumb.jpg',preview:true,previewList:['/a.jpg','/b.jpg'],scaleStep:.5})
    await ready(wrapper);await wrapper.get('.ui-image-open').trigger('click');await nextTick()
    await key('ArrowRight')
    expect(wrapper.emitted('preview-change')?.at(-1)?.[0]).toMatchObject({index:1,source:'keyboard'})
    await key('+')
    expect(document.body.querySelector('.ui-image-preview-scale')?.textContent).toBe('150%')
    await key('r')
    expect(document.body.querySelector('.ui-image-preview-media')?.getAttribute('style')).toContain('rotate(90deg)')
    await key('0')
    expect(document.body.querySelector('.ui-image-preview-scale')?.textContent).toBe('100%')
    expect(wrapper.emitted('transform')?.some(([meta])=>meta.source==='keyboard')).toBe(true)
  })

  it('mirrors gallery Arrow navigation in RTL',async()=>{
    const host=mount(UiConfigProvider,{attachTo:document.body,props:{direction:'rtl'},slots:{default:()=>h(UiImage,{src:'/thumb.jpg',preview:true,previewList:['/a.jpg','/b.jpg','/c.jpg'],previewIndex:1})}})
    wrappers.push(host)
    const image=host.findComponent(UiImage)
    await image.get('.ui-image-media').trigger('load');await image.get('.ui-image-open').trigger('click');await nextTick()
    await key('ArrowRight')
    expect(image.emitted('preview-change')?.at(-1)?.[0]).toMatchObject({index:0,source:'keyboard'})
    expect(document.body.querySelector('[role="dialog"]')?.getAttribute('dir')).toBe('rtl')
  })

  it('supports wheel zoom, double-click reset and pointer pan metadata',async()=>{
    const wrapper=render({src:'/one.jpg',preview:true,scaleStep:.5})
    await ready(wrapper);await wrapper.get('.ui-image-open').trigger('click');await nextTick()
    const canvas=document.body.querySelector('.ui-image-preview-canvas')
    canvas.dispatchEvent(new WheelEvent('wheel',{deltaY:-20,bubbles:true,cancelable:true}));await nextTick()
    expect(document.body.querySelector('.ui-image-preview-scale')?.textContent).toBe('150%')
    canvas.dispatchEvent(new MouseEvent('dblclick',{bubbles:true}));await nextTick()
    expect(document.body.querySelector('.ui-image-preview-scale')?.textContent).toBe('100%')
    canvas.dispatchEvent(new MouseEvent('dblclick',{bubbles:true}));await nextTick()
    canvas.dispatchEvent(new PointerEvent('pointerdown',{button:0,pointerId:7,clientX:20,clientY:20,bubbles:true,cancelable:true}));await nextTick()
    expect(canvas.classList.contains('is-dragging')).toBe(true)
    canvas.dispatchEvent(new PointerEvent('pointermove',{pointerId:7,clientX:32,clientY:34,bubbles:true}))
    canvas.dispatchEvent(new PointerEvent('pointerup',{pointerId:7,clientX:32,clientY:34,bubbles:true}));await nextTick()
    expect(canvas.classList.contains('is-dragging')).toBe(false)
    expect(wrapper.emitted('transform')?.at(-1)?.[0].source).toBe('pointer')
  })

  it('supports controlled preview visibility without diverging internal state',async()=>{
    const wrapper=render({src:'/one.jpg',preview:true,previewOpen:false})
    await ready(wrapper);await wrapper.get('.ui-image-open').trigger('click')
    expect(wrapper.emitted('update:previewOpen')?.at(-1)).toEqual([true])
    expect(document.body.querySelector('[role="dialog"]')).toBeNull()
    await wrapper.setProps({previewOpen:true});await nextTick()
    expect(document.body.querySelector('[role="dialog"]')).not.toBeNull()
    await key('Escape')
    expect(wrapper.emitted('update:previewOpen')?.at(-1)).toEqual([false])
    expect(document.body.querySelector('[role="dialog"]')).not.toBeNull()
    await wrapper.setProps({previewOpen:false});await nextTick()
    expect(document.body.querySelector('[role="dialog"]')).toBeNull()
  })

  it('resets loading and preview state when sources change',async()=>{
    const wrapper=render({src:'/one.jpg',preview:true})
    await ready(wrapper);await wrapper.get('.ui-image-open').trigger('click');await nextTick();await key('+')
    await wrapper.setProps({src:'/two.jpg'});await nextTick()
    expect(wrapper.get('figure').classes()).toContain('is-loading')
    expect(wrapper.get('img').attributes('src')).toBe('/two.jpg')
    await ready(wrapper)
    expect(wrapper.find('.ui-image-open').exists()).toBe(true)
  })

  it('exposes placeholder, error, overlay, preview, caption and toolbar slots',async()=>{
    const wrapper=render({src:'/custom.jpg',preview:true},{
      placeholder:()=>h('span',{class:'custom-placeholder'},'Loading asset'),
      error:({retry})=>h('button',{class:'custom-error',onClick:retry},'Retry asset'),
      overlay:({open})=>h('button',{class:'custom-overlay',onClick:open},'Open custom'),
      preview:({src})=>h('div',{class:'custom-preview'},src),
      caption:({index})=>h('span',{class:'custom-caption'},`Caption ${index}`),
      toolbar:({zoomIn})=>h('button',{class:'custom-toolbar',onClick:zoomIn},'Zoom custom'),
    })
    expect(wrapper.get('.custom-placeholder').text()).toBe('Loading asset')
    await ready(wrapper);await wrapper.get('.custom-overlay').trigger('click');await nextTick()
    expect(document.body.querySelector('.custom-preview')?.textContent).toBe('/custom.jpg')
    expect(document.body.querySelector('.custom-caption')?.textContent).toBe('Caption 0')
    document.body.querySelector('.custom-toolbar').click();await nextTick()
    expect(wrapper.emitted('transform')?.at(-1)?.[0].scale).toBe(1.25)
    await key('Escape')
    await wrapper.setProps({src:''});await nextTick()
    expect(wrapper.get('.custom-error').text()).toBe('Retry asset')
  })

  it('keeps disabled preview images non-interactive and contains invalid scale input',async()=>{
    const wrapper=render({src:'/one.jpg',preview:true,disabled:true,minScale:-5,maxScale:0,scaleStep:0})
    await ready(wrapper)
    expect(wrapper.find('.ui-image-open').exists()).toBe(false)
    expect(wrapper.get('figure').classes()).toContain('is-disabled')
    expect(document.body.querySelector('[role="dialog"]')).toBeNull()
  })
})
