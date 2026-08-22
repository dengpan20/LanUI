// @vitest-environment happy-dom
import { defineComponent, h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UiBadge from '../src/components/UiBadge.vue'
import UiConfigProvider from '../src/components/UiConfigProvider.vue'
import UiListToolbar from '../src/components/UiListToolbar.vue'
import UiPagination from '../src/components/UiPagination.vue'
import UiProgress from '../src/components/UiProgress.vue'
import UiTransfer from '../src/components/UiTransfer.vue'
import UiUpload from '../src/components/UiUpload.vue'
import { createLanUi, createLocaleTools, defineLocale, enUS, useLocale } from '../src/index.js'

describe('Intl locale runtime',()=>{
  it('resolves per-key fallback, plural choices and disabled fallback',()=>{
    const locale=defineLocale({name:'fr-FR',messages:{
      greeting:'Bonjour {name}',
      items:{'=0':'Aucun article',one:'{count} article',other:'{count} articles'},
    }})
    const tools=createLocaleTools(locale,enUS)
    expect(tools.t('greeting',{name:'Lan'})).toBe('Bonjour Lan')
    expect(tools.t('empty.title')).toBe('No data')
    expect(tools.tc('items',0)).toBe('Aucun article')
    expect(tools.tc('items',1)).toBe('1 article')
    expect(tools.tc('items',1200)).toBe(`1${String.fromCharCode(8239)}200 articles`)
    expect(createLocaleTools(locale,false).t('empty.title')).toBe('empty.title')
  })

  it('formats numbers, dates, relative time and lists with deterministic options',()=>{
    const tools=createLocaleTools('en-US',false)
    expect(tools.formatNumber(1234567.89,{maximumFractionDigits:2})).toBe('1,234,567.89')
    expect(tools.formatDate('2026-08-12T00:00:00Z',{dateStyle:'medium',timeZone:'UTC'})).toBe('Aug 12, 2026')
    expect(tools.formatRelativeTime(-1,'day',{numeric:'auto'})).toBe('yesterday')
    expect(tools.formatList(['Alpha','Beta','Gamma'])).toBe('Alpha, Beta, and Gamma')
    expect(tools.formatDate('invalid')).toBe('')
  })

  it('reacts to application locale and fallback changes without remounting',async()=>{
    const Consumer=defineComponent({setup(){const locale=useLocale();return()=>h('output',{
      'data-name':locale.locale.value.name,
      'data-fallback':locale.fallbackLocale.value?.name||'none',
    },`${locale.t('empty.title')}|${locale.formatNumber(1234)}|${locale.tc('items',2)}`)}})
    const french=defineLocale({name:'fr-FR',messages:{items:{one:'{count} article',other:'{count} articles'}}})
    const plugin=createLanUi({locale:french,fallbackLocale:'en-US'})
    const wrapper=mount(Consumer,{global:{plugins:[plugin]}})
    expect(wrapper.text()).toBe(`No data|1${String.fromCharCode(8239)}234|2 articles`)
    expect(wrapper.attributes('data-fallback')).toBe('en-US')
    plugin.setLocale('en-US');plugin.setFallbackLocale(false);await nextTick()
    expect(wrapper.attributes('data-name')).toBe('en-US')
    expect(wrapper.attributes('data-fallback')).toBe('none')
    expect(wrapper.text()).toContain('No data|1,234|items')
  })

  it('localizes component counters, page numbers, progress and upload sizes',()=>{
    const arabic={name:'ar-EG',messages:{}}
    const plugin=createLanUi({locale:arabic,fallbackLocale:'en-US'})
    const wrapper=mount(defineComponent({setup:()=>()=>h('div',[
      h(UiBadge,{value:1234,max:2000}),
      h(UiListToolbar,{total:1234,selectedCount:12}),
      h(UiPagination,{page:1,pageSize:10,total:1234,pageSizeOptions:[10,20]}),
      h(UiProgress,{value:25}),
      h(UiTransfer,{options:[{label:'One',value:1},{label:'Two',value:2}],modelValue:[2]}),
      h(UiUpload,{modelValue:[{id:'a',name:'report.csv',size:1536,status:'success'}]}),
    ])}),{global:{plugins:[plugin]}})
    const nf=new Intl.NumberFormat('ar-EG')
    expect(wrapper.get('.ui-badge').text()).toBe(nf.format(1234))
    expect(wrapper.get('.ui-list-total').text()).toContain(nf.format(1234))
    expect(wrapper.get('.ui-pagination-total').text()).toContain(nf.format(1234))
    expect(wrapper.get('.page-number.active').text()).toBe(new Intl.NumberFormat('ar-EG',{useGrouping:false}).format(1))
    expect(wrapper.get('.ui-progress-text').text()).toBe(new Intl.NumberFormat('ar-EG',{style:'percent',maximumFractionDigits:0}).format(.25))
    expect(wrapper.findAll('.ui-transfer-header>span').map(node=>node.text())).toEqual([`${nf.format(0)} selected / ${nf.format(1)} total`,`${nf.format(0)} selected / ${nf.format(1)} total`])
    expect(wrapper.get('.ui-upload-file-copy small').text()).toContain(`${new Intl.NumberFormat('ar-EG',{minimumFractionDigits:1,maximumFractionDigits:1}).format(1.5)} KB`)
  })

  it('exposes provider fallback state and allows nested fallback opt-out',()=>{
    const wrapper=mount(UiConfigProvider,{props:{locale:{name:'fr-FR',messages:{}},fallbackLocale:false},slots:{default:()=>h('span','Content')}})
    expect(wrapper.attributes('data-ui-locale')).toBe('fr-FR')
    expect(wrapper.attributes('data-ui-fallback-locale')).toBe('none')
  })
})
