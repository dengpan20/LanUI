// @vitest-environment happy-dom
import { defineComponent, h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import UiNotification from '../src/components/UiNotification.vue'
import UiToastHost from '../src/components/UiToastHost.vue'
import { createLanUi, createLanUiFeedback, feedback, useNotification, useToast } from '../src/index.js'

afterEach(()=>{document.body.innerHTML='';feedback.toast.clear();feedback.notification.clear();vi.useRealTimers()})

const FeedbackActions=defineComponent({
  setup(){
    const toast=useToast()
    const notification=useNotification()
    return()=>h('div',[
      h('button',{class:'open-toast',onClick:()=>toast.success('Scoped toast',{duration:0})},'Toast'),
      h('button',{class:'open-notification',onClick:()=>notification.error({title:'Scoped notice',message:'Only this application'})},'Notification'),
    ])
  },
})

const FeedbackRoot=defineComponent({
  setup(){return()=>h('main',[h(FeedbackActions),h(UiToastHost),h(UiNotification)])},
})

describe('application feedback isolation',()=>{
  it('keeps two installed applications independent and disposes owned state on unmount',async()=>{
    const first=createLanUi({isolated:true})
    const second=createLanUi({isolated:true})
    const firstWrapper=mount(FeedbackRoot,{attachTo:document.body,global:{plugins:[first]}})
    const secondWrapper=mount(FeedbackRoot,{attachTo:document.body,global:{plugins:[second]}})

    await firstWrapper.get('.open-toast').trigger('click')
    await firstWrapper.get('.open-notification').trigger('click')
    await nextTick()
    expect(first.feedback.toastState.items).toHaveLength(1)
    expect(second.feedback.toastState.items).toHaveLength(0)
    expect(first.feedback.notificationState.current?.title).toBe('Scoped notice')
    expect(second.feedback.notificationState.current).toBeNull()
    expect([...document.body.querySelectorAll('.toast p')].map(node=>node.textContent)).toEqual(['Scoped toast'])

    await secondWrapper.get('.open-toast').trigger('click')
    await nextTick()
    expect(second.feedback.toastState.items).toHaveLength(1)
    expect([...document.body.querySelectorAll('.toast p')].map(node=>node.textContent)).toEqual(['Scoped toast','Scoped toast'])

    firstWrapper.unmount()
    expect(first.feedback.disposed).toBe(true)
    expect(first.feedback.toastState.items).toHaveLength(0)
    expect(first.feedback.notificationState.current).toBeNull()
    expect(()=>first.feedback.toast.info('late write')).toThrow(/disposed/)
    expect(second.feedback.disposed).toBe(false)
    secondWrapper.unmount()
  })

  it('accepts an explicit feedback instance without taking over its lifecycle',()=>{
    const scoped=createLanUiFeedback()
    const plugin=createLanUi({feedback:scoped})
    expect(plugin.feedback).toBe(scoped)
    plugin.dispose()
    expect(scoped.disposed).toBe(false)
    scoped.toast.info('still active',{duration:0})
    expect(scoped.toastState.items).toHaveLength(1)
    scoped.dispose()
  })

  it('cancels pending toast timers when an instance is disposed',()=>{
    vi.useFakeTimers()
    const scoped=createLanUiFeedback()
    const closed=vi.fn()
    const id=scoped.toast.info({message:'Pending',duration:1000,onClose:closed})
    scoped.toast.close(id)
    scoped.dispose()
    vi.runAllTimers()
    expect(scoped.toastState.items).toHaveLength(0)
    expect(closed).not.toHaveBeenCalled()
  })
})
