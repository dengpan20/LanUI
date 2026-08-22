// @vitest-environment happy-dom
import { createSSRApp, h, nextTick } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import UiButton from '../src/components/UiButton.vue'
import UiConfigProvider from '../src/components/UiConfigProvider.vue'

describe('P68 UiButton maturity contract',()=>{
  it('keeps legacy variants and provider-resolved sizes compatible',()=>{
    const wrapper=mount(UiConfigProvider,{props:{size:'lg'},slots:{default:()=>h(UiButton,{variant:'danger-outline',icon:'trash'},()=> 'Remove')}})
    const button=wrapper.get('[data-ui-button]')
    expect(button.element.tagName).toBe('BUTTON')
    expect(button.attributes('type')).toBe('button')
    expect(button.classes()).toEqual(expect.arrayContaining(['btn','ui-button','btn-danger-outline','btn-lg']))
    expect(button.attributes('data-state')).toBe('ready')
    expect(button.text()).toContain('Remove')
    expect(button.find('.ui-button-icon-start').exists()).toBe(true)
  })

  it('supports logical icon placement, icon sizing, prefix and suffix slots',()=>{
    const wrapper=mount(UiButton,{
      props:{icon:'download',iconPosition:'end',iconSize:20,variant:'outline'},
      slots:{default:()=> 'Export',prefix:()=>h('span',{class:'typed-prefix'},'CSV'),suffix:()=>h('span',{class:'typed-suffix'},'⌘E')},
    })
    const children=[...wrapper.element.children].map(element=>element.className)
    expect(children.at(-1)).toContain('ui-button-icon-end')
    expect(wrapper.get('.typed-prefix').text()).toBe('CSV')
    expect(wrapper.get('.typed-suffix').text()).toBe('⌘E')
    expect(wrapper.get('svg').attributes('style')).toContain('width: 20px')
    expect(wrapper.attributes('data-icon-position')).toBe('end')
  })

  it('provides accessible icon-only, shape, block and pressed states',()=>{
    const icon=mount(UiButton,{props:{icon:'download',shape:'circle',ariaLabel:'Download package',pressed:true}})
    expect(icon.classes()).toEqual(expect.arrayContaining(['shape-circle','is-icon-only','is-pressed']))
    expect(icon.attributes('aria-label')).toBe('Download package')
    expect(icon.attributes('aria-pressed')).toBe('true')
    const block=mount(UiButton,{props:{block:true,shape:'round'},slots:{default:()=> 'Continue'}})
    expect(block.classes()).toEqual(expect.arrayContaining(['is-block','shape-round']))
  })

  it('renders external links with secure defaults and removes navigation while disabled',async()=>{
    const active=mount(UiButton,{props:{href:'https://example.com/release',target:'_blank',download:'release.tgz'},slots:{default:()=> 'Release'}})
    expect(active.element.tagName).toBe('A')
    expect(active.attributes('href')).toBe('https://example.com/release')
    expect(active.attributes('rel')).toBe('noopener noreferrer')
    expect(active.attributes('download')).toBe('release.tgz')
    const disabled=mount(UiButton,{props:{href:'#blocked',disabled:true},slots:{default:()=> 'Unavailable'}})
    expect(disabled.attributes('href')).toBeUndefined()
    expect(disabled.attributes('aria-disabled')).toBe('true')
    expect(disabled.attributes('tabindex')).toBe('-1')
    await disabled.trigger('click',{detail:1})
    expect(disabled.emitted('click')).toBeUndefined()
  })

  it('forwards native form participation without changing the safe default type',()=>{
    const wrapper=mount(UiButton,{props:{type:'submit',form:'release-form',name:'intent',value:7,autofocus:true},attrs:{id:'publish-button','data-owner':'release'},slots:{default:()=> 'Publish'}})
    expect(wrapper.attributes()).toMatchObject({type:'submit',form:'release-form',name:'intent',value:'7',autofocus:'true','data-owner':'release',id:'publish-button'})
  })

  it('emits one compatible click with typed activation metadata',async()=>{
    const wrapper=mount(UiButton,{props:{variant:'secondary',pressed:'mixed'},slots:{default:()=> 'Toggle'}})
    await wrapper.trigger('click',{detail:1})
    expect(wrapper.emitted('click')).toHaveLength(1)
    const [event,meta]=wrapper.emitted('click')[0]
    expect(event).toBeInstanceOf(MouseEvent)
    expect(meta).toEqual(expect.objectContaining({source:'pointer',variant:'secondary',size:'md',pressed:'mixed',pending:false}))
    expect(wrapper.attributes('aria-pressed')).toBe('mixed')
  })

  it('honors preventDefault and stopPropagation for composed action surfaces',async()=>{
    const parent=vi.fn()
    const wrapper=mount({render:()=>h('div',{onClick:parent},[h(UiButton,{preventDefault:true,stopPropagation:true,onClick:event=>expect(event.defaultPrevented).toBe(true)},()=> 'Contained')])})
    await wrapper.get('[data-ui-button]').trigger('click',{detail:1})
    expect(parent).not.toHaveBeenCalled()
  })

  it('runs async actions with pending semantics and duplicate-click protection',async()=>{
    let finish
    const action=vi.fn(()=>new Promise(resolve=>{finish=resolve}))
    const wrapper=mount(UiButton,{props:{action,loadingText:'Publishing'},slots:{default:()=> 'Publish'}})
    await wrapper.trigger('click',{detail:1})
    await nextTick()
    expect(action).toHaveBeenCalledTimes(1)
    expect(wrapper.attributes('aria-busy')).toBe('true')
    expect(wrapper.attributes('disabled')).toBeDefined()
    expect(wrapper.attributes('data-state')).toBe('loading')
    expect(wrapper.text()).toContain('Publishing')
    await wrapper.trigger('click',{detail:1})
    expect(action).toHaveBeenCalledTimes(1)
    finish({revision:68})
    await nextTick();await nextTick()
    expect(wrapper.emitted('action-start')).toHaveLength(1)
    expect(wrapper.emitted('action-success')?.[0]?.[0]).toEqual({revision:68})
    expect(wrapper.attributes('aria-busy')).toBeUndefined()
    expect(wrapper.attributes('data-state')).toBe('ready')
  })

  it('reports rejected actions and restores the interactive state',async()=>{
    const failure=new Error('publish failed')
    const wrapper=mount(UiButton,{props:{action:()=>Promise.reject(failure)},slots:{default:()=> 'Publish'}})
    await wrapper.trigger('click',{detail:1})
    await nextTick();await nextTick()
    expect(wrapper.emitted('action-error')?.[0]?.[0]).toBe(failure)
    expect(wrapper.attributes('data-state')).toBe('ready')
    expect(wrapper.attributes('disabled')).toBeUndefined()
  })

  it('supports controlled loading content and custom loading visuals',()=>{
    const wrapper=mount(UiButton,{props:{loading:true,loadingText:'Saving'},slots:{default:()=> 'Save',loading:({size})=>h('span',{class:'custom-loading'},size)}})
    expect(wrapper.attributes('aria-busy')).toBe('true')
    expect(wrapper.attributes('aria-disabled')).toBe('true')
    expect(wrapper.get('.custom-loading').text()).toBe('md')
    expect(wrapper.text()).toContain('Saving')
    expect(wrapper.text()).not.toContain('Save')
  })

  it('exposes focus, blur and guarded click methods',async()=>{
    const wrapper=mount(UiButton,{attachTo:document.body,slots:{default:()=> 'Action'}})
    expect(wrapper.vm.focus()).toBe(true)
    expect(document.activeElement).toBe(wrapper.element)
    expect(wrapper.vm.blur()).toBe(true)
    expect(wrapper.vm.click()).toBe(true)
    await nextTick()
    expect(wrapper.emitted('click')).toHaveLength(1)
    expect(wrapper.emitted('click')[0][1].source).toBe('api')
    await wrapper.setProps({disabled:true})
    expect(wrapper.vm.focus()).toBe(false)
    expect(wrapper.vm.click()).toBe(false)
    wrapper.unmount()
  })

  it('renders link, loading, toggle and icon contracts during SSR',async()=>{
    const html=await renderToString(createSSRApp({render:()=>h('main',[
      h(UiButton,{href:'/docs',target:'_blank',icon:'external',iconPosition:'end'},()=> 'Docs'),
      h(UiButton,{loading:true,loadingText:'Loading'}),
      h(UiButton,{pressed:true,shape:'round'},()=> 'Pinned'),
    ])}))
    expect(html).toContain('data-ui-button')
    expect(html).toContain('href="/docs"')
    expect(html).toContain('rel="noopener noreferrer"')
    expect(html).toContain('aria-busy="true"')
    expect(html).toContain('aria-pressed="true"')
    expect(html).toContain('shape-round')
  })
})
