// @vitest-environment happy-dom
import { h } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UiConfigProvider from '../src/components/UiConfigProvider.vue'
import UiStatistic from '../src/components/UiStatistic.vue'

function withLocale(props={},slots={}){
  return mount(UiConfigProvider,{props:{locale:'en-US'},slots:{default:()=>h(UiStatistic,props,slots)}})
}

describe('maturity P23 statistic',()=>{
  it('formats finite numbers with locale grouping and exact precision',()=>{
    const wrapper=withLocale({title:'Revenue',value:12345.678,precision:2,prefix:'$',suffix:' USD'})
    const statistic=wrapper.get('.ui-statistic')
    expect(statistic.attributes('aria-labelledby')).toBe(wrapper.get('.ui-statistic-title').attributes('id'))
    expect(wrapper.get('.ui-statistic-value').text()).toBe('12,345.68')
    expect(wrapper.get('.ui-statistic-output').attributes('aria-label')).toBe('$12,345.68 USD')
  })

  it('passes Intl options through the active locale formatter',()=>{
    const wrapper=withLocale({value:.237,formatOptions:{style:'percent',minimumFractionDigits:1,maximumFractionDigits:1},ariaLabel:'Conversion'})
    expect(wrapper.get('.ui-statistic-value').text()).toBe('23.7%')
    expect(wrapper.get('.ui-statistic').attributes('aria-label')).toBe('Conversion')
  })

  it('supports strings, empty placeholders and contained formatter errors',async()=>{
    const wrapper=withLocale({value:'Pending',formatter:value=>`State: ${value}`})
    expect(wrapper.get('.ui-statistic-value').text()).toBe('State: Pending')
    const contained=withLocale({value:null,placeholder:'N/A',formatter:()=>{throw new Error('consumer')}})
    expect(contained.get('.ui-statistic-value').text()).toBe('N/A')
    const invalidIntl=withLocale({value:42,formatOptions:{style:'currency'},ariaValueText:'Forty-two units'})
    expect(invalidIntl.get('.ui-statistic-value').text()).toBe('42')
    expect(invalidIntl.get('.ui-statistic-output').attributes('aria-label')).toBe('Forty-two units')
  })

  it('derives trend direction, tone and localized accessible text',()=>{
    const up=withLocale({value:108,trend:12.5,trendFormatOptions:{minimumFractionDigits:1},title:'Orders'})
    expect(up.get('.ui-statistic-trend').classes()).toContain('direction-up')
    expect(up.get('.ui-statistic-trend').classes()).toContain('tone-positive')
    expect(up.get('.ui-statistic-trend').attributes('aria-label')).toBe('Up 12.5%')
    const down=withLocale({value:4.2,trend:-3,positiveDirection:'down',trendSuffix:' pts',title:'Latency'})
    expect(down.get('.ui-statistic-trend').classes()).toContain('tone-positive')
    expect(down.get('.ui-statistic-trend').attributes('aria-label')).toBe('Down 3 pts')
  })

  it('keeps zero trends neutral and supports a custom trend formatter',()=>{
    const flat=withLocale({value:8,trend:0,title:'Incidents'})
    expect(flat.get('.ui-statistic-trend').classes()).toContain('direction-flat')
    expect(flat.get('.ui-statistic-trend').classes()).toContain('tone-neutral')
    expect(flat.get('.ui-statistic-trend').attributes('aria-label')).toBe('No change 0%')
    const custom=withLocale({value:8,trend:-2,trendFormatter:(value,context)=>`${context.direction}:${Math.abs(value)}`,trendSuffix:'',title:'Custom'})
    expect(custom.get('.ui-statistic-trend').text()).toBe('down:2')
  })

  it('announces live values and exposes a stable loading state',async()=>{
    const wrapper=withLocale({value:42,title:'Active users',live:'polite',loading:true})
    expect(wrapper.get('.ui-statistic').attributes('aria-busy')).toBe('true')
    expect(wrapper.get('.ui-statistic-output').attributes('aria-live')).toBe('polite')
    expect(wrapper.get('.ui-statistic-output').attributes('aria-label')).toBe('Loading statistic')
    expect(wrapper.find('.ui-statistic-skeleton').exists()).toBe(true)
    expect(wrapper.find('.ui-statistic-trend').exists()).toBe(false)
    const ready=withLocale({value:42,title:'Active users',live:'polite',loading:false})
    expect(ready.get('.ui-statistic').attributes('aria-busy')).toBeUndefined()
    expect(ready.get('.ui-statistic-value').text()).toBe('42')
  })

  it('applies size, status and consumer root attributes',()=>{
    const wrapper=mount(UiStatistic,{attrs:{id:'kpi-sales','data-owner':'ops',class:'custom'},props:{value:7,size:'lg',status:'danger',ariaLabel:'Sales'}})
    const root=wrapper.get('#kpi-sales')
    expect(root.classes()).toEqual(expect.arrayContaining(['ui-statistic','size-lg','status-danger','custom']))
    expect(root.attributes('data-owner')).toBe('ops')
    expect(root.attributes('aria-label')).toBe('Sales')
  })

  it('exposes title, prefix, value, suffix, trend and extra slots',()=>{
    const wrapper=mount(UiStatistic,{props:{value:9,title:'Fallback',trend:1},slots:{
      title:scope=>h('strong',`Title:${scope.title}`),
      prefix:scope=>h('i',`P${scope.value}`),
      value:scope=>h('b',`V${scope.formattedValue}`),
      suffix:()=>h('i','S'),
      trend:scope=>h('em',`${scope.direction}/${scope.tone}`),
      extra:()=>h('small','Updated now'),
    }})
    expect(wrapper.get('.ui-statistic-title').text()).toBe('Title:Fallback')
    expect(wrapper.get('.ui-statistic-prefix').text()).toBe('P9')
    expect(wrapper.get('.ui-statistic-value').text()).toBe('V9')
    expect(wrapper.get('.ui-statistic-suffix').text()).toBe('S')
    expect(wrapper.get('.ui-statistic-trend').text()).toBe('up/positive')
    expect(wrapper.get('.ui-statistic-extra').text()).toBe('Updated now')
  })
})
