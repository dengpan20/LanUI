// @vitest-environment happy-dom
import { createSSRApp, h, nextTick } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import UiPopover from '../src/components/UiPopover.vue'

function mountPopover(props={},options={}){
  return mount(UiPopover,{
    attachTo:document.body,
    props:{title:'Release details',...props},
    slots:{
      trigger:()=>h('button',{'aria-controls':'existing-panel'},'Open details'),
      default:({close})=>h('div',[h('button',{'data-first':''},'First action'),h('button',{onClick:()=>close('content')},'Done')]),
      ...options.slots,
    },
  })
}

afterEach(()=>{
  vi.useRealTimers()
  document.body.innerHTML=''
})

describe('UiPopover production contract',()=>{
  it('supports default click toggling and restores trigger ARIA attributes',async()=>{
    const wrapper=mountPopover()
    const button=wrapper.get('button')
    await nextTick()
    expect(button.attributes('aria-expanded')).toBe('false')
    expect(button.attributes('aria-controls')).toBe('existing-panel')
    await button.trigger('click');await nextTick();await nextTick()
    const panel=document.body.querySelector('[role="dialog"]')
    expect(panel?.textContent).toContain('Release details')
    expect(button.attributes('aria-expanded')).toBe('true')
    expect(button.attributes('aria-controls')).toContain('existing-panel')
    expect(button.attributes('aria-controls')).toContain(panel.id)
    await button.trigger('click');await nextTick()
    expect(document.body.querySelector('[role="dialog"]')).toBeNull()
    expect(wrapper.emitted('close')?.at(-1)?.[0]).toMatchObject({source:'click',open:false,previous:true})
    wrapper.unmount()
    expect(button.element.getAttribute('aria-expanded')).toBeNull()
    expect(button.element.getAttribute('aria-controls')).toBe('existing-panel')
  })

  it('separates controlled requests from rendered state and closes externally-opened panels',async()=>{
    const wrapper=mountPopover({modelValue:false})
    const button=wrapper.get('button')
    await button.trigger('click');await nextTick()
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([true])
    expect(document.body.querySelector('[role="dialog"]')).toBeNull()
    await wrapper.setProps({modelValue:true});await nextTick();await nextTick()
    expect(document.body.querySelector('[role="dialog"]')).not.toBeNull()
    await button.trigger('click');await nextTick()
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([false])
    expect(wrapper.emitted('open-change')?.at(-1)?.[1]).toMatchObject({source:'click',previous:true})
    expect(document.body.querySelector('[role="dialog"]')).not.toBeNull()
    await wrapper.setProps({modelValue:false});await nextTick()
    expect(document.body.querySelector('[role="dialog"]')).toBeNull()
    wrapper.unmount()
  })

  it('keeps hover and focus reasons independent while cancelling stale delay timers',async()=>{
    vi.useFakeTimers()
    const wrapper=mountPopover({trigger:['hover','focus'],showDelay:100,hideDelay:80})
    const trigger=wrapper.get('.ui-popover-trigger')
    await trigger.trigger('mouseenter')
    vi.advanceTimersByTime(70);await nextTick()
    expect(document.body.querySelector('[role="dialog"]')).toBeNull()
    await trigger.trigger('mouseleave')
    await trigger.trigger('mouseenter')
    vi.advanceTimersByTime(100);await nextTick();await nextTick()
    expect(document.body.querySelector('[role="dialog"]')).not.toBeNull()
    await wrapper.get('button').trigger('focusin')
    await trigger.trigger('mouseleave')
    vi.advanceTimersByTime(100);await nextTick()
    expect(document.body.querySelector('[role="dialog"]')).not.toBeNull()
    await wrapper.get('button').trigger('focusout',{relatedTarget:null})
    vi.advanceTimersByTime(80);await nextTick()
    expect(document.body.querySelector('[role="dialog"]')).toBeNull()
    wrapper.unmount()
  })

  it('dismisses on outside pointer and Escape with source metadata and focus return',async()=>{
    const wrapper=mountPopover()
    const trigger=wrapper.get('button')
    await trigger.trigger('click');await nextTick();await nextTick()
    document.body.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));await nextTick()
    expect(wrapper.emitted('close')?.at(-1)?.[0].source).toBe('outside')
    await trigger.trigger('click');await nextTick();await nextTick()
    document.querySelector('[data-first]').focus()
    document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));await nextTick();await nextTick()
    expect(wrapper.emitted('close')?.at(-1)?.[0].source).toBe('escape')
    expect(document.activeElement).toBe(trigger.element)
    wrapper.unmount()
  })

  it('supports content dismissal, keep-open regions, title/footer/arrow slots and inline rendering',async()=>{
    const wrapper=mountPopover({defaultOpen:true,appendToBody:false,closeOnContentClick:true,popoverId:'inline-popover'}, {
      slots:{
        title:()=>h('span','Custom title'),
        default:()=>h('button',{'data-popover-keep-open':''},'Keep open'),
        footer:({close})=>h('button',{onClick:()=>close('content')},'Finish'),
        arrow:()=>h('i',{class:'custom-arrow'}),
      },
    })
    await nextTick();await nextTick()
    expect(wrapper.get('[role="dialog"]').attributes('id')).toBe('inline-popover')
    expect(wrapper.get('.ui-popover-title').text()).toBe('Custom title')
    expect(wrapper.get('.custom-arrow').exists()).toBe(true)
    await wrapper.get('[data-popover-keep-open]').trigger('click');await nextTick()
    expect(wrapper.find('[role="dialog"]').exists()).toBe(true)
    await wrapper.get('.ui-popover-footer button').trigger('click');await nextTick()
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
    wrapper.unmount()
  })

  it('auto-focuses and traps focus inside an interactive panel',async()=>{
    const wrapper=mountPopover({defaultOpen:true,appendToBody:false,autoFocus:true,trapFocus:true})
    await nextTick();await nextTick()
    const buttons=wrapper.findAll('.ui-popover-body button')
    expect(document.activeElement).toBe(buttons[0].element)
    buttons[1].element.focus()
    await wrapper.get('[role="dialog"]').trigger('keydown',{key:'Tab'})
    expect(document.activeElement).toBe(buttons[0].element)
    await wrapper.get('[role="dialog"]').trigger('keydown',{key:'Tab',shiftKey:true})
    expect(document.activeElement).toBe(buttons[1].element)
    wrapper.unmount()
  })

  it('exposes manual controls, sizing, stacking, loading and role semantics',async()=>{
    const wrapper=mountPopover({title:'',trigger:'manual',appendToBody:false,width:320,minWidth:180,maxWidth:'90vw',zIndex:940,loading:true,role:'menu',ariaLabel:'Release actions',arrow:false})
    expect(wrapper.vm.show('api')).toBe(true)
    await nextTick();await nextTick()
    const panel=wrapper.get('[role="menu"]')
    expect(panel.attributes('aria-label')).toBe('Release actions')
    expect(panel.attributes('aria-busy')).toBe('true')
    expect(panel.attributes('style')).toContain('width: 320px')
    expect(panel.attributes('style')).toContain('min-width: 180px')
    expect(panel.attributes('style')).toContain('max-width: 90vw')
    expect(panel.attributes('style')).toContain('z-index: 940')
    expect(wrapper.find('.ui-popover-arrow').exists()).toBe(false)
    expect(wrapper.vm.focusPanel()).toBe(true)
    wrapper.vm.hide('api');await nextTick()
    expect(wrapper.find('[role="menu"]').exists()).toBe(false)
    wrapper.unmount()
  })

  it('suppresses disabled panels and exposes disabled trigger semantics',async()=>{
    const wrapper=mountPopover({disabled:true})
    await nextTick()
    expect(wrapper.get('button').attributes('aria-disabled')).toBe('true')
    await wrapper.get('button').trigger('click');await nextTick()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(document.body.querySelector('[role="dialog"]')).toBeNull()
    wrapper.unmount()
  })

  it('renders deterministic default-open inline SSR output',async()=>{
    const html=await renderToString(createSSRApp({render:()=>h(UiPopover,{defaultOpen:true,appendToBody:false,popoverId:'ssr-popover',title:'SSR details'},{trigger:()=>h('button','Open'),default:()=>h('span','SSR popover content')})}))
    expect(html).toContain('data-state="open"')
    expect(html).toContain('id="ssr-popover"')
    expect(html).toContain('role="dialog"')
    expect(html).toContain('SSR popover content')
  })
})
