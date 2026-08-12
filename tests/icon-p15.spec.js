// @vitest-environment happy-dom
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UiButton from '../src/components/UiButton.vue'
import UiConfigProvider from '../src/components/UiConfigProvider.vue'
import UiIcon from '../src/components/UiIcon.vue'
import { BUILTIN_ICON_NAMES, createIconRegistry, defineIcon } from '../src/icons.js'
import { createLanUi } from '../src/plugin.js'

const customSquare='<rect x="4" y="4" width="16" height="16" rx="3"/>'

describe('public icon infrastructure',()=>{
  it('provides a deterministic protected built-in catalog and isolated custom registries',()=>{
    expect(BUILTIN_ICON_NAMES).toHaveLength(46)
    expect(BUILTIN_ICON_NAMES).toEqual([...BUILTIN_ICON_NAMES].sort())
    const first=createIconRegistry({brandMark:customSquare})
    const second=createIconRegistry()
    expect(first.has('brandMark')).toBe(true)
    expect(second.has('brandMark')).toBe(false)
    expect(first.unregister('circle')).toBe(false)
    expect(first.unregister('brandMark')).toBe(true)
    expect(first.has('brandMark')).toBe(false)
  })

  it('normalizes safe geometry and rejects executable or malformed fragments',()=>{
    expect(defineIcon({body:customSquare,viewBox:'0 0 32 32'})).toMatchObject({viewBox:'0 0 32 32'})
    expect(()=>defineIcon('<script/>')).toThrow('Unsupported icon element')
    expect(()=>defineIcon('<path onclick="alert(1)"/>')).toThrow('Unsupported icon attribute')
    expect(()=>defineIcon('<path d="M0 0"></path>')).toThrow('self-closing SVG geometry')
    expect(()=>defineIcon({body:customSquare,viewBox:'0 0 24'})).toThrow('four numeric values')
  })

  it('renders decorative and labelled icons with fallback, transforms and motion state',()=>{
    const decorative=mount(UiIcon,{props:{name:'missing-name',size:24,rotate:90,flip:'horizontal',spin:true}})
    expect(decorative.attributes('aria-hidden')).toBe('true')
    expect(decorative.attributes('role')).toBeUndefined()
    expect(decorative.attributes('data-ui-icon')).toBe('missing-name')
    expect(decorative.find('circle').exists()).toBe(true)
    expect(decorative.classes()).toContain('is-spinning')
    expect(decorative.attributes('style')).toContain('scale(-1, 1) rotate(90deg)')
    const labelled=mount(UiIcon,{props:{name:'info',ariaLabel:'More information'}})
    expect(labelled.attributes('role')).toBe('img')
    expect(labelled.attributes('aria-label')).toBe('More information')
    expect(labelled.attributes('aria-hidden')).toBeUndefined()
  })

  it('mirrors directional icons from the configured RTL context',()=>{
    const plugin=createLanUi({direction:'rtl'})
    const wrapper=mount(UiIcon,{props:{name:'chevronRight',directional:true},global:{plugins:[plugin]}})
    expect(wrapper.attributes('style')).toContain('scale(-1, 1)')
  })

  it('propagates plugin and provider registries into existing icon-consuming components',()=>{
    const plugin=createLanUi({icons:{tenantMark:customSquare}})
    const button=mount(UiButton,{props:{icon:'tenantMark'},slots:{default:'Tenant action'},global:{plugins:[plugin]}})
    expect(button.find('[data-ui-icon="tenantMark"] rect').exists()).toBe(true)
    const local=createIconRegistry({localMark:'<circle cx="12" cy="12" r="5"/>'})
    const host=mount({components:{UiConfigProvider,UiIcon},setup:()=>({local}),template:'<UiConfigProvider :icon-registry="local"><UiIcon name="localMark"/></UiConfigProvider>'})
    expect(host.find('[data-ui-icon="localMark"] circle').exists()).toBe(true)
  })

  it('renders the same isolated custom icon during server rendering',async()=>{
    const plugin=createLanUi({icons:{serverMark:customSquare}})
    const app=createSSRApp({render:()=>h(UiIcon,{name:'serverMark',ariaLabel:'Server mark'})})
    app.use(plugin)
    const html=await renderToString(app)
    expect(html).toContain('data-ui-icon="serverMark"')
    expect(html).toContain('aria-label="Server mark"')
    expect(html).toContain('<rect')
  })
})
