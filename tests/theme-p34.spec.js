// @vitest-environment happy-dom
import { createSSRApp, h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { renderToString } from 'vue/server-renderer'
import { afterEach, describe, expect, it } from 'vitest'
import UiButton from '../src/components/UiButton.vue'
import UiConfigProvider from '../src/components/UiConfigProvider.vue'
import { createLanUi } from '../src/plugin.js'
import { createThemeController, darkTheme, defineTheme, lightTheme, mergeThemes, normalizeThemeTokens, themeToStyle } from '../src/theme.js'

const originalMatchMedia=window.matchMedia
afterEach(()=>{Object.defineProperty(window,'matchMedia',{configurable:true,writable:true,value:originalMatchMedia});document.body.innerHTML=''})

describe('P34 theme runtime',()=>{
  it('defines immutable presets and validates known/custom token branches',()=>{
    expect(lightTheme.tokens['bg-surface']).toBe('#ffffff')
    expect(darkTheme.tokens['bg-surface']).toBe('#131e2f')
    expect(Object.isFrozen(darkTheme.tokens)).toBe(true)
    expect(()=>normalizeThemeTokens({unknownAccent:'#123'})).toThrow(/Unknown theme token/)
    expect(()=>normalizeThemeTokens({'brand-600':'red\nblue'})).toThrow(/control characters/)
    expect(()=>defineTheme({name:'invalid-system',appearance:'system'})).toThrow(/light or dark/)
    expect(normalizeThemeTokens({unknownAccent:'#123'},{allowUnknown:true})).toEqual({'unknown-accent':'#123'})
    const tenant=mergeThemes(lightTheme,{name:'tenant',appearance:'light',tokens:{'brand-600':'#1456CC'}})
    expect(tenant.name).toBe('tenant')
    expect(themeToStyle(tenant)['--brand-600']).toBe('#1456CC')
  })

  it('scopes a named dark theme and custom variables without mutating the document root',()=>{
    document.documentElement.dataset.theme='light'
    const tenant=defineTheme({name:'tenant-dark',appearance:'dark',tokens:{'brand-600':'#6EA8FF'}})
    const wrapper=mount(UiConfigProvider,{props:{theme:tenant},slots:{default:()=>h(UiButton,null,()=> 'Scoped action')}})
    expect(wrapper.attributes('data-theme')).toBe('dark')
    expect(wrapper.attributes('data-ui-appearance')).toBe('dark')
    expect(wrapper.attributes('data-ui-resolved-appearance')).toBe('dark')
    expect(wrapper.attributes('data-ui-theme')).toBe('tenant-dark')
    expect(wrapper.attributes('style')).toContain('--brand-600: #6EA8FF')
    expect(wrapper.attributes('style')).toContain('color-scheme: dark')
    expect(document.documentElement.dataset.theme).toBe('light')
  })

  it('inherits appearance and merges nested theme token overrides',()=>{
    const wrapper=mount(UiConfigProvider,{props:{appearance:'dark',theme:{'brand-600':'#111111'}},slots:{default:()=>h(UiConfigProvider,{theme:{'space-2':'10px'}},{default:()=>h('span','Nested')})}})
    const providers=wrapper.findAll('.ui-config-provider')
    expect(providers[1].attributes('data-theme')).toBe('dark')
    expect(providers[1].attributes('data-ui-theme')).toBe('custom')
    expect(providers[1].attributes('style')).toContain('--brand-600: #111111')
    expect(providers[1].attributes('style')).toContain('--space-2: 10px')
  })

  it('reacts to system color-scheme changes and releases its listener',async()=>{
    let listener=null
    let removed=null
    const media={matches:true,addEventListener:(_type,value)=>{listener=value},removeEventListener:(_type,value)=>{removed=value}}
    const reducedMedia={matches:false,addEventListener:()=>{},removeEventListener:()=>{}}
    Object.defineProperty(window,'matchMedia',{configurable:true,writable:true,value:query=>query.includes('color-scheme')?media:reducedMedia})
    const wrapper=mount(UiConfigProvider,{props:{appearance:'system'},slots:{default:()=>h('span','System')}})
    await nextTick()
    expect(wrapper.attributes('data-ui-appearance')).toBe('system')
    expect(wrapper.attributes('data-theme')).toBe('dark')
    media.matches=false
    listener?.({matches:false})
    await nextTick()
    expect(wrapper.attributes('data-theme')).toBe('light')
    wrapper.unmount()
    expect(removed).toBe(listener)
  })

  it('updates plugin appearance and named theme reactively',()=>{
    const plugin=createLanUi({appearance:'system'})
    plugin.setAppearance('dark')
    expect(plugin.config.appearance).toBe('dark')
    plugin.setTheme(defineTheme({name:'tenant',appearance:'light',tokens:{'brand-600':'#1456CC'}}))
    expect(plugin.config.appearance).toBe('light')
    expect(plugin.config.themeName).toBe('tenant')
    expect(plugin.config.theme['brand-600']).toBe('#1456CC')
  })

  it('keeps system appearance deterministic during SSR',async()=>{
    const html=await renderToString(createSSRApp({render:()=>h(UiConfigProvider,{appearance:'system'},{default:()=>h('span','SSR theme')})}))
    expect(html).toContain('data-ui-appearance="system"')
    expect(html).toContain('data-theme="light"')
    expect(html).toContain('color-scheme:light')
  })

  it('persists, follows system changes, notifies and restores a host through the controller',()=>{
    const storage=new Map()
    const listeners=new Set()
    const media={matches:false,addEventListener:(_type,listener)=>listeners.add(listener),removeEventListener:(_type,listener)=>listeners.delete(listener)}
    const host=document.createElement('div')
    host.dataset.theme='legacy'
    const controller=createThemeController({appearance:'system',storageKey:'theme',storage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value)},matchMedia:()=>media})
    const reasons=[]
    controller.subscribe(state=>reasons.push(state.reason))
    controller.mount(host)
    expect(host.dataset.theme).toBe('light')
    media.matches=true
    for(const listener of listeners)listener({matches:true})
    expect(host.dataset.theme).toBe('dark')
    controller.toggle()
    expect(storage.get('theme')).toBe('light')
    controller.dispose()
    expect(host.dataset.theme).toBe('legacy')
    expect(listeners.size).toBe(0)
    expect(reasons).toContain('system')
  })
})
