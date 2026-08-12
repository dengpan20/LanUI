import { getCurrentInstance, inject, reactive } from 'vue'

export const lanUiFeedbackKey=Symbol.for('lan-ui-feedback')
let serviceSeed=0

function normalizeToast(input,type,placement){return typeof input==='string'?{message:input,type,placement}:input}

export function createLanUiFeedback(){
  const toastState=reactive({items:[]})
  const notificationState=reactive({current:null})
  const serviceId=++serviceSeed
  let seed=0
  let disposed=false

  function assertActive(){if(disposed)throw new Error('Lan UI feedback instance has been disposed')}
  function cancel(item){clearTimeout(item.timer);clearTimeout(item.exitTimer);item.timer=null;item.exitTimer=null}
  function remove(id,notify=true){
    const item=toastState.items.find(entry=>entry.id===id)
    if(!item)return
    cancel(item)
    toastState.items=toastState.items.filter(entry=>entry.id!==id)
    if(notify)item.onClose?.()
  }
  function schedule(item){
    clearTimeout(item.timer)
    if(item.duration===0||typeof window==='undefined')return
    item.startedAt=Date.now()
    item.timer=setTimeout(()=>toast.close(item.id),Math.max(200,item.remaining))
  }

  const toast={
    open(input,type='info',placement='top-center'){
      assertActive()
      const options=normalizeToast(input,type,placement)
      const item={id:options.id??`toast-${serviceId}-${++seed}`,message:options.message??'',title:options.title??'',type:options.type??type,placement:options.placement??placement,duration:options.duration??3200,remaining:options.duration??3200,startedAt:Date.now(),out:false,timer:null,exitTimer:null,onClose:options.onClose}
      toastState.items.push(item);schedule(item);return item.id
    },
    success(input,options={}){return toast.open(typeof input==='string'?{...options,message:input,type:'success'}:{...input,type:'success'})},
    info(input,options={}){return toast.open(typeof input==='string'?{...options,message:input,type:'info'}:{...input,type:'info'})},
    warning(input,options={}){return toast.open(typeof input==='string'?{...options,message:input,type:'warning'}:{...input,type:'warning'})},
    error(input,options={}){return toast.open(typeof input==='string'?{...options,message:input,type:'error'}:{...input,type:'error'})},
    pause(id){const item=toastState.items.find(entry=>entry.id===id);if(!item||item.out)return;clearTimeout(item.timer);item.timer=null;item.remaining=Math.max(200,item.remaining-(Date.now()-item.startedAt))},
    resume(id){const item=toastState.items.find(entry=>entry.id===id);if(item&&!item.out)schedule(item)},
    close(id){
      const item=toastState.items.find(entry=>entry.id===id)
      if(!item||item.out)return
      clearTimeout(item.timer);item.timer=null;item.out=true
      if(typeof window==='undefined'){remove(id);return}
      item.exitTimer=setTimeout(()=>remove(id),180)
    },
    clear(){toastState.items.forEach(cancel);toastState.items=[]},
  }

  const notification={
    open(options){assertActive();notificationState.current={id:options.id??`notification-${serviceId}-${++seed}`,type:options.type??'info',title:options.title??'',message:options.message??'',actionText:options.actionText??'',secondaryText:options.secondaryText??'',onAction:options.onAction,onClose:options.onClose};return notificationState.current.id},
    success(options){return notification.open({...options,type:'success'})},
    info(options){return notification.open({...options,type:'info'})},
    warning(options){return notification.open({...options,type:'warning'})},
    error(options){return notification.open({...options,type:'error'})},
    action(){const current=notificationState.current;if(!current)return;current.onAction?.();notificationState.current=null},
    close(){const current=notificationState.current;if(!current)return;notificationState.current=null;current.onClose?.()},
    clear(){notificationState.current=null},
  }

  return {
    toast,
    toastState,
    notification,
    notificationState,
    get disposed(){return disposed},
    dispose(){if(disposed)return;toast.clear();notification.clear();disposed=true},
  }
}

export const feedback=createLanUiFeedback()
export const toast=feedback.toast
export const toastState=feedback.toastState
export const notification=feedback.notification
export const notificationState=feedback.notificationState

export function useFeedback(){return getCurrentInstance()?inject(lanUiFeedbackKey,feedback):feedback}
export function useToast(){return useFeedback().toast}
export function useNotification(){return useFeedback().notification}
