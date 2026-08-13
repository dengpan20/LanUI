<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { isClient } from '../env.js'

const props=defineProps({
  position:{type:String,default:'top',validator:value=>['top','bottom'].includes(value)},
  offset:{type:Number,default:0},
  target:{type:[String,Object,Function],default:undefined},
  boundary:{type:[String,Object,Function],default:undefined},
  zIndex:{type:Number,default:100},
  disabled:{type:Boolean,default:false},
  observe:{type:Boolean,default:true},
})
const emit=defineEmits(['change','scroll','error'])
const rootRef=ref(null),contentRef=ref(null),affixed=ref(false)
const placeholderStyle=ref({}),contentStyle=ref({})
const meta=ref({affixed:false,position:props.position,scrollTop:0,top:null,left:null,width:null})
let scrollRoot,boundaryRoot,observer,frame=0,previous

function resolve(value,kind,allowWindow=false){
  if(!isClient||value==null||value==='')return null
  let result=value
  try{
    if(typeof result==='function')result=result()
    if(typeof result==='string')result=document.querySelector(result)
  }catch(error){emit('error',{kind,target:String(value),error});return null}
  if((allowWindow&&result===window)||result instanceof Element)return result
  emit('error',{kind,target:String(value)})
  return null
}
function resolveRoots(){
  scrollRoot=props.target==null||props.target===''?window:resolve(props.target,'target',true)||window
  boundaryRoot=props.boundary==null||props.boundary===''?(scrollRoot===window?null:scrollRoot):resolve(props.boundary,'boundary')
}
function update(source='manual'){
  if(!isClient||!rootRef.value||!contentRef.value||!scrollRoot){
    affixed.value=false;placeholderStyle.value={};contentStyle.value={}
    return meta.value
  }
  const root=rootRef.value.getBoundingClientRect(),content=contentRef.value.getBoundingClientRect()
  const viewport=scrollRoot===window?{top:0,bottom:window.innerHeight}:scrollRoot.getBoundingClientRect()
  const boundary=boundaryRoot?.getBoundingClientRect(),offset=props.offset,width=root.width,height=content.height
  let active=false,top
  if(!props.disabled&&width>0&&height>0&&viewport.bottom>viewport.top){
    if(props.position==='bottom'){
      const edge=viewport.bottom-offset
      active=root.bottom>=edge&&(!boundary||boundary.top<viewport.bottom)
      if(active)top=Math.max(edge-height,boundary?.top??-Infinity)
    }else{
      const edge=viewport.top+offset
      active=root.top<=edge&&(!boundary||boundary.bottom>viewport.top)
      if(active)top=Math.min(edge,boundary?boundary.bottom-height:Infinity)
    }
  }
  affixed.value=active
  placeholderStyle.value=active?{height:`${height}px`}:{}
  contentStyle.value=active?{position:'fixed',top:`${top}px`,left:`${root.left}px`,width:`${width}px`,zIndex:String(props.zIndex)}:{}
  meta.value={affixed:active,position:props.position,scrollTop:scrollRoot===window?(window.scrollY||document.documentElement.scrollTop||0):scrollRoot.scrollTop,top:active?top:null,left:active?root.left:null,width:active?width:null}
  if(active!==previous){previous=active;emit('change',active,{...meta.value,source})}
  if(source==='scroll')emit('scroll',{...meta.value,source})
  return meta.value
}
function schedule(source='manual'){
  if(!isClient||frame)return
  frame=requestAnimationFrame(()=>{frame=0;update(source)})
}
function stop(){
  if(!isClient)return
  window.removeEventListener('scroll',onScroll,true)
  window.removeEventListener('resize',onResize)
  observer?.disconnect();observer=null
}
function onScroll(){schedule('scroll')}
function onResize(){schedule('resize')}
function observe(){
  observer?.disconnect();observer=null
  if(!props.observe||!isClient||typeof ResizeObserver!=='function')return
  observer=new ResizeObserver(()=>schedule('resize'))
  for(const node of [rootRef.value,contentRef.value,scrollRoot===window?null:scrollRoot,boundaryRoot])if(node instanceof Element)observer.observe(node)
}
function updateRoot(){
  if(!isClient)return meta.value
  stop();resolveRoots()
  window.addEventListener('scroll',onScroll,true)
  window.addEventListener('resize',onResize)
  observe()
  return update('root')
}

watch(()=>[props.position,props.offset,props.zIndex,props.disabled,props.target,props.boundary,props.observe],()=>nextTick(updateRoot))
onMounted(()=>nextTick(updateRoot))
onBeforeUnmount(()=>{stop();if(frame)cancelAnimationFrame(frame)})
defineExpose({update,updateRoot,affixed,meta})
</script>

<template>
  <div ref="rootRef" class="ui-affix" :data-ui-affix="position" :data-affixed="affixed?'true':'false'" :style="placeholderStyle">
    <div ref="contentRef" class="ui-affix-content" :style="contentStyle"><slot/></div>
  </div>
</template>
