// @vitest-environment happy-dom
import { defineComponent, h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UiConfigProvider from '../src/components/UiConfigProvider.vue'
import {
  createLanUi,
  createLocaleRegistry,
  createLocaleTools,
  hasLocale,
  listLocales,
  loadLocale,
  registerLocale,
  unregisterLocale,
  useLocale,
} from '../src/index.js'

const locale=(name,messages={})=>({name,messages})

describe('locale registry and lazy loading',()=>{
  it('registers aliases, lists immutable snapshots and unregisters custom locales',()=>{
    const registry=createLocaleRegistry()
    const registered=registry.register(locale('fr-FR',{greeting:'Bonjour'}),['fr'])
    expect(registry.has('fr')).toBe(true)
    expect(registry.has('FR-fr')).toBe(true)
    expect(registry.get('fr')).toBe(registered)
    expect(()=>registry.register(locale('fr',{greeting:'Alias collision'}))).toThrow('Locale name already registered as an alias')
    const names=registry.list().map(item=>item.name)
    expect(names).toEqual(['zh-CN','en-US','fr-FR'])
    names.push('mutated')
    expect(registry.list()).toHaveLength(3)
    expect(registry.unregister('en')).toBe(false)
    expect(registry.has('en-US')).toBe(true)
    expect(()=>registry.register(locale('fixture',{greeting:'Fixture'}),['en'])).toThrow('Locale alias already registered')
    expect(registry.has('fixture')).toBe(false)
    expect(registry.unregister('fr')).toBe(true)
    expect(registry.has('fr-FR')).toBe(false)
    expect(registry.unregister('fr-FR')).toBe(false)
  })

  it('deduplicates concurrent lazy loads and supports ES module defaults',async()=>{
    const registry=createLocaleRegistry()
    let calls=0
    const loader=async()=>{
      calls+=1
      await Promise.resolve()
      return {default:locale('de-DE',{greeting:'Hallo'})}
    }
    const [first,second]=await Promise.all([
      registry.load('de-DE',loader,{aliases:'de'}),
      registry.load('de-DE',loader,{aliases:'de'}),
    ])
    expect(calls).toBe(1)
    expect(first).toBe(second)
    expect(registry.get('de')?.messages.greeting).toBe('Hallo')
    await registry.load('de-DE',loader)
    expect(calls).toBe(1)
    await registry.load('de-DE',loader,{force:true})
    expect(calls).toBe(2)
  })

  it('clears failed pending loads so a later retry can succeed',async()=>{
    const registry=createLocaleRegistry()
    let attempts=0
    const loader=()=>{
      attempts+=1
      if(attempts===1)throw new Error('temporary failure')
      return locale('it-IT',{greeting:'Ciao'})
    }
    await expect(registry.load('it-IT',loader)).rejects.toThrow('temporary failure')
    await expect(registry.load('it-IT',loader)).resolves.toMatchObject({name:'it-IT'})
    expect(attempts).toBe(2)
  })

  it('resolves a deterministic multi-level fallback chain',()=>{
    const registry=createLocaleRegistry([
      locale('fr-FR',{secondary:'Secondaire'}),
      locale('es-ES',{primary:'Principal'}),
    ])
    const tools=createLocaleTools('es-ES',['fr-FR','en-US'],registry)
    expect(tools.t('primary')).toBe('Principal')
    expect(tools.t('secondary')).toBe('Secondaire')
    expect(tools.t('empty.title')).toBe('No data')
    expect(tools.fallbackLocales.map(item=>item.name)).toEqual(['fr-FR','en-US'])
    expect(createLocaleTools('es-ES',['fr-FR','fr-FR','en-US'],registry).fallbackLocales).toHaveLength(2)
  })

  it('keeps plugin registries isolated and can activate a loaded locale',async()=>{
    const first=createLanUi({locale:'en-US'})
    const second=createLanUi({locale:'en-US'})
    first.registerLocale(locale('pt-BR',{greeting:'Olá'}),['pt'])
    expect(first.hasLocale('pt')).toBe(true)
    expect(second.hasLocale('pt')).toBe(false)
    first.setLocale('pt')
    expect(first.config.locale.name).toBe('pt-BR')
    let calls=0
    await second.loadLocale('ja-JP',async()=>{
      calls+=1
      return {default:locale('ja-JP',{greeting:'こんにちは'})}
    },{activate:true,aliases:'ja'})
    expect(calls).toBe(1)
    expect(second.config.locale.name).toBe('ja-JP')
    expect(second.hasLocale('ja')).toBe(true)
    first.dispose();second.dispose()
  })

  it('reacts to plugin fallback-chain updates without remounting',async()=>{
    const Consumer=defineComponent({setup(){const tools=useLocale();return()=>h('output',{
      'data-chain':tools.fallbackLocales.value.map(item=>item.name).join(','),
      'data-registry':String(tools.localeRegistry.value.list().length),
    },`${tools.t('secondary')}|${tools.t('empty.title')}`)}})
    const plugin=createLanUi({locale:locale('es-ES',{}),fallbackLocale:'en-US'})
    plugin.registerLocale(locale('fr-FR',{secondary:'Secondaire'}))
    const wrapper=mount(Consumer,{global:{plugins:[plugin]}})
    expect(wrapper.text()).toBe('secondary|No data')
    plugin.setFallbackLocale(['fr-FR','en-US'])
    await nextTick()
    expect(wrapper.text()).toBe('Secondaire|No data')
    expect(wrapper.attributes('data-chain')).toBe('fr-FR,en-US')
    expect(wrapper.attributes('data-registry')).toBe('3')
  })

  it('exposes the provider chain and global registry convenience API',async()=>{
    const name='fixture-P13'
    registerLocale(locale(name,{greeting:'Fixture'}),['fixture'])
    expect(hasLocale('fixture')).toBe(true)
    expect(listLocales().some(item=>item.name===name)).toBe(true)
    expect(unregisterLocale('fixture')).toBe(true)
    await loadLocale(name,()=>locale(name,{greeting:'Loaded'}))
    expect(hasLocale(name)).toBe(true)
    unregisterLocale(name)
    const wrapper=mount(UiConfigProvider,{props:{locale:'es-ES',fallbackLocale:['fr-FR','en-US']}})
    expect(wrapper.attributes('data-ui-fallback-locale')).toBe('fr-FR')
    expect(wrapper.attributes('data-ui-fallback-locales')).toBe('fr-FR,en-US')
  })
})
