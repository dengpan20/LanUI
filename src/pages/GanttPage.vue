<script setup>
import { ref } from 'vue'
import AppIcon from '../components/AppIcon.vue'
import UiButton from '../components/UiButton.vue'
import UiTag from '../components/UiTag.vue'
import UiBreadcrumb from '../components/UiBreadcrumb.vue'
import UiAvatar from '../components/UiAvatar.vue'
import UiTabs from '../components/UiTabs.vue'
defineEmits(['notify','open-modal'])
const ganttScale=ref('week')
const tasks=[
 {name:'需求调研与范围确认',owner:'周琪',initial:'周',date:'08/01–08/06',start:'2%',width:'19%',progress:'100%',bar:'#2563eb'},
 {name:'信息架构与原型设计',owner:'陈晨',initial:'陈',date:'08/05–08/12',start:'14%',width:'25%',progress:'88%',bar:'#7c3aed'},
 {name:'Design Token 定义',owner:'林一',initial:'林',date:'08/09–08/15',start:'27%',width:'21%',progress:'64%',bar:'#06b6d4'},
 {name:'基础组件开发',owner:'王可',initial:'王',date:'08/12–08/22',start:'38%',width:'34%',progress:'35%',bar:'#10b981'},
 {name:'业务页面联调',owner:'赵月',initial:'赵',date:'08/20–08/27',start:'65%',width:'26%',progress:'8%',bar:'#f59e0b'},
 {name:'验收与版本发布',owner:'团队',initial:'组',date:'08/26–08/31',start:'84%',width:'14%',progress:'0%',bar:'#ef4444'},
]
</script>

<template>
  <div class="page-container"><div class="page-heading"><div><UiBreadcrumb :items="[{label:'项目管理',href:'#/gantt'},{label:'甘特计划'}]"/><h1>甘特计划</h1><p>可视化跟踪任务周期、负责人和项目进度</p></div><div class="page-actions"><UiButton variant="outline" icon="download" @click="$emit('notify','甘特图已导出')">导出</UiButton><UiButton icon="plus" @click="$emit('open-modal','新建任务')">新建任务</UiButton></div></div>
    <section class="card"><div class="gantt-toolbar"><div class="toolbar-group"><UiTabs v-model="ganttScale" :panels="false" size="sm" :items="[{label:'日',value:'day'},{label:'周',value:'week'},{label:'月',value:'month'}]"/><button class="btn btn-outline btn-sm"><AppIcon name="calendar" :size="14"/>2026 年 8 月</button><UiTag color="blue" dot>进行中 4</UiTag></div><div class="toolbar-group"><button class="icon-btn outline" title="缩小" @click="$emit('notify','时间轴已缩小')">−</button><button class="icon-btn outline" title="放大" @click="$emit('notify','时间轴已放大')">＋</button><button class="btn btn-outline btn-sm" @click="$emit('notify','已定位到今天')">今天</button></div></div>
      <div class="gantt"><div class="gantt-inner"><div class="gantt-header"><div class="gantt-task-head">任务名称 / 负责人</div><div class="timeline-head"><span v-for="d in 12" :key="d">{{ 1+(d-1)*3 }}日</span></div></div><div v-for="t in tasks" :key="t.name" class="gantt-row"><div class="gantt-task"><UiAvatar :name="t.owner" size="sm"/><div class="gantt-task-copy"><strong>{{ t.name }}</strong><span>{{ t.owner }} · {{ t.date }}</span></div></div><div class="timeline-cell"><span class="today-line"/><div class="gantt-bar" :style="{'--start':t.start,'--width':t.width,'--progress':t.progress,'--bar':t.bar}" :title="`${t.name} · 完成 ${t.progress}`"><span>{{ t.progress }} 完成</span></div></div></div></div></div>
      <div style="padding:12px 16px;display:flex;gap:16px;color:var(--text-tertiary);font-size:10px"><span class="legend-item"><i class="legend-dot"/>已规划任务</span><span class="legend-item"><i class="legend-dot" style="background:#ef4444"/>今日线</span><span>拖动时间条可调整计划（交互示例）</span></div>
    </section>
  </div>
</template>
