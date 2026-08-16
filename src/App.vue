<script setup>
import { computed, defineAsyncComponent, onBeforeUnmount, onMounted, provide, ref } from 'vue'
import AppIcon from './components/AppIcon.vue'
import UiButton from './components/UiButton.vue'
import UiInput from './components/UiInput.vue'
import UiSelect from './components/UiSelect.vue'
import UiTag from './components/UiTag.vue'
import UiTextarea from './components/UiTextarea.vue'
import UiDatePicker from './components/UiDatePicker.vue'
import UiUpload from './components/UiUpload.vue'
import UiFloatButton from './components/UiFloatButton.vue'
import UiModal from './components/UiModal.vue'
import UiDrawer from './components/UiDrawer.vue'
import UiToastHost from './components/UiToastHost.vue'
import UiNotification from './components/UiNotification.vue'
import UiFormItem from './components/UiFormItem.vue'
import UiAvatar from './components/UiAvatar.vue'
import UiBadge from './components/UiBadge.vue'
import UiEmpty from './components/UiEmpty.vue'
import { notification, toast } from './feedback.js'
import { createThemeController } from './theme.js'
import { createMotionController, lanUiMotionKey } from './motion.js'
const LoginPage=defineAsyncComponent(()=>import('./pages/LoginPage.vue'))
const LogoutPage=defineAsyncComponent(()=>import('./pages/LogoutPage.vue'))
const NotFoundPage=defineAsyncComponent(()=>import('./pages/NotFoundPage.vue'))
const ForbiddenPage=defineAsyncComponent(()=>import('./pages/ForbiddenPage.vue'))
const ServerErrorPage=defineAsyncComponent(()=>import('./pages/ServerErrorPage.vue'))
const DashboardPage=defineAsyncComponent(()=>import('./pages/DashboardPage.vue'))
const WorkbenchPage=defineAsyncComponent(()=>import('./pages/WorkbenchPage.vue'))
const DataPage=defineAsyncComponent(()=>import('./pages/DataPage.vue'))
const AiPage=defineAsyncComponent(()=>import('./pages/AiPage.vue'))
const GanttPage=defineAsyncComponent(()=>import('./pages/GanttPage.vue'))
const ComponentsPage=defineAsyncComponent(()=>import('./pages/ComponentsPage.vue'))
const ApiReferencePage=defineAsyncComponent(()=>import('./pages/ApiReferencePage.vue'))

const routeMeta = {
  '/home': { title:'综合看板', icon:'chart', component:DashboardPage },
  '/workbench': { title:'我的工作台', icon:'home', component:WorkbenchPage },
  '/data': { title:'客户数据', icon:'table', component:DataPage },
  '/ai': { title:'智能问答', icon:'bot', component:AiPage },
  '/gantt': { title:'甘特计划', icon:'calendar', component:GanttPage },
  '/components': { title:'组件用例', icon:'palette', component:ComponentsPage },
  '/api': { title:'API 参考', icon:'file', component:ApiReferencePage },
  '/403': { title:'403 无权限', icon:'lock', component:ForbiddenPage, statusPage:true },
  '/404': { title:'404 页面不存在', icon:'file', component:NotFoundPage, statusPage:true },
  '/500': { title:'500 服务器错误', icon:'alert', component:ServerErrorPage, statusPage:true },
}
const navGroups = [
  { label:'工作空间', items:[{path:'/workbench',title:'我的工作台',icon:'home'},{path:'/home',title:'综合看板',icon:'chart'}] },
  { label:'业务示例', items:[{path:'/data',title:'客户数据',icon:'table'},{path:'/ai',title:'智能问答',icon:'bot'},{path:'/gantt',title:'甘特计划',icon:'calendar'}] },
  { label:'设计系统', items:[{path:'/components',title:'组件用例中心',icon:'palette'},{path:'/api',title:'组件 API 参考',icon:'file'}] },
  { label:'通用页面', items:[{path:'/403',title:'403 无权限',icon:'lock'},{path:'/404',title:'404 页面不存在',icon:'file'},{path:'/500',title:'500 服务器错误',icon:'alert'}] },
]

function routePath(value){return (value||'/login').split('?')[0]||'/login'}
const initialHash = routePath(location.hash.replace(/^#/, '') || '/login')
const path = ref(initialHash)
const authenticated = ref(localStorage.getItem('lan-auth') === '1')
const collapsed = ref(localStorage.getItem('lan-sidebar') === '1')
const mobileExpanded = ref(false)
const themeController=createThemeController({appearance:'system',storageKey:'lan-theme'})
const theme = ref('light')
let stopThemeSubscription=null
const motionController=createMotionController({preference:'system',storageKey:'lan-motion'})
const motion=ref('full')
const motionPreference=ref('system')
let stopMotionSubscription=null
provide(lanUiMotionKey,computed(()=>({preference:motionPreference.value,resolvedPreference:motion.value})))
const tabs = ref([{path:'/home',title:'综合看板',icon:'chart'}])
const notificationsOpen = ref(false)
const userMenuOpen = ref(false)
const searchOpen = ref(false)
const search = ref('')
const modal = ref(null)
const drawer = ref(null)
const floatActionsOpen = ref(false)

const isLogin = computed(()=>path.value==='/login')
const isLogout = computed(()=>path.value==='/logout')
const route = computed(()=>routeMeta[path.value])
const pageComponent = computed(()=>route.value?.component || NotFoundPage)
const searchResults = computed(()=>Object.entries(routeMeta).filter(([,m])=>!search.value||m.title.includes(search.value)).slice(0,5))
const shellClass = computed(()=>({collapsed:collapsed.value,expanded:mobileExpanded.value}))

function setHash(next){ if(location.hash!==`#${next}`) location.hash=next; else applyRoute() }
function applyRoute(){
  let next=routePath(location.hash.replace(/^#/,'')||'/login')
  if(!next.startsWith('/')) next=`/${next}`
  if(!authenticated.value && next!=='/login'){ location.hash='/login'; return }
  if(authenticated.value && next==='/login'){ location.hash='/home'; return }
  path.value=next
  if(routeMeta[next] && next!=='/login'){
    const meta=routeMeta[next]
    if(!tabs.value.some(t=>t.path===next)) tabs.value.push({path:next,title:meta.title,icon:meta.icon})
    document.title=`${meta.title} · Lan UI`
  } else document.title=`${next==='/login'?'登录':next==='/logout'?'退出登录':'404'} · Lan UI`
  mobileExpanded.value=false;notificationsOpen.value=false;userMenuOpen.value=false;searchOpen.value=false
  window.scrollTo({top:0})
}
function go(next){setHash(next)}
function reloadPage(){location.reload()}
function login(){authenticated.value=true;localStorage.setItem('lan-auth','1');notify('登录成功，欢迎回来');go('/home')}
function logout(){authenticated.value=false;localStorage.removeItem('lan-auth');tabs.value=[{path:'/home',title:'综合看板',icon:'chart'}];go('/login')}
function toggleSidebar(){ if(innerWidth<=1024) mobileExpanded.value=!mobileExpanded.value; else {collapsed.value=!collapsed.value;localStorage.setItem('lan-sidebar',collapsed.value?'1':'0')} }
function toggleTheme(){const state=themeController.toggle();theme.value=state.resolvedAppearance;notify(theme.value==='dark'?'已切换至深色模式':'已切换至浅色模式')}
function toggleMotion(){const state=motionController.toggle();motion.value=state.resolvedPreference;notify(motion.value==='reduced'?'已减少界面动效':'已恢复完整界面动效')}
function closeTab(tab,index){
  if(tabs.value.length===1)return
  tabs.value.splice(index,1)
  if(path.value===tab.path){const next=tabs.value[Math.max(0,index-1)];go(next.path)}
}
function notify(message,type='success',placement='top-center'){
  toast.open({message,type,placement})
}
function openModal(title){modal.value={title,kind:/删除/.test(title)?'danger':'form',name:'',type:'',date:'',note:'',files:[]}}
function saveModal(){notify(modal.value?.kind==='danger'?'删除操作已确认':'信息已保存');modal.value=null}
function openDrawer(data){drawer.value=data}
function openNotification(type='error'){
  notification.open(type==='error'
    ? {type:'error',title:'数据同步失败',message:'客户数据同步中断，已完成 128 条，剩余 24 条待重试。错误代码：SYNC-503。',actionText:'立即重试',onAction:retryNotification}
    : {type:'info',title:'系统维护提醒',message:'系统将在今晚 23:30 进行例行维护，预计持续 20 分钟，请提前保存正在编辑的内容。'})
}
function retryNotification(){notify('重试任务已加入队列','success','top-center')}
function scrollToTop(){window.scrollTo({top:0,behavior:motion.value==='reduced'?'auto':'smooth'});floatActionsOpen.value=false}
function handleKey(e){if(e.key==='Escape'){modal.value=null;drawer.value=null;notification.close();notificationsOpen.value=false;userMenuOpen.value=false;searchOpen.value=false;floatActionsOpen.value=false}if((e.ctrlKey||e.metaKey)&&e.key==='k'){e.preventDefault();searchOpen.value=true;setTimeout(()=>document.querySelector('.header-search input')?.focus())}}
function globalClick(e){if(!e.target.closest?.('.header-actions')&&!e.target.closest?.('.dropdown')){notificationsOpen.value=false;userMenuOpen.value=false}if(!e.target.closest?.('.header-search')&&!e.target.closest?.('.search-dropdown')) searchOpen.value=false}
function selectSearch(result){search.value='';go(result)}

onMounted(()=>{stopThemeSubscription=themeController.subscribe(state=>{theme.value=state.resolvedAppearance},{immediate:true});themeController.mount(document.documentElement);stopMotionSubscription=motionController.subscribe(state=>{motion.value=state.resolvedPreference;motionPreference.value=state.preference},{immediate:true});motionController.mount(document.documentElement);document.documentElement.dataset.font=localStorage.getItem('lan-font')||'inter-noto';window.addEventListener('hashchange',applyRoute);window.addEventListener('keydown',handleKey);document.addEventListener('click',globalClick);if(!location.hash) location.hash=authenticated.value?'/home':'/login';else applyRoute()})
onBeforeUnmount(()=>{stopThemeSubscription?.();themeController.dispose({restore:false});stopMotionSubscription?.();motionController.dispose({restore:false});window.removeEventListener('hashchange',applyRoute);window.removeEventListener('keydown',handleKey);document.removeEventListener('click',globalClick)})
</script>

<template>
  <LoginPage v-if="isLogin" @login="login" />
  <LogoutPage v-else-if="isLogout" @confirm="logout" @cancel="go('/home')" />
  <div v-else class="app-shell" :class="shellClass">
    <div class="mobile-mask" @click="mobileExpanded=false" />
    <aside class="sidebar">
      <div class="sidebar-logo"><span class="brand-mark"><AppIcon name="layers"/></span><span class="brand-name">Lan UI <small class="brand-version">V1.50.0</small></span></div>
      <div class="sidebar-scroll"><div v-for="group in navGroups" :key="group.label" class="nav-group"><div class="nav-label">{{ group.label }}</div><button v-for="item in group.items" :key="item.path" class="nav-item" :class="{active:path===item.path}" :title="item.title" @click="go(item.path)"><AppIcon :name="item.icon"/><span class="nav-text">{{ item.title }}</span></button></div></div>
      <div class="sidebar-footer"><UiAvatar name="Deng Pan" size="sm"/><div class="sidebar-user"><strong>Deng Pan</strong><span>Design System Owner</span></div></div>
    </aside>
    <main class="app-main">
      <header class="app-header"><button class="icon-btn" title="展开/收起导航" aria-label="展开或收起导航" @click="toggleSidebar"><AppIcon name="menu"/></button><div class="header-search"><AppIcon name="search"/><input v-model="search" class="control" placeholder="搜索页面或功能" aria-label="搜索页面或功能" @focus="searchOpen=true"/><kbd>⌘ K</kbd><div v-if="searchOpen" class="dropdown search-dropdown" style="position:absolute;top:40px;left:0;width:100%;min-width:280px"><button v-for="r in searchResults" :key="r[0]" class="dropdown-item" @click="selectSearch(r[0])"><AppIcon :name="r[1].icon" :size="15"/>{{ r[1].title }}<span style="margin-left:auto" class="subtle">跳转</span></button><UiEmpty v-if="!searchResults.length" compact title="没有匹配页面" description="请尝试其他关键词"/></div></div><div class="header-spacer"/><div class="header-actions"><button class="icon-btn" :title="motion==='reduced'?'恢复完整动效':'减少界面动效'" :aria-label="motion==='reduced'?'恢复完整动效':'减少界面动效'" :aria-pressed="motion==='reduced'" @click.stop="toggleMotion"><AppIcon name="clock"/></button><button class="icon-btn" :title="theme==='light'?'切换深色模式':'切换浅色模式'" :aria-label="theme==='light'?'切换深色模式':'切换浅色模式'" @click.stop="toggleTheme"><AppIcon :name="theme==='light'?'moon':'sun'"/></button><UiBadge :value="3"><button class="icon-btn" title="通知" aria-label="通知" @click.stop="notificationsOpen=!notificationsOpen;userMenuOpen=false"><AppIcon name="bell"/></button></UiBadge><button class="header-user" @click.stop="userMenuOpen=!userMenuOpen;notificationsOpen=false"><UiAvatar name="Deng Pan" size="sm"/><span class="header-user-text"><strong>Deng Pan</strong><span>管理员</span></span><AppIcon name="chevronDown" :size="13"/></button></div>
        <div v-if="notificationsOpen" class="dropdown" style="top:50px;right:80px;width:300px"><div class="dropdown-header"><strong>通知中心</strong><span>你有 3 条未读消息</span></div><button class="dropdown-item"><span class="notice-dot"/>采购审批即将在 14:00 截止</button><button class="dropdown-item"><span class="notice-dot" style="background:#10b981"/>昨日销售日报已生成</button><button class="dropdown-item"><span class="notice-dot" style="background:#f59e0b"/>系统将在今晚进行维护</button><div class="dropdown-divider"/><button class="dropdown-item" style="justify-content:center;color:var(--brand-600)" @click="notify('已标记全部为已读');notificationsOpen=false">查看全部通知</button></div>
        <div v-if="userMenuOpen" class="dropdown" style="top:50px;right:16px"><div class="dropdown-header"><strong>Deng Pan</strong><span>demo@lanui.cn</span></div><button class="dropdown-item" @click="notify('个人中心已打开')"><AppIcon name="user" :size="15"/>个人中心</button><button class="dropdown-item" @click="go('/components')"><AppIcon name="settings" :size="15"/>系统设置</button><button class="dropdown-item" @click="go('/missing-demo')"><AppIcon name="file" :size="15"/>查看 404 示例</button><div class="dropdown-divider"/><button class="dropdown-item danger" @click="go('/logout')"><AppIcon name="logout" :size="15"/>退出登录</button></div>
      </header>
      <nav class="tabbar" aria-label="已打开页面"><span v-for="(tab,i) in tabs" :key="tab.path" class="tab-item" :class="{active:path===tab.path}"><button type="button" class="tab-trigger" :aria-current="path===tab.path?'page':undefined" @click="go(tab.path)"><AppIcon :name="tab.icon" :size="13"/><span class="tab-text">{{ tab.title }}</span></button><button v-if="tabs.length>1" type="button" class="tab-close" :aria-label="`关闭${tab.title}页签`" @click="closeTab(tab,i)"><AppIcon name="close" :size="12"/></button></span></nav>
      <component :is="pageComponent" :embedded="Boolean(route?.statusPage) || !route" @notify="notify" @navigate="go" @open-modal="openModal" @open-drawer="openDrawer" @open-notification="openNotification" @home="go('/home')" @back="history.back()" @retry="reloadPage" />
    </main>
  </div>

  <div v-if="authenticated && !isLogin && !isLogout" class="float-action-stack" :class="{open:floatActionsOpen}" aria-label="全局快捷操作">
    <UiFloatButton v-if="floatActionsOpen" icon="arrowUp" label="返回顶部" @click="scrollToTop"/>
    <UiFloatButton v-if="floatActionsOpen" icon="bell" label="系统提醒" badge="3" @click="openNotification('info');floatActionsOpen=false"/>
    <UiFloatButton v-if="floatActionsOpen" icon="plus" label="新建客户" @click="openModal('新建客户');floatActionsOpen=false"/>
    <UiFloatButton icon="plus" label="快捷操作" variant="primary" :active="floatActionsOpen" @click="floatActionsOpen=!floatActionsOpen"/>
  </div>

  <UiToastHost/>

  <UiNotification/>

  <UiModal :model-value="!!modal" :title="modal?.title || ''" :width="560" destroy-on-close @update:model-value="modal=$event?modal:null">
    <p v-if="modal?.kind==='danger'">此操作会影响已选择的数据，请确认是否继续。</p>
    <div v-else-if="modal" class="form-row">
      <UiFormItem label="名称" required><UiInput v-model="modal.name" clearable placeholder="请输入名称"/></UiFormItem>
      <UiFormItem label="类型"><UiSelect v-model="modal.type" :options="['默认类型','重要类型']" clearable placeholder="请选择类型"/></UiFormItem>
      <UiFormItem label="计划日期"><UiDatePicker v-model="modal.date"/></UiFormItem>
      <UiFormItem label="附件"><UiUpload v-model="modal.files" accept=".pdf,.doc,.docx,.png,.jpg" :max-count="2" :max-size="10" hint="上传业务附件" @error="notify($event,'error')"/></UiFormItem>
      <UiFormItem label="备注" style="grid-column:1/-1"><UiTextarea v-model="modal.note" :maxlength="120" show-count placeholder="请输入备注信息"/></UiFormItem>
    </div>
    <template #footer><UiButton variant="outline" @click="modal=null">取消</UiButton><UiButton :variant="modal?.kind==='danger'?'danger':'primary'" @click="saveModal">{{ modal?.kind==='danger'?'确认删除':'保存' }}</UiButton></template>
  </UiModal>

  <UiDrawer :model-value="!!drawer" title="客户详情" :width="430" @update:model-value="drawer=$event?drawer:null">
    <template v-if="drawer"><div style="display:flex;align-items:center;gap:12px;margin-bottom:24px"><UiAvatar :name="drawer.name" size="lg" square/><div><h3 style="margin:0 0 2px;font-size:15px">{{ drawer.name }}</h3><span class="subtle" style="font-size:11px">{{ drawer.id }}</span></div></div><div class="grid grid-2" style="gap:18px"><div><div class="subtle" style="font-size:10px">负责人</div><strong style="font-size:13px">{{ drawer.owner }}</strong></div><div><div class="subtle" style="font-size:10px">当前状态</div><UiTag color="blue" dot>{{ drawer.status }}</UiTag></div><div><div class="subtle" style="font-size:10px">累计成交</div><strong style="font-size:17px">¥ {{ Number(drawer.amount||0).toLocaleString() }}</strong></div><div><div class="subtle" style="font-size:10px">客户评分</div><strong style="font-size:13px;color:#f59e0b">★★★★★</strong></div></div><div style="margin:24px 0;border-top:1px solid var(--border-subtle)"/><h4 style="font-size:13px">近期跟进</h4><div class="notice-list"><div class="notice-item"><span class="notice-dot"/><div class="notice-content"><strong>完成季度业务回访</strong><span>今天 10:20 · 周琪</span></div></div><div class="notice-item"><span class="notice-dot" style="background:#10b981"/><div class="notice-content"><strong>新增年度采购意向</strong><span>8 月 6 日 · 系统同步</span></div></div></div></template>
  </UiDrawer>
</template>
