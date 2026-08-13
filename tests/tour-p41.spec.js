// @vitest-environment happy-dom
import { createSSRApp, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { renderToString } from 'vue/server-renderer'
import { afterEach, describe, expect, it, vi } from 'vitest'
import UiConfigProvider from '../src/components/UiConfigProvider.vue'
import UiTour from '../src/components/UiTour.vue'
import { overlayCount } from '../src/components/overlayManager.js'
import { lanUiMotionKey } from '../src/motion.js'

const wrappers=[]
function box(left,top,width=120,height=40){return {left,top,right:left+width,bottom:top+height,width,height,x:left,y:top,toJSON(){}}}
function addTarget(id,left=120,top=80){
  const element=document.createElement('button');element.id=id;element.textContent=id;element.getBoundingClientRect=()=>box(left,top);element.scrollIntoView=vi.fn();document.body.append(element);return element
}
function render(props={},options={}){
  const wrapper=mount(UiTour,{attachTo:document.body,props:{modelValue:true,ariaLabel:'Workspace tour',steps:[{target:'#tour-one',title:'First step',description:'Review the first target.'},{target:'#tour-two',title:'Second step',description:'Finish the guide.',placement:'right'}],...props},...options})
  wrappers.push(wrapper);return wrapper
}
async function settle(){await nextTick();await nextTick();await new Promise(resolve=>setTimeout(resolve,20))}

afterEach(()=>{
  while(wrappers.length)wrappers.pop()?.unmount()
  document.body.innerHTML=''
  vi.restoreAllMocks()
})

describe('P41 UiTour',()=>{
  it('positions a labelled modal tour around its target and links the description',async()=>{
    const first=addTarget('tour-one');addTarget('tour-two',420,160)
    render();await settle()
    const dialog=document.querySelector('[data-ui-tour] [role="dialog"]')
    expect(dialog?.textContent).toContain('First step')
    expect(dialog?.getAttribute('aria-modal')).toBe('true')
    expect(dialog?.classList.contains('placement-bottom')).toBe(true)
    expect(dialog?.getAttribute('style')).toContain('--ui-tour-arrow-x:')
    expect(document.querySelectorAll('.ui-tour-mask')).toHaveLength(4)
    expect(document.querySelector('.ui-tour-highlight')?.getAttribute('style')).toContain('left: 112px')
    expect(first.getAttribute('aria-describedby')).toContain(dialog.id)
    expect(first.scrollIntoView).toHaveBeenCalledWith({block:'center',inline:'center',behavior:'smooth'})
    expect(overlayCount()).toBe(1)
  })

  it('moves through controlled steps, emits metadata and finishes',async()=>{
    addTarget('tour-one');addTarget('tour-two',420,160)
    const wrapper=render();await settle()
    document.querySelector('.ui-tour-actions .btn-primary').click();await settle()
    expect(wrapper.emitted('update:current')?.at(-1)).toEqual([1])
    expect(wrapper.emitted('change')?.at(-1)?.slice(0,2)).toEqual([1,0])
    expect(wrapper.emitted('change')?.at(-1)?.[2].source).toBe('next')
    expect(document.querySelector('[role="dialog"]')?.textContent).toContain('Second step')
    document.querySelector('.ui-tour-actions .btn-primary').click()
    expect(wrapper.emitted('finish')).toHaveLength(1)
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([false])
    expect(wrapper.emitted('close')?.at(-1)?.[0].source).toBe('finish')
  })

  it('closes from Escape only at the top overlay and restores focus after control sync',async()=>{
    const origin=addTarget('tour-one');addTarget('tour-two');origin.focus()
    const wrapper=render();await settle()
    document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}))
    expect(wrapper.emitted('close')?.at(-1)?.[0].source).toBe('escape')
    await wrapper.setProps({modelValue:false});await settle()
    expect(document.activeElement).toBe(origin)
    expect(overlayCount()).toBe(0)
    expect(origin.hasAttribute('aria-describedby')).toBe(false)
  })

  it('supports center fallback, missing-target diagnostics and mask-free non-modal mode',async()=>{
    const wrapper=render({mask:false,steps:[{target:'#missing-target',title:'Centered fallback'}]});await settle()
    const dialog=document.querySelector('[role="dialog"]')
    expect(dialog?.getAttribute('aria-modal')).toBeNull()
    expect(dialog?.classList.contains('placement-center')).toBe(true)
    expect(document.querySelector('.ui-tour-mask')).toBeNull()
    expect(document.body.style.overflow).toBe('')
    const tab=new KeyboardEvent('keydown',{key:'Tab',bubbles:true,cancelable:true});dialog.dispatchEvent(tab)
    expect(tab.defaultPrevented).toBe(false)
    expect(wrapper.emitted('target-missing')?.at(-1)?.[0].index).toBe(0)
  })

  it('updates scroll locking when a step changes its mask mode',async()=>{
    addTarget('tour-one');addTarget('tour-two')
    const wrapper=render({steps:[{target:'#tour-one',title:'Masked'},{target:'#tour-two',title:'Non-modal',mask:false}]});await settle()
    expect(document.body.style.overflow).toBe('hidden')
    document.querySelector('.ui-tour-actions .btn-primary').click();await settle()
    expect(document.body.style.overflow).toBe('')
    wrapper.vm.goTo(0);await settle()
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('blocks the target on request and mirrors panel arrow navigation in RTL',async()=>{
    addTarget('tour-one');addTarget('tour-two')
    const wrapper=render({targetClickable:false}, {global:{provide:{[lanUiMotionKey]:ref({resolvedPreference:'reduced'})}}});await settle()
    expect(document.querySelector('.ui-tour-target-blocker')).not.toBeNull()
    const dialog=document.querySelector('[role="dialog"]');dialog.focus()
    await wrapper.setProps({})
    // Recreate the provider boundary to prove RTL key mapping independently of document direction.
    wrapper.unmount();wrappers.pop()
    const host=mount(UiConfigProvider,{attachTo:document.body,props:{direction:'rtl',locale:'en-US'},slots:{default:()=>h(UiTour,{modelValue:true,steps:[{target:'#tour-one',title:'One'},{target:'#tour-two',title:'Two'}]})}});wrappers.push(host);await settle()
    const rtlDialog=document.querySelector('[role="dialog"]');rtlDialog.focus();rtlDialog.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowLeft',bubbles:true,cancelable:true}));await settle()
    expect(rtlDialog.textContent).toContain('Two')
  })

  it('renders deterministic teleport markup during SSR',async()=>{
    const context={}
    const html=await renderToString(createSSRApp({render:()=>h(UiTour,{modelValue:true,ariaLabel:'SSR tour',steps:[{title:'Server step',description:'Stable markup'}]})}),context)
    expect(html).toContain('teleport start')
    expect(context.teleports?.body).toContain('Server step')
    expect(context.teleports?.body).toContain('aria-label="SSR tour"')
  })
})
