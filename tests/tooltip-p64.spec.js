// @vitest-environment happy-dom
import { createSSRApp, h, nextTick } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import UiTooltip from '../src/components/UiTooltip.vue'

function mountTooltip(props={},options={}){
  return mount(UiTooltip,{
    attachTo:document.body,
    props:{content:'Release guidance',...props},
    slots:{default:({describedby,open})=>h('button',{'aria-describedby':describedby,'data-open':String(open)},'Help'),...options.slots},
  })
}

afterEach(()=>{
  vi.useRealTimers()
  document.body.innerHTML=''
})

describe('UiTooltip production contract',()=>{
  it('keeps hover and focus reasons independent and restores existing descriptions',async()=>{
    const wrapper=mount(UiTooltip,{
      attachTo:document.body,
      props:{content:'Release guidance'},
      slots:{default:({describedby})=>h('button',{'aria-describedby':['existing-help',describedby].filter(Boolean).join(' ')},'Help')},
    })
    const trigger=wrapper.get('button')
    await wrapper.trigger('mouseenter');await nextTick();await nextTick()
    expect(document.body.querySelector('[role="tooltip"]')?.textContent).toContain('Release guidance')
    expect(trigger.attributes('aria-describedby')).toContain('existing-help')
    expect(trigger.attributes('aria-describedby')).toContain('ui-tooltip-')
    await trigger.trigger('focusin')
    await wrapper.trigger('mouseleave')
    expect(document.body.querySelector('[role="tooltip"]')).not.toBeNull()
    await trigger.trigger('focusout',{relatedTarget:null});await nextTick()
    expect(document.body.querySelector('[role="tooltip"]')).toBeNull()
    expect(trigger.attributes('aria-describedby')).toBe('existing-help')
    wrapper.unmount()
  })

  it('honors show and hide delays while cancelling stale timers',async()=>{
    vi.useFakeTimers()
    const wrapper=mountTooltip({showDelay:120,hideDelay:80})
    await wrapper.trigger('mouseenter')
    vi.advanceTimersByTime(100);await nextTick()
    expect(document.body.querySelector('[role="tooltip"]')).toBeNull()
    await wrapper.trigger('mouseleave')
    vi.advanceTimersByTime(30)
    await wrapper.trigger('mouseenter')
    vi.advanceTimersByTime(120);await nextTick();await nextTick()
    expect(document.body.querySelector('[role="tooltip"]')).not.toBeNull()
    await wrapper.trigger('mouseleave')
    vi.advanceTimersByTime(50)
    await wrapper.trigger('mouseenter')
    vi.advanceTimersByTime(100);await nextTick()
    expect(document.body.querySelector('[role="tooltip"]')).not.toBeNull()
    wrapper.unmount()
  })

  it('supports click toggling, outside dismissal and Escape metadata',async()=>{
    const wrapper=mountTooltip({trigger:'click'})
    await wrapper.get('button').trigger('click');await nextTick();await nextTick()
    expect(document.body.querySelector('[role="tooltip"]')).not.toBeNull()
    document.body.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));await nextTick()
    expect(document.body.querySelector('[role="tooltip"]')).toBeNull()
    expect(wrapper.emitted('hide')?.at(-1)?.[0].source).toBe('outside')
    await wrapper.get('button').trigger('click');await nextTick()
    document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));await nextTick()
    expect(document.body.querySelector('[role="tooltip"]')).toBeNull()
    expect(wrapper.emitted('hide')?.at(-1)?.[0].source).toBe('escape')
    wrapper.unmount()
  })

  it('separates controlled requests from the rendered open state',async()=>{
    const wrapper=mountTooltip({trigger:'click',open:false})
    await wrapper.get('button').trigger('click');await nextTick()
    expect(wrapper.emitted('update:open')?.at(-1)).toEqual([true])
    expect(wrapper.emitted('open-change')?.at(-1)?.[1]).toMatchObject({open:true,previous:false,source:'click'})
    expect(document.body.querySelector('[role="tooltip"]')).toBeNull()
    await wrapper.setProps({open:true});await nextTick();await nextTick()
    expect(document.body.querySelector('[role="tooltip"]')).not.toBeNull()
    document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));await nextTick()
    expect(wrapper.emitted('update:open')?.at(-1)).toEqual([false])
    expect(document.body.querySelector('[role="tooltip"]')).not.toBeNull()
    await wrapper.setProps({open:false});await nextTick()
    expect(document.body.querySelector('[role="tooltip"]')).toBeNull()
    wrapper.unmount()
  })

  it('exposes manual controls and supports content and arrow slots inline',async()=>{
    const wrapper=mountTooltip({trigger:'manual',appendToBody:false,wrap:true,maxWidth:180,tooltipId:'manual-tip'}, {
      slots:{
        content:({placement})=>h('strong',`Placed ${placement}`),
        arrow:()=>h('i',{class:'custom-arrow'}),
      },
    })
    expect(wrapper.vm.show('api')).toBe(true)
    await nextTick();await nextTick()
    const panel=wrapper.get('[role="tooltip"]')
    expect(panel.attributes('id')).toBe('manual-tip')
    expect(panel.classes()).toContain('can-wrap')
    expect(panel.attributes('style')).toContain('--ui-tooltip-max-width: 180px')
    expect(panel.get('strong').text()).toContain('Placed')
    expect(panel.get('.custom-arrow').exists()).toBe(true)
    wrapper.vm.focusTrigger()
    expect(document.activeElement).toBe(wrapper.get('button').element)
    wrapper.vm.hide('api');await nextTick()
    expect(wrapper.find('[role="tooltip"]').exists()).toBe(false)
    wrapper.unmount()
  })

  it('supports numeric zero content, custom stacking and arrow-free surfaces',async()=>{
    const wrapper=mountTooltip({content:0,defaultOpen:true,zIndex:930,arrow:false})
    await nextTick();await nextTick()
    const panel=document.body.querySelector('[role="tooltip"]')
    expect(panel?.textContent).toBe('0')
    expect(panel?.style.zIndex).toBe('930')
    expect(panel?.querySelector('.ui-tooltip-arrow')).toBeNull()
    expect(wrapper.get('button').attributes('aria-describedby')).toContain('ui-tooltip-')
    document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));await nextTick()
    expect(document.body.querySelector('[role="tooltip"]')).toBeNull()
    wrapper.unmount()
  })

  it('suppresses empty or disabled tooltips without emitting an open request',async()=>{
    const empty=mountTooltip({content:''})
    await empty.trigger('mouseenter');await nextTick()
    expect(empty.emitted('update:open')).toBeUndefined()
    empty.unmount()
    const disabled=mountTooltip({disabled:true})
    await disabled.trigger('mouseenter');await nextTick()
    expect(disabled.emitted('update:open')).toBeUndefined()
    expect(document.body.querySelector('[role="tooltip"]')).toBeNull()
    disabled.unmount()
  })

  it('renders deterministic inline SSR output for default-open guidance',async()=>{
    const html=await renderToString(createSSRApp({render:()=>h(UiTooltip,{content:'SSR guidance',defaultOpen:true,appendToBody:false,tooltipId:'ssr-tip'},{default:()=>h('button','Help')})}))
    expect(html).toContain('data-state="open"')
    expect(html).toContain('id="ssr-tip"')
    expect(html).toContain('role="tooltip"')
    expect(html).toContain('SSR guidance')
  })
})
