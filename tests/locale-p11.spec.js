// @vitest-environment happy-dom
import { defineComponent, h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import UiAlert from '../src/components/UiAlert.vue'
import UiBadge from '../src/components/UiBadge.vue'
import UiBreadcrumb from '../src/components/UiBreadcrumb.vue'
import UiCascader from '../src/components/UiCascader.vue'
import UiDescriptions from '../src/components/UiDescriptions.vue'
import UiFormItem from '../src/components/UiFormItem.vue'
import UiListToolbar from '../src/components/UiListToolbar.vue'
import UiMenu from '../src/components/UiMenu.vue'
import UiMultiSelect from '../src/components/UiMultiSelect.vue'
import UiNotification from '../src/components/UiNotification.vue'
import UiSteps from '../src/components/UiSteps.vue'
import UiTabs from '../src/components/UiTabs.vue'
import UiToastHost from '../src/components/UiToastHost.vue'
import UiTransfer from '../src/components/UiTransfer.vue'
import UiTreeSelect from '../src/components/UiTreeSelect.vue'
import { createLanUi, enUS, zhCN } from '../src/index.js'

afterEach(()=>{document.body.innerHTML=''})

const LocaleFixture=defineComponent({
  setup(){return()=>h('div',{class:'locale-fixture'},[
    h(UiAlert,{title:'Alert',closable:true}),
    h(UiBadge,{value:3}),
    h(UiBreadcrumb,{items:[{label:'Home'}]}),
    h(UiCascader),
    h(UiDescriptions),
    h(UiListToolbar,{total:4,selectedCount:2,columns:[{key:'name',label:'Name'}],visibleColumns:['name']}),
    h(UiMenu),
    h(UiMultiSelect),
    h(UiSteps),
    h(UiTabs,{modelValue:'summary',items:[{label:'Summary',value:'summary',closable:true}],panels:false}),
    h(UiTransfer,{searchable:true}),
    h(UiTreeSelect),
    h(UiToastHost,{items:[{id:'locale-toast',title:'',message:'Saved',type:'success',placement:'top-center'}]}),
    h(UiNotification,{notification:{title:'Notice',message:'Read this',type:'info'}}),
  ])},
})

describe('complete locale contracts',()=>{
  it('keeps built-in locale keys and placeholders in exact parity',()=>{
    expect(Object.keys(enUS.messages).sort()).toEqual(Object.keys(zhCN.messages).sort())
    const placeholders=value=>[...value.matchAll(/\{(\w+)\}/g)].map(([,name])=>name).sort()
    for(const key of Object.keys(zhCN.messages))expect(placeholders(enUS.messages[key])).toEqual(placeholders(zhCN.messages[key]))
  })

  it('updates visible copy and accessible names when the application locale changes',async()=>{
    const plugin=createLanUi({locale:'zh-CN'})
    const wrapper=mount(LocaleFixture,{attachTo:document.body,global:{plugins:[plugin]}})
    expect(wrapper.get('.ui-alert-close').attributes('aria-label')).toBe('关闭提示')
    expect(wrapper.get('.ui-badge').attributes('aria-label')).toBe('3 条消息')
    expect(wrapper.get('.ui-breadcrumb').attributes('aria-label')).toBe('面包屑导航')
    expect(wrapper.get('.ui-cascader-trigger').text()).toContain('请选择层级')
    expect(wrapper.get('.ui-descriptions').attributes('aria-label')).toBe('详情信息')
    expect(wrapper.get('.ui-list-total').text()).toBe('共 4 条')
    expect(wrapper.get('.ui-menu').attributes('aria-label')).toBe('功能菜单')
    expect(wrapper.get('.ui-multi-select .placeholder').text()).toBe('请选择')
    expect(wrapper.get('.ui-steps').attributes('aria-label')).toBe('步骤进度')
    expect(wrapper.get('.ui-tab-close').attributes('aria-label')).toBe('关闭 Summary')
    expect(wrapper.findAll('.ui-transfer-panel strong').map(node=>node.text())).toEqual(['可选项','已选项'])
    expect(wrapper.get('.ui-tree-trigger').text()).toContain('请选择节点')
    expect(document.body.querySelector('.toast-copy strong')?.textContent).toBe('操作成功')
    expect(document.body.querySelector('.notification-close')?.getAttribute('aria-label')).toBe('关闭通知')

    plugin.setLocale('en-US');await nextTick();await nextTick()
    expect(wrapper.get('.ui-alert-close').attributes('aria-label')).toBe('Close alert')
    expect(wrapper.get('.ui-badge').attributes('aria-label')).toBe('Messages: 3')
    expect(wrapper.get('.ui-breadcrumb').attributes('aria-label')).toBe('Breadcrumb')
    expect(wrapper.get('.ui-cascader-trigger').text()).toContain('Select a hierarchy')
    expect(wrapper.get('.ui-descriptions').attributes('aria-label')).toBe('Details')
    expect(wrapper.get('.ui-list-total').text()).toBe('Total: 4')
    expect(wrapper.get('.ui-menu').attributes('aria-label')).toBe('Navigation menu')
    expect(wrapper.get('.ui-multi-select .placeholder').text()).toBe('Select options')
    expect(wrapper.get('.ui-steps').attributes('aria-label')).toBe('Step progress')
    expect(wrapper.get('.ui-tab-close').attributes('aria-label')).toBe('Close Summary')
    expect(wrapper.findAll('.ui-transfer-panel strong').map(node=>node.text())).toEqual(['Available','Selected'])
    expect(wrapper.get('.ui-tree-trigger').text()).toContain('Select a node')
    expect(document.body.querySelector('.toast-copy strong')?.textContent).toBe('Success')
    expect(document.body.querySelector('.notification-close')?.getAttribute('aria-label')).toBe('Close notification')
    wrapper.unmount()
  })

  it('keeps generated form errors reactive while preserving explicit copy overrides',async()=>{
    const plugin=createLanUi({locale:'en-US'})
    const generated=mount(UiFormItem,{props:{label:'Name',rules:[{required:true}]},global:{plugins:[plugin]}})
    expect(await generated.vm.validate()).toBe(false)
    expect(generated.get('.field-error').text()).toContain('Name is required')
    plugin.setLocale('zh-CN');await nextTick()
    expect(generated.get('.field-error').text()).toContain('Name为必填项')

    const explicit=mount(UiFormItem,{props:{label:'Name',rules:[{required:true,message:'Required by product'}]},global:{plugins:[createLanUi({locale:'zh-CN'})]}})
    expect(await explicit.vm.validate()).toBe(false)
    expect(explicit.get('.field-error').text()).toContain('Required by product')
  })

  it('keeps explicit component labels ahead of locale defaults',async()=>{
    const plugin=createLanUi({locale:'zh-CN'})
    const wrapper=mount(defineComponent({setup:()=>()=>h('div',[
      h(UiCascader,{placeholder:'Custom cascader'}),
      h(UiMultiSelect,{placeholder:'Custom multi'}),
      h(UiSteps,{ariaLabel:'Custom steps'}),
      h(UiTransfer,{titles:['Source','Target']}),
      h(UiTreeSelect,{placeholder:'Custom tree'}),
    ])}),{global:{plugins:[plugin]}})
    plugin.setLocale('en-US');await nextTick()
    expect(wrapper.get('.ui-cascader-trigger').text()).toContain('Custom cascader')
    expect(wrapper.get('.ui-multi-select .placeholder').text()).toBe('Custom multi')
    expect(wrapper.get('.ui-steps').attributes('aria-label')).toBe('Custom steps')
    expect(wrapper.findAll('.ui-transfer-panel strong').map(node=>node.text())).toEqual(['Source','Target'])
    expect(wrapper.get('.ui-tree-trigger').text()).toContain('Custom tree')
  })
})
