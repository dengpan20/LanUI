// @vitest-environment happy-dom
import { createSSRApp, h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { renderToString } from 'vue/server-renderer'
import { afterEach, describe, expect, it, vi } from 'vitest'
import UiConfigProvider from '../src/components/UiConfigProvider.vue'
import UiForm from '../src/components/UiForm.vue'
import UiFormItem from '../src/components/UiFormItem.vue'
import UiInput from '../src/components/UiInput.vue'
import UiPopover from '../src/components/UiPopover.vue'
import { createLanUi } from '../src/plugin.js'
import {
  MOTION_PREFERENCES,
  createMotionController,
  motionPreferenceToStyle,
  normalizeMotionPreference,
  resolveMotionPreference,
} from '../src/motion.js'

const originalMatchMedia=window.matchMedia
const wrappers=[]
afterEach(()=>{
  while(wrappers.length)wrappers.pop()?.unmount()
  Object.defineProperty(window,'matchMedia',{configurable:true,writable:true,value:originalMatchMedia})
  document.body.innerHTML=''
})

describe('P36 motion preference runtime',()=>{
  it('normalizes public preferences and exposes immutable reduced-motion variables',()=>{
    expect(MOTION_PREFERENCES).toEqual(['full','reduced','system'])
    expect(normalizeMotionPreference(' REDUCED ')).toBe('reduced')
    expect(resolveMotionPreference('system',true)).toBe('reduced')
    expect(resolveMotionPreference('system',false)).toBe('full')
    expect(motionPreferenceToStyle('reduced')).toEqual({'--motion-time':'.01ms','--motion-count':1,'--motion-scroll':'auto'})
    expect(Object.isFrozen(motionPreferenceToStyle('reduced'))).toBe(true)
  })

  it('persists, follows system changes, toggles and restores the host controller',()=>{
    const storage=new Map([['motion','system']])
    const listeners=new Set()
    const media={matches:false,addEventListener:(_type,listener)=>listeners.add(listener),removeEventListener:(_type,listener)=>listeners.delete(listener)}
    const host=document.createElement('div')
    host.dataset.uiMotion='legacy'
    const controller=createMotionController({preference:'full',storageKey:'motion',storage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value)},matchMedia:()=>media})
    controller.mount(host)
    expect(host.dataset.uiMotionPreference).toBe('system')
    expect(host.dataset.uiMotion).toBe('full')
    media.matches=true
    for(const listener of listeners)listener({matches:true})
    expect(host.dataset.uiMotion).toBe('reduced')
    controller.toggle()
    expect(storage.get('motion')).toBe('full')
    controller.dispose()
    expect(host.dataset.uiMotion).toBe('legacy')
    expect(host.hasAttribute('data-ui-motion-preference')).toBe(false)
    expect(listeners.size).toBe(0)
  })

  it('scopes system reduction and updates teleported floating content',async()=>{
    const records=new Map()
    Object.defineProperty(window,'matchMedia',{configurable:true,writable:true,value:query=>{
      const record={matches:query.includes('reduced-motion'),listeners:new Set(),addEventListener:(_type,listener)=>record.listeners.add(listener),removeEventListener:(_type,listener)=>record.listeners.delete(listener)}
      records.set(query,record)
      return record
    }})
    const wrapper=mount(UiConfigProvider,{attachTo:document.body,props:{appearance:'light',motion:'system'},slots:{default:()=>h(UiPopover,{modelValue:true,title:'Motion scope'},{trigger:()=>h('button','Open'),default:()=>h('span','Panel')})}})
    wrappers.push(wrapper)
    await nextTick();await nextTick()
    const panel=document.body.querySelector('.ui-popover-panel')
    expect(wrapper.attributes('data-ui-motion-preference')).toBe('system')
    expect(wrapper.attributes('data-ui-motion')).toBe('reduced')
    expect(wrapper.attributes('style')).toContain('--motion-time: .01ms')
    expect(panel?.dataset.uiMotionPreference).toBe('system')
    expect(panel?.dataset.uiMotion).toBe('reduced')
    expect(panel?.style.getPropertyValue('--motion-scroll')).toBe('auto')

    await wrapper.setProps({motion:'full'})
    await nextTick()
    expect(wrapper.attributes('data-ui-motion')).toBe('full')
    expect(panel?.dataset.uiMotion).toBe('full')
  })

  it('lets the plugin update motion without disturbing other configuration',()=>{
    const plugin=createLanUi({motion:'system',size:'lg'})
    plugin.setMotion('reduced')
    expect(plugin.config.motion).toBe('reduced')
    expect(plugin.config.size).toBe('lg')
    plugin.setMotion('invalid')
    expect(plugin.config.motion).toBe('reduced')
  })

  it('changes managed form scrolling from smooth to immediate inside a reduced scope',async()=>{
    const scrollIntoView=vi.fn()
    const original=HTMLElement.prototype.scrollIntoView
    HTMLElement.prototype.scrollIntoView=scrollIntoView
    const wrapper=mount(UiConfigProvider,{props:{motion:'reduced'},slots:{default:()=>h(UiForm,{model:{name:''},scrollIntoViewOptions:{block:'center',behavior:'smooth'}},{default:()=>h(UiFormItem,{name:'name',label:'Name'},{default:()=>h(UiInput,{modelValue:''})})})}})
    wrappers.push(wrapper)
    await nextTick()
    wrapper.findComponent(UiForm).vm.scrollToField('name')
    expect(scrollIntoView).toHaveBeenCalledWith({block:'center',behavior:'auto'})
    HTMLElement.prototype.scrollIntoView=original
  })

  it('renders a deterministic full-motion system fallback during SSR',async()=>{
    const html=await renderToString(createSSRApp({render:()=>h(UiConfigProvider,{motion:'system'},{default:()=>h('span','SSR motion')})}))
    expect(html).toContain('data-ui-motion-preference="system"')
    expect(html).toContain('data-ui-motion="full"')
    expect(html).not.toContain('--motion-fast:.01ms')
  })
})
