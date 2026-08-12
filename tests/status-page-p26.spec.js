// @vitest-environment happy-dom
import fs from 'node:fs'
import { h } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UiConfigProvider from '../src/components/UiConfigProvider.vue'
import UiStatusPage from '../src/components/UiStatusPage.vue'
import ForbiddenPage from '../src/pages/ForbiddenPage.vue'
import NotFoundPage from '../src/pages/NotFoundPage.vue'
import ServerErrorPage from '../src/pages/ServerErrorPage.vue'

function withEnglish(props={},slots={}){
  return mount(UiConfigProvider,{props:{locale:'en-US'},slots:{default:()=>h(UiStatusPage,props,slots)}})
}

describe('maturity P26 status page',()=>{
  it.each([
    ['403','Access denied','lock','region'],
    ['404','Page not found','file','region'],
    ['500','Something went wrong','alert','alert'],
  ])('renders localized %s semantics and illustration',(code,title,icon,role)=>{
    const wrapper=withEnglish({status:code})
    const page=wrapper.get('.ui-status-page')
    expect(page.classes()).toContain(`status-${code}`)
    expect(wrapper.get('.ui-status-page-code').text()).toBe(code)
    expect(wrapper.get('h1').text()).toBe(title)
    expect(wrapper.get('.ui-status-page-panel').attributes('role')).toBe(role)
    expect(wrapper.get('[data-ui-icon]').attributes('data-ui-icon')).toBe(icon)
  })

  it('uses navigation actions for 403 and 404',async()=>{
    const wrapper=mount(UiStatusPage,{props:{status:'404'}})
    const buttons=wrapper.findAll('.ui-status-page-actions button')
    expect(buttons).toHaveLength(2)
    await buttons[0].trigger('click')
    await buttons[1].trigger('click')
    expect(wrapper.emitted('back')).toHaveLength(1)
    expect(wrapper.emitted('home')).toHaveLength(1)
    expect(wrapper.emitted('retry')).toBeUndefined()
  })

  it('uses home and retry recovery actions for 500',async()=>{
    const wrapper=withEnglish({status:'500'})
    const buttons=wrapper.findAll('.ui-status-page-actions button')
    expect(buttons.map(button=>button.text())).toEqual(['Back to home','Reload'])
    await buttons[0].trigger('click')
    await buttons[1].trigger('click')
    const statusPage=wrapper.getComponent(UiStatusPage)
    expect(statusPage.emitted('home')).toHaveLength(1)
    expect(statusPage.emitted('retry')).toHaveLength(1)
  })

  it('supports custom copy, icon, illustration, actions and extra content',async()=>{
    const wrapper=mount(UiStatusPage,{props:{status:'403',title:'Private area',description:'Request access',icon:'key',embedded:true},slots:{
      illustration:scope=>h('span',{class:'custom-illustration'},`${scope.status}:${scope.icon}`),
      default:scope=>h('p',{class:'custom-copy'},`${scope.title} / ${scope.description}`),
      actions:scope=>h('button',{class:'custom-action',onClick:scope.home},'Dashboard'),
      extra:()=>h('small','Trace ID: DEMO-500'),
    }})
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['ui-status-page','embedded','status-403']))
    expect(wrapper.get('.custom-illustration').text()).toBe('403:key')
    expect(wrapper.get('.custom-copy').text()).toBe('Private area / Request access')
    expect(wrapper.get('.ui-status-page-extra').text()).toContain('DEMO-500')
    await wrapper.get('.custom-action').trigger('click')
    expect(wrapper.emitted('home')).toHaveLength(1)
  })

  it('maps the three application pages and forwards their supported actions',async()=>{
    const forbidden=mount(ForbiddenPage,{props:{embedded:true}})
    const missing=mount(NotFoundPage,{props:{embedded:true}})
    const server=mount(ServerErrorPage,{props:{embedded:true}})
    expect(forbidden.get('[data-status="403"]').exists()).toBe(true)
    expect(missing.get('[data-status="404"]').exists()).toBe(true)
    expect(server.get('[data-status="500"]').exists()).toBe(true)
    await forbidden.findAll('button')[0].trigger('click')
    await missing.findAll('button')[1].trigger('click')
    await server.findAll('button')[1].trigger('click')
    expect(forbidden.emitted('back')).toHaveLength(1)
    expect(missing.emitted('home')).toHaveLength(1)
    expect(server.emitted('retry')).toHaveLength(1)
  })

  it('keeps the application routes and mobile layout contract in sync',()=>{
    const app=fs.readFileSync('src/App.vue','utf8')
    const styles=fs.readFileSync('styles.css','utf8')
    for(const route of ["'/403'","'/404'","'/500'"]) expect(app).toContain(route)
    expect(app).toContain('@retry="reloadPage"')
    expect(styles).toContain('@media(max-width:520px)')
    expect(styles).toContain('.ui-status-page-actions .btn { width:100%; }')
  })
})
