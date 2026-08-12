<script setup>
import { nextTick, ref, watch } from 'vue'
import AppIcon from './AppIcon.vue'
import { useDirection, useLocale } from '../config.js'
const props=defineProps({items:{type:Array,default:()=>[]},modelValue:{type:[String,Number],default:''},collapsed:Boolean,accordion:{type:Boolean,default:true},defaultOpenKeys:{type:Array,default:()=>[]}})
const emit=defineEmits(['update:modelValue','select','open-change'])
const root=ref(null)
const openKeys=ref([...props.defaultOpenKeys])
const direction=useDirection()
const {t}=useLocale()
function isOpen(key){return openKeys.value.includes(key)}
function toggle(item){
  if(item.disabled)return
  if(!item.children?.length){emit('update:modelValue',item.key);emit('select',item);return}
  const opening=!isOpen(item.key)
  openKeys.value=opening?(props.accordion?[item.key]:[...openKeys.value,item.key]):openKeys.value.filter(key=>key!==item.key)
  emit('open-change',[...openKeys.value])
}
function buttons(){return [...(root.value?.querySelectorAll('[role="menuitem"]')||[])].filter(item=>!item.disabled)}
function focusAt(index){const list=buttons();if(!list.length)return;list[(index+list.length)%list.length]?.focus()}
function onKeydown(event){
  const list=buttons();const index=list.indexOf(document.activeElement)
  const expandKey=direction.value==='rtl'?'ArrowLeft':'ArrowRight'
  const collapseKey=direction.value==='rtl'?'ArrowRight':'ArrowLeft'
  if(event.key==='ArrowDown'){event.preventDefault();focusAt(index+1)}
  else if(event.key==='ArrowUp'){event.preventDefault();focusAt(index-1)}
  else if(event.key==='Home'){event.preventDefault();focusAt(0)}
  else if(event.key==='End'){event.preventDefault();focusAt(list.length-1)}
  else if(event.key===expandKey){const key=document.activeElement?.dataset?.key;const item=props.items.find(entry=>String(entry.key)===key);if(item?.children?.length&&!isOpen(item.key)){event.preventDefault();toggle(item);nextTick(()=>focusAt(index+1))}}
  else if(event.key===collapseKey||event.key==='Escape'){const parent=document.activeElement?.dataset?.parent;if(parent){event.preventDefault();const item=props.items.find(entry=>String(entry.key)===parent);if(item&&isOpen(item.key))toggle(item);nextTick(()=>root.value?.querySelector(`[data-key="${CSS.escape(parent)}"]`)?.focus())}}
}
watch(()=>props.collapsed,value=>{if(value)openKeys.value=[]})
</script>
<template>
  <nav ref="root" class="ui-menu" :class="{collapsed}" role="menu" :aria-label="$attrs['aria-label']||t('menu.label')" @keydown="onKeydown">
    <div v-for="item in items" :key="item.key" class="ui-menu-group">
      <button type="button" role="menuitem" :data-key="item.key" :disabled="item.disabled" :aria-current="modelValue===item.key?'page':undefined" :aria-expanded="item.children?.length?isOpen(item.key):undefined" :title="collapsed?item.label:undefined" :class="{active:modelValue===item.key,open:isOpen(item.key)}" @click="toggle(item)">
        <slot name="icon" :item="item"><AppIcon v-if="item.icon" :name="item.icon" :size="17"/></slot><span class="ui-menu-label">{{ item.label }}</span><AppIcon v-if="item.children?.length&&!collapsed" class="ui-menu-arrow" name="chevronDown" :size="14"/>
      </button>
      <Transition name="collapse"><div v-if="item.children?.length&&isOpen(item.key)&&!collapsed" class="ui-submenu" role="menu">
        <button v-for="child in item.children" :key="child.key" type="button" role="menuitem" :data-key="child.key" :data-parent="item.key" :disabled="child.disabled" :aria-current="modelValue===child.key?'page':undefined" :class="{active:modelValue===child.key}" @click="toggle(child)">
          <span class="ui-menu-dot"/><span class="ui-menu-label">{{ child.label }}</span><span v-if="child.badge" class="ui-menu-badge">{{ child.badge }}</span>
        </button>
      </div></Transition>
    </div>
  </nav>
</template>
