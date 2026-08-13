// @vitest-environment happy-dom
import { h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import UiConfigProvider from '../src/components/UiConfigProvider.vue'
import UiModal from '../src/components/UiModal.vue'
import UiPopover from '../src/components/UiPopover.vue'
import UiToastHost from '../src/components/UiToastHost.vue'
import { defineTheme } from '../src/theme.js'

const originalMatchMedia=window.matchMedia
const wrappers=[]
afterEach(()=>{
  while(wrappers.length)wrappers.pop()?.unmount()
  Object.defineProperty(window,'matchMedia',{configurable:true,writable:true,value:originalMatchMedia})
  document.body.innerHTML=''
  document.body.style.overflow=''
})

function mountProvider(props,content){
  const wrapper=mount(UiConfigProvider,{attachTo:document.body,props,slots:{default:content}})
  wrappers.push(wrapper)
  return wrapper
}

describe('P35 Teleport theme scope',()=>{
  it('bridges a named scoped theme and configuration metadata into a floating panel',async()=>{
    const tenant=defineTheme({name:'tenant-night',appearance:'dark',tokens:{'brand-600':'#6EA8FF','bg-surface':'#101827'}})
    const wrapper=mountProvider({locale:'en-US',size:'lg',density:'compact',direction:'rtl',zIndex:900,theme:tenant},()=>h(UiPopover,{modelValue:true,title:'Scoped panel'},{trigger:()=>h('button','Open'),default:()=>h('span','Content')}))
    await nextTick();await nextTick()
    const panel=document.body.querySelector('.ui-popover-panel')
    expect(panel?.dataset.uiTeleportScope).toBe('')
    expect(panel?.dataset.theme).toBe('dark')
    expect(panel?.dataset.uiAppearance).toBe('dark')
    expect(panel?.dataset.uiResolvedAppearance).toBe('dark')
    expect(panel?.dataset.uiTheme).toBe('tenant-night')
    expect(panel?.dataset.uiLocale).toBe('en-US')
    expect(panel?.dataset.uiSize).toBe('lg')
    expect(panel?.dataset.uiDensity).toBe('compact')
    expect(panel?.getAttribute('dir')).toBe('rtl')
    expect(panel?.style.getPropertyValue('--brand-600')).toBe('#6EA8FF')
    expect(panel?.style.getPropertyValue('--bg-surface')).toBe('#101827')
    expect(panel?.style.getPropertyValue('--ui-overlay-base')).toBe('900')
    expect(panel?.style.colorScheme).toBe('dark')
    expect(panel?.style.zIndex).toBe('960')

    await wrapper.setProps({appearance:'light',theme:{'brand-600':'#1456CC'}})
    await nextTick()
    expect(panel?.dataset.theme).toBe('light')
    expect(panel?.dataset.uiTheme).toBe('custom')
    expect(panel?.style.getPropertyValue('--brand-600')).toBe('#1456CC')
    expect(panel?.style.colorScheme).toBe('light')
  })

  it('updates a modal portal when the provider follows system appearance',async()=>{
    let listener=null
    const media={matches:true,addEventListener:(_type,value)=>{listener=value},removeEventListener:()=>{}}
    const reducedMedia={matches:false,addEventListener:()=>{},removeEventListener:()=>{}}
    Object.defineProperty(window,'matchMedia',{configurable:true,writable:true,value:query=>query.includes('color-scheme')?media:reducedMedia})
    mountProvider({appearance:'system',theme:{'brand-600':'#8AB4FF'}},()=>h(UiModal,{modelValue:true,title:'System dialog'}))
    await nextTick();await nextTick()
    const overlay=document.body.querySelector('.ui-modal-overlay')
    expect(overlay?.dataset.uiAppearance).toBe('system')
    expect(overlay?.dataset.theme).toBe('dark')
    expect(overlay?.style.colorScheme).toBe('dark')
    media.matches=false
    listener?.({matches:false})
    await nextTick()
    expect(overlay?.dataset.theme).toBe('light')
    expect(overlay?.dataset.uiResolvedAppearance).toBe('light')
    expect(overlay?.style.colorScheme).toBe('light')
  })

  it('bridges the scope to every repeated toast placement root',async()=>{
    mountProvider({appearance:'dark',theme:{'error-600':'#FF8A80'}},()=>h(UiToastHost,{items:[{id:'failure',type:'error',message:'Save failed',placement:'top-center'}]}))
    await nextTick()
    const placements=[...document.body.querySelectorAll('.toasts')]
    expect(placements).toHaveLength(5)
    expect(placements.every(node=>node.dataset.uiTeleportScope==='')).toBe(true)
    expect(placements.every(node=>node.dataset.theme==='dark')).toBe(true)
    expect(placements.every(node=>node.style.getPropertyValue('--error-600')==='#FF8A80')).toBe(true)
  })

  it('preserves the document theme inheritance path without a local provider',async()=>{
    document.documentElement.dataset.theme='dark'
    const wrapper=mount(UiModal,{attachTo:document.body,props:{modelValue:true,title:'Global dialog'}})
    wrappers.push(wrapper)
    await nextTick();await nextTick()
    const overlay=document.body.querySelector('.ui-modal-overlay')
    expect(overlay?.hasAttribute('data-ui-teleport-scope')).toBe(false)
    expect(overlay?.style.colorScheme).toBe('')
    expect(document.documentElement.dataset.theme).toBe('dark')
  })
})
