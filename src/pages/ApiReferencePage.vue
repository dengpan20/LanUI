<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import apiDocs from '../generated/component-api.json'
import AppIcon from '../components/AppIcon.vue'
import UiButton from '../components/UiButton.vue'
import UiEmpty from '../components/UiEmpty.vue'
import UiInput from '../components/UiInput.vue'
import UiTag from '../components/UiTag.vue'

const emit=defineEmits(['notify'])
const query=ref('')
const category=ref('all')
const selectedName=ref('UiButton')

const filteredComponents=computed(()=>{
  const keyword=query.value.trim().toLowerCase()
  return apiDocs.components.filter(component=>(category.value==='all'||component.category===category.value)&&(!keyword||[
    component.name,component.categoryLabel,...component.props.map(prop=>prop.name),...component.emits.map(event=>event.name),...component.slots.map(slot=>slot.name),
  ].some(value=>String(value).toLowerCase().includes(keyword))))
})
const selected=computed(()=>apiDocs.components.find(component=>component.name===selectedName.value)||apiDocs.components[0])
const contractCount=computed(()=>selected.value.props.length+selected.value.emits.length+selected.value.slots.length)

function componentFromHash(){
  if(typeof location==='undefined')return ''
  const [,search='']=location.hash.split('?')
  return new URLSearchParams(search).get('component')||''
}
function syncFromHash(){
  const requested=componentFromHash()
  if(apiDocs.components.some(component=>component.name===requested))selectedName.value=requested
}
function writeDeepLink(name){
  if(typeof history==='undefined'||typeof location==='undefined')return
  history.replaceState(history.state,'',`${location.pathname}${location.search}#/api?component=${encodeURIComponent(name)}`)
}
function selectComponent(name){selectedName.value=name;writeDeepLink(name)}
function selectCategory(id){
  category.value=id
  const first=filteredComponents.value[0]
  if(first&&!filteredComponents.value.some(component=>component.name===selectedName.value))selectComponent(first.name)
}
async function copyText(text,message){
  try{
    if(navigator.clipboard?.writeText)await navigator.clipboard.writeText(text)
    else{
      const textarea=document.createElement('textarea')
      textarea.value=text;textarea.setAttribute('readonly','');textarea.style.position='fixed';textarea.style.opacity='0'
      document.body.append(textarea);textarea.select();document.execCommand('copy');textarea.remove()
    }
    emit('notify',message)
  }catch{emit('notify','复制失败，请手动选择代码')}
}
function copyDeepLink(){
  const href=`${location.origin}${location.pathname}${location.search}#/api?component=${encodeURIComponent(selected.value.name)}`
  copyText(href,'组件深链接已复制')
}

onMounted(()=>{syncFromHash();window.addEventListener('hashchange',syncFromHash)})
onBeforeUnmount(()=>window.removeEventListener('hashchange',syncFromHash))
</script>

<template>
  <div class="page-container api-reference-page">
    <header class="api-reference-hero">
      <div>
        <span class="api-reference-eyebrow">DESIGN SYSTEM · API REFERENCE P37</span>
        <h1>组件 API 参考</h1>
        <p>从公开 TypeScript 声明与运行时契约自动生成，可检索 Props、Events、Slots、默认值和导入方式。</p>
      </div>
      <div class="api-reference-stats" aria-label="API 文档统计">
        <span><strong>{{ apiDocs.components.length }}</strong>组件</span>
        <span><strong>{{ apiDocs.categories.length }}</strong>分类</span>
        <span><strong>v{{ apiDocs.version }}</strong>版本</span>
      </div>
    </header>

    <section class="api-reference-toolbar" aria-label="API 检索与筛选">
      <UiInput v-model="query" icon="search" clearable placeholder="搜索组件、属性、事件或插槽" aria-label="搜索组件 API" />
      <div class="api-reference-filters" role="group" aria-label="组件分类">
        <button type="button" :class="{active:category==='all'}" :aria-pressed="category==='all'" @click="selectCategory('all')">全部 <span>{{ apiDocs.components.length }}</span></button>
        <button v-for="item in apiDocs.categories" :key="item.id" type="button" :class="{active:category===item.id}" :aria-pressed="category===item.id" @click="selectCategory(item.id)">{{ item.label }} <span>{{ item.count }}</span></button>
      </div>
      <p class="api-reference-result" aria-live="polite">当前显示 {{ filteredComponents.length }} 个组件</p>
    </section>

    <div class="api-reference-layout">
      <aside class="api-reference-index" aria-label="组件 API 索引">
        <div class="api-reference-index-head"><strong>组件索引</strong><span>{{ filteredComponents.length }}/{{ apiDocs.components.length }}</span></div>
        <nav v-if="filteredComponents.length" aria-label="可用组件">
          <button v-for="component in filteredComponents" :key="component.name" type="button" :class="{active:selected.name===component.name}" :aria-current="selected.name===component.name?'true':undefined" @click="selectComponent(component.name)">
            <span><strong>{{ component.name }}</strong><small>{{ component.categoryLabel }}</small></span><AppIcon name="chevronRight" :size="14" />
          </button>
        </nav>
        <UiEmpty v-else compact title="没有匹配的组件" description="请调整关键词或组件分类" />
      </aside>

      <article :key="selected.name" class="api-reference-detail" :aria-labelledby="`api-title-${selected.name}`">
        <header class="api-reference-detail-head">
          <div><UiTag color="blue">{{ selected.categoryLabel }}</UiTag><h2 :id="`api-title-${selected.name}`">{{ selected.name }}</h2><p>{{ contractCount }} 项公开契约 · {{ selected.props.length }} Props · {{ selected.emits.length }} Events · {{ selected.slots.length }} Slots</p></div>
          <UiButton variant="secondary" size="sm" icon="link" @click="copyDeepLink">复制深链接</UiButton>
        </header>

        <section class="api-reference-imports" aria-labelledby="api-import-title">
          <div class="api-reference-section-title"><div><h3 id="api-import-title">导入方式</h3><p>根入口适合常规项目，子路径入口适合显式依赖边界。</p></div></div>
          <div v-for="(statement,kind) in selected.imports" :key="kind" class="api-reference-code-row">
            <span>{{ kind==='root'?'根入口':'组件子路径' }}</span><code>{{ statement }}</code><button type="button" :aria-label="`复制${kind==='root'?'根入口':'组件子路径'}导入代码`" @click="copyText(statement,'导入代码已复制')"><AppIcon name="copy" :size="15" /></button>
          </div>
        </section>

        <section class="api-reference-section" aria-labelledby="api-props-title">
          <div class="api-reference-section-title"><div><h3 id="api-props-title">Props</h3><p><code>{{ selected.propsType }}</code> · 类型、必填状态与运行时默认值</p></div><UiTag color="gray">{{ selected.props.length }}</UiTag></div>
          <div v-if="selected.props.length" class="api-reference-table-wrap" tabindex="0" aria-labelledby="api-props-title">
            <table><caption class="sr-only">{{ selected.name }} 属性 API</caption><thead><tr><th scope="col">属性</th><th scope="col">类型</th><th scope="col">默认值</th><th scope="col">运行时</th></tr></thead><tbody><tr v-for="prop in selected.props" :key="prop.name"><th scope="row"><code>{{ prop.name }}</code><span v-if="prop.required" class="api-required">必填</span></th><td><code>{{ prop.type }}</code></td><td><code>{{ prop.default?.value || '—' }}</code></td><td>{{ prop.runtimeTypes.join(' / ') || '—' }}</td></tr></tbody></table>
          </div>
          <UiEmpty v-else compact title="无公开 Props" description="此组件通过插槽或上下文工作" />
        </section>

        <div class="api-reference-contract-grid">
          <section class="api-reference-section" aria-labelledby="api-events-title">
            <div class="api-reference-section-title"><div><h3 id="api-events-title">Events</h3><p><code>{{ selected.emitsType }}</code></p></div><UiTag color="gray">{{ selected.emits.length }}</UiTag></div>
            <ul v-if="selected.emits.length" class="api-reference-contract-list" tabindex="0" aria-labelledby="api-events-title"><li v-for="event in selected.emits" :key="event.name"><code>{{ event.name }}</code><span>{{ event.type }}</span></li></ul>
            <UiEmpty v-else compact title="无公开 Events" description="该组件不主动发送事件" />
          </section>
          <section class="api-reference-section" aria-labelledby="api-slots-title">
            <div class="api-reference-section-title"><div><h3 id="api-slots-title">Slots</h3><p><code>{{ selected.slotsType }}</code></p></div><UiTag color="gray">{{ selected.slots.length }}</UiTag></div>
            <ul v-if="selected.slots.length" class="api-reference-contract-list" tabindex="0" aria-labelledby="api-slots-title"><li v-for="slot in selected.slots" :key="slot.name"><code>#{{ slot.name }}</code><span>{{ slot.type }}</span></li></ul>
            <UiEmpty v-else compact title="无公开 Slots" description="该组件不提供插槽" />
          </section>
        </div>
      </article>
    </div>
  </div>
</template>
