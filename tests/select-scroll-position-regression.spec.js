// @vitest-environment happy-dom
import fs from 'node:fs'
import path from 'node:path'
import { nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import UiSelect from '../src/components/UiSelect.vue'
import { scrollElementWithin } from '../src/components/scrollUtils.js'

afterEach(()=>{document.body.innerHTML=''})

describe('select viewport scroll and floating placement regression',()=>{
  it('scrolls only the option viewport when the active option is below or above it',()=>{
    const container=document.createElement('div')
    const option=document.createElement('div')
    container.append(option)
    container.scrollTop=40
    container.getBoundingClientRect=()=>({top:100,bottom:310})
    option.getBoundingClientRect=()=>({top:360,bottom:396})

    expect(scrollElementWithin(option,container)).toBe(true)
    expect(container.scrollTop).toBe(126)

    option.getBoundingClientRect=()=>({top:70,bottom:106})
    expect(scrollElementWithin(option,container)).toBe(true)
    expect(container.scrollTop).toBe(96)
  })

  it('keeps document scrolling unchanged and restores trigger focus without scrolling',async()=>{
    const options=Array.from({length:40},(_,index)=>({label:`Option ${index+1}`,value:index+1}))
    const wrapper=mount(UiSelect,{attachTo:document.body,props:{modelValue:36,options,appendToBody:false}})
    const trigger=wrapper.get('[role="combobox"]')
    const focusSpy=vi.spyOn(trigger.element,'focus')
    await trigger.trigger('click')
    await nextTick()

    const viewport=wrapper.get('.ui-select-options').element
    const active=wrapper.get('.ui-select-option.active')
    const nativeScrollSpy=vi.fn()
    active.element.scrollIntoView=nativeScrollSpy
    viewport.scrollTop=0
    viewport.getBoundingClientRect=()=>({top:100,bottom:310})
    active.element.getBoundingClientRect=()=>({top:360,bottom:396})
    const pageScrollBefore=window.scrollY

    expect(wrapper.vm.scrollToActive()).toBe(true)
    expect(viewport.scrollTop).toBe(86)
    expect(nativeScrollSpy).not.toHaveBeenCalled()
    expect(window.scrollY).toBe(pageScrollBefore)

    await active.trigger('click')
    await nextTick()
    expect(focusSpy).toHaveBeenCalledWith({preventScroll:true})
    expect(window.scrollY).toBe(pageScrollBefore)
  })

  it('uses a fade-only portal transition so fixed panels keep viewport coordinates',()=>{
    const styles=fs.readFileSync(path.join(process.cwd(),'styles.css'),'utf8')
    expect(styles).toContain('.select-portal-enter-active, .select-portal-leave-active { transition: opacity')
    for(const file of ['UiSelect.vue','UiMultiSelect.vue','UiTreeSelect.vue','UiCascader.vue']){
      const source=fs.readFileSync(path.join(process.cwd(),'src/components',file),'utf8')
      expect(source).toContain('<Transition name="select-portal">')
    }
  })
})
