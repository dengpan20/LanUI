// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createSSRApp, h, nextTick } from 'vue'
import { renderToString } from 'vue/server-renderer'
import UiCronEditor from '../src/components/UiCronEditor.vue'
import UiConfigProvider from '../src/components/UiConfigProvider.vue'
import UiFormItem from '../src/components/UiFormItem.vue'
import { cronMatches, getNextCronRuns, parseCronExpression, parseCronField } from '../src/components/cronUtils.js'

describe('P56 cron parser',()=>{
  it('parses wildcards, lists, ranges and steps',()=>{
    const result=parseCronExpression('*/15 8-18/2 1,15 * 1-5')
    expect(result.valid).toBe(true)
    expect([...result.fields.minute.values]).toEqual([0,15,30,45])
    expect([...result.fields.hour.values]).toEqual([8,10,12,14,16,18])
    expect([...result.fields.dayOfMonth.values]).toEqual([1,15])
    expect(result.fields.month.wildcard).toBe(true)
  })

  it.each([
    ['', 'empty'],['0 9 * *','field-count'],['60 9 * * *','out-of-range'],['*/0 * * * *','invalid-step'],['0 9 20-10 * *','invalid-range'],['0 nope * * *','out-of-range'],
  ])('reports a structured error for %j',(expression,code)=>{
    expect(parseCronExpression(expression)).toMatchObject({valid:false,error:{code}})
  })

  it('normalizes Sunday 7 to Sunday 0',()=>{
    const result=parseCronField('0,7',{key:'dayOfWeek',min:0,max:7})
    expect([...result.values]).toEqual([0])
  })

  it('uses Unix OR semantics when both day fields are restricted',()=>{
    const parsed=parseCronExpression('0 9 15 * 1')
    expect(cronMatches(parsed,new Date('2026-06-15T09:00:00Z'),'UTC')).toBe(true)
    expect(cronMatches(parsed,new Date('2026-09-15T09:00:00Z'),'UTC')).toBe(true)
    expect(cronMatches(parsed,new Date('2026-09-16T09:00:00Z'),'UTC')).toBe(false)
  })

  it('finds deterministic upcoming UTC runs without mutating the source date',()=>{
    const from=new Date('2026-08-20T08:07:22Z')
    const runs=getNextCronRuns('*/15 * * * *',{count:3,from,timeZone:'UTC'})
    expect(runs.map(run=>run.toISOString())).toEqual(['2026-08-20T08:15:00.000Z','2026-08-20T08:30:00.000Z','2026-08-20T08:45:00.000Z'])
    expect(from.toISOString()).toBe('2026-08-20T08:07:22.000Z')
  })
})

describe('P56 UiCronEditor',()=>{
  it('renders a five-field breakdown and deterministic preview',()=>{
    const wrapper=mount(UiCronEditor,{props:{modelValue:'0 9 * * 1-5',from:'2026-08-20T08:00:00Z',timeZone:'UTC',previewCount:3,ariaLabel:'Release schedule'}})
    expect(wrapper.attributes('data-valid')).toBe('true')
    expect(wrapper.attributes('data-preset')).toBe('weekdays')
    expect(wrapper.findAll('.ui-cron-field')).toHaveLength(5)
    expect(wrapper.findAll('.ui-cron-run-list li')).toHaveLength(3)
    expect(wrapper.get('input').attributes('aria-label')).toBe('Release schedule')
  })

  it('applies a preset and emits a complete state transition',async()=>{
    const wrapper=mount(UiCronEditor,{props:{modelValue:'0 9 * * 1-5'}})
    await wrapper.findAll('.ui-cron-preset')[0].trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([['*/15 * * * *']])
    expect(wrapper.emitted('change')?.[0]?.[1]).toMatchObject({source:'preset',previous:'0 9 * * 1-5',valid:true})
    expect(wrapper.emitted('preset')?.[0]?.[0]).toMatchObject({key:'every-15-minutes',value:'*/15 * * * *',valid:true})
  })

  it('surfaces invalid input and recovers reactively',async()=>{
    const wrapper=mount(UiCronEditor,{props:{modelValue:'0 9 * * *'}})
    await wrapper.get('input').setValue('61 9 * * *')
    expect(wrapper.attributes('data-valid')).toBe('false')
    expect(wrapper.get('[role="alert"]').text()).toContain('字段值超出允许范围')
    expect(wrapper.emitted('invalid')?.[0]?.[0]).toMatchObject({code:'out-of-range',field:'minute'})
    await wrapper.setProps({modelValue:'0 10 * * *'})
    expect(wrapper.attributes('data-valid')).toBe('true')
  })

  it('supports custom presets, readonly and disabled contracts',async()=>{
    const presets=[{key:'backup',label:'Nightly backup',value:'30 2 * * *'}]
    const wrapper=mount(UiCronEditor,{props:{modelValue:'30 2 * * *',presets,readonly:true}})
    expect(wrapper.findAll('.ui-cron-preset')).toHaveLength(1)
    expect(wrapper.get('.ui-cron-preset').attributes('aria-pressed')).toBe('true')
    expect(wrapper.get('.ui-cron-preset').attributes()).toHaveProperty('disabled')
    expect(wrapper.get('input').attributes()).toHaveProperty('readonly')
    expect(wrapper.vm.setExpression('0 * * * *')).toBe(false)
    await wrapper.setProps({readonly:false,disabled:true})
    expect(wrapper.vm.focus()).toBe(false)
  })

  it('exposes validation, nextRuns, focus and API updates',async()=>{
    const wrapper=mount(UiCronEditor,{attachTo:document.body,props:{modelValue:'0 9 * * *',from:'2026-08-20T08:00:00Z',timeZone:'UTC'}})
    expect(wrapper.vm.validate('bad')).toMatchObject({valid:false,error:{code:'field-count'}})
    expect(wrapper.vm.nextRuns(2).map(value=>value.toISOString())).toEqual(['2026-08-20T09:00:00.000Z','2026-08-21T09:00:00.000Z'])
    expect(wrapper.vm.focus()).toBe(true)
    expect(document.activeElement).toBe(wrapper.get('input').element)
    expect(wrapper.vm.setExpression('0 10 * * *')).toBe(true)
    await nextTick()
    expect(wrapper.get('input').element.value).toBe('0 10 * * *')
    wrapper.unmount()
  })

  it('integrates form labels, help, error state and hidden submission naming',()=>{
    const wrapper=mount(UiFormItem,{props:{label:'同步计划',help:'五字段 Unix Cron',error:'计划格式错误'},slots:{default:()=>h(UiCronEditor,{modelValue:'bad',name:'schedule'})}})
    const input=wrapper.get('.ui-cron-input')
    expect(input.attributes('aria-labelledby')).toBe(wrapper.get('.field-label').attributes('id'))
    expect(input.attributes('aria-describedby')).toContain(wrapper.get('.field-error').attributes('id'))
    expect(input.attributes('aria-invalid')).toBe('true')
    expect(input.attributes('name')).toBe('schedule')
  })

  it('uses provider locale copy',()=>{
    const wrapper=mount({render:()=>h(UiConfigProvider,{locale:'en-US'},()=>h(UiCronEditor,{modelValue:'bad'}))})
    expect(wrapper.text()).toContain('Unix cron requires exactly five fields')
    expect(wrapper.text()).toContain('Next runs')
  })

  it('supports all documented scoped slots',()=>{
    const wrapper=mount(UiCronEditor,{props:{modelValue:'0 9 * * *',from:'2026-08-20T08:00:00Z',timeZone:'UTC'},slots:{
      header:({valid})=>h('b',`header:${valid}`),presets:({active})=>h('i',`preset:${active}`),preview:({runs})=>h('em',`runs:${runs.length}`),actions:({expression})=>h('u',`action:${expression}`),
    }})
    expect(wrapper.text()).toContain('header:true')
    expect(wrapper.text()).toContain('preset:daily')
    expect(wrapper.text()).toContain('runs:5')
    expect(wrapper.text()).toContain('action:0 9 * * *')
  })

  it('renders a stable accessible editor during SSR',async()=>{
    const app=createSSRApp({render:()=>h(UiCronEditor,{modelValue:'0 9 * * 1-5',from:'2026-08-20T08:00:00Z',timeZone:'UTC',ariaLabel:'SSR schedule'})})
    const html=await renderToString(app)
    expect(html).toContain('class="ui-cron-editor')
    expect(html).toContain('data-valid="true"')
    expect(html).toContain('aria-label="SSR schedule"')
    expect(html).toContain('2026')
  })
})
