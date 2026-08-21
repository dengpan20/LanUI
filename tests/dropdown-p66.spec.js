// @vitest-environment happy-dom
import { createSSRApp, h, nextTick } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import UiDropdown from '../src/components/UiDropdown.vue'

const items=[
  {type:'heading',label:'Workspace'},
  {key:'edit',label:'Edit profile',icon:'edit',description:'Update account details'},
  {key:'disabled',label:'Disabled action',disabled:true},
  {divider:true},
  {key:'copy',label:'Copy link',role:'menuitemcheckbox',checked:true,shortcut:'Ctrl+C'},
  {key:'delete',label:'Delete account',danger:true},
]

function mountDropdown(props={},options={}){
  return mount(UiDropdown,{
    attachTo:document.body,
    props:{items,...props},
    slots:{
      trigger:()=>h('button',{'aria-controls':'legacy-menu'},'More actions'),
      ...options.slots,
    },
  })
}
async function settle(){await nextTick();await nextTick();await nextTick()}

afterEach(()=>{
  vi.useRealTimers()
  document.body.innerHTML=''
})

describe('UiDropdown production menu contract',()=>{
  it('supports default uncontrolled click toggling and restores trigger ARIA',async()=>{
    const wrapper=mountDropdown()
    const trigger=wrapper.get('button')
    await settle()
    expect(trigger.attributes('aria-expanded')).toBe('false')
    expect(trigger.attributes('aria-haspopup')).toBe('menu')
    expect(trigger.attributes('aria-controls')).toMatch(/^ui-dropdown-/)
    await trigger.trigger('click');await settle()
    const menu=document.body.querySelector('[role="menu"]')
    expect(menu).not.toBeNull()
    expect(trigger.attributes('aria-expanded')).toBe('true')
    expect(menu.getAttribute('aria-labelledby')).toBe(`${menu.id}-trigger`)
    await trigger.trigger('click');await settle()
    expect(document.body.querySelector('[role="menu"]')).toBeNull()
    expect(wrapper.emitted('close')?.at(-1)?.[0]).toMatchObject({source:'click',previous:true})
    wrapper.unmount()
    expect(trigger.element.getAttribute('aria-expanded')).toBeNull()
    expect(trigger.element.getAttribute('aria-controls')).toBe('legacy-menu')
  })

  it('separates controlled open requests from rendered state',async()=>{
    const wrapper=mountDropdown({modelValue:false})
    const trigger=wrapper.get('button')
    await trigger.trigger('click');await settle()
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([true])
    expect(document.body.querySelector('[role="menu"]')).toBeNull()
    await wrapper.setProps({modelValue:true});await settle()
    expect(document.body.querySelector('[role="menu"]')).not.toBeNull()
    await trigger.trigger('click');await settle()
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([false])
    expect(document.body.querySelector('[role="menu"]')).not.toBeNull()
    await wrapper.setProps({modelValue:false});await settle()
    expect(document.body.querySelector('[role="menu"]')).toBeNull()
    wrapper.unmount()
  })

  it('opens from arrow keys, skips non-actions, loops, typeaheads and selects with metadata',async()=>{
    const wrapper=mountDropdown()
    const trigger=wrapper.get('button')
    await trigger.trigger('keydown',{key:'ArrowDown'});await settle()
    const menu=document.body.querySelector('[role="menu"]')
    const actionItems=[...menu.querySelectorAll('[role^="menuitem"]')]
    expect(document.activeElement.textContent).toContain('Edit profile')
    menu.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));await settle()
    expect(document.activeElement.textContent).toContain('Copy link')
    menu.dispatchEvent(new KeyboardEvent('keydown',{key:'End',bubbles:true,cancelable:true}));await settle()
    expect(document.activeElement.textContent).toContain('Delete account')
    menu.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));await settle()
    expect(document.activeElement.textContent).toContain('Edit profile')
    menu.dispatchEvent(new KeyboardEvent('keydown',{key:'c',bubbles:true,cancelable:true}));await settle()
    expect(document.activeElement.textContent).toContain('Copy link')
    menu.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}));await settle()
    expect(wrapper.emitted('select')?.at(-1)?.[0]).toMatchObject({key:'copy',checked:true})
    expect(wrapper.emitted('select')?.at(-1)?.[1]).toMatchObject({index:4,key:'copy',source:'keyboard',value:'copy'})
    expect(document.body.querySelector('[role="menu"]')).toBeNull()
    expect(document.activeElement).toBe(trigger.element)
    expect(actionItems.length).toBe(4)
    wrapper.unmount()
  })

  it('keeps hover and focus reasons independent with cancellable delays',async()=>{
    vi.useFakeTimers()
    const wrapper=mountDropdown({trigger:['hover','focus'],showDelay:100,hideDelay:80})
    const triggerRoot=wrapper.get('.ui-dropdown-trigger')
    await triggerRoot.trigger('mouseenter')
    vi.advanceTimersByTime(70);await nextTick()
    expect(document.body.querySelector('[role="menu"]')).toBeNull()
    await triggerRoot.trigger('mouseleave')
    await triggerRoot.trigger('mouseenter')
    vi.advanceTimersByTime(100);await settle()
    const menu=document.body.querySelector('[role="menu"]')
    expect(menu).not.toBeNull()
    await wrapper.get('button').trigger('focusin')
    await triggerRoot.trigger('mouseleave')
    vi.advanceTimersByTime(100);await nextTick()
    expect(document.body.querySelector('[role="menu"]')).not.toBeNull()
    await wrapper.get('button').trigger('focusout',{relatedTarget:null})
    vi.advanceTimersByTime(80);await nextTick()
    expect(document.body.querySelector('[role="menu"]')).toBeNull()
    wrapper.unmount()
  })

  it('dismisses on outside pointer and Escape with focus return metadata',async()=>{
    const wrapper=mountDropdown()
    const trigger=wrapper.get('button')
    await trigger.trigger('click');await settle()
    document.body.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));await settle()
    expect(wrapper.emitted('close')?.at(-1)?.[0].source).toBe('outside')
    await trigger.trigger('keydown',{key:'ArrowDown'});await settle()
    document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));await settle()
    expect(wrapper.emitted('close')?.at(-1)?.[0].source).toBe('escape')
    expect(document.activeElement).toBe(trigger.element)
    wrapper.unmount()
  })

  it('supports headings, separators, checked roles, descriptions and persistent selection',async()=>{
    const wrapper=mountDropdown({defaultOpen:true,appendToBody:false,closeOnSelect:false,loading:true})
    await settle()
    expect(wrapper.get('[role="presentation"]').text()).toBe('Workspace')
    expect(wrapper.get('[role="separator"]').exists()).toBe(true)
    expect(wrapper.get('[role="menuitemcheckbox"]').attributes('aria-checked')).toBe('true')
    expect(wrapper.get('.ui-dropdown-item-content small').text()).toContain('Update account')
    expect(wrapper.get('[role="menu"]').attributes('aria-busy')).toBe('true')
    await wrapper.get('[role="menuitemcheckbox"]').trigger('click');await settle()
    expect(wrapper.find('[role="menu"]').exists()).toBe(true)
    expect(wrapper.emitted('select')?.at(-1)?.[1]).toMatchObject({source:'pointer'})
    wrapper.unmount()
  })

  it('moves Tab to the next logical control while closing a teleported menu',async()=>{
    const wrapper=mountDropdown()
    const next=document.createElement('button');next.textContent='Next control';document.body.append(next)
    await wrapper.get('button').trigger('keydown',{key:'ArrowDown'});await settle()
    const menu=document.body.querySelector('[role="menu"]')
    menu.dispatchEvent(new KeyboardEvent('keydown',{key:'Tab',bubbles:true,cancelable:true}));await settle()
    expect(document.body.querySelector('[role="menu"]')).toBeNull()
    expect(document.activeElement).toBe(next)
    expect(wrapper.emitted('close')?.at(-1)?.[0].source).toBe('tab')
    wrapper.unmount()
  })

  it('exposes manual controls, sizing, active control, slots and empty state',async()=>{
    const wrapper=mountDropdown({items:[],trigger:'manual',appendToBody:false,minWidth:220,maxWidth:'90vw',zIndex:950,ariaLabel:'Release actions'}, {slots:{empty:()=>h('strong','Nothing available'),default:({close})=>h('button',{class:'custom-close',onClick:()=>close('content')},'Close')}})
    expect(wrapper.vm.show('api')).toBe(true)
    await settle()
    const menu=wrapper.get('[role="menu"]')
    expect(menu.attributes('aria-label')).toBe('Release actions')
    expect(menu.attributes('style')).toContain('min-width: 220px')
    expect(menu.attributes('style')).toContain('max-width: 90vw')
    expect(menu.attributes('style')).toContain('z-index: 950')
    expect(wrapper.get('.ui-dropdown-empty').text()).toBe('Nothing available')
    expect(wrapper.vm.focusItem()).toBe(false)
    await wrapper.get('.custom-close').trigger('click');await settle()
    expect(wrapper.find('[role="menu"]').exists()).toBe(false)
    wrapper.unmount()
  })

  it('suppresses disabled interaction and annotates the trigger',async()=>{
    const wrapper=mountDropdown({disabled:true})
    await settle()
    expect(wrapper.get('button').attributes('aria-disabled')).toBe('true')
    await wrapper.get('button').trigger('click');await settle()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(document.body.querySelector('[role="menu"]')).toBeNull()
    wrapper.unmount()
  })

  it('renders deterministic default-open inline SSR output',async()=>{
    const html=await renderToString(createSSRApp({render:()=>h(UiDropdown,{defaultOpen:true,appendToBody:false,menuId:'ssr-dropdown',items:[{label:'SSR action'}]},{trigger:()=>h('button','Open menu')})}))
    expect(html).toContain('data-state="open"')
    expect(html).toContain('id="ssr-dropdown"')
    expect(html).toContain('role="menu"')
    expect(html).toContain('SSR action')
    expect(html).toContain('aria-labelledby="ssr-dropdown-trigger"')
  })
})
