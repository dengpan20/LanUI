<script setup>
import { ref } from 'vue'
import AppIcon from '../components/AppIcon.vue'
import UiPageHeader from '../components/UiPageHeader.vue'
import MetricCard from '../components/MetricCard.vue'
import UiButton from '../components/UiButton.vue'
import UiCard from '../components/UiCard.vue'
import UiSelect from '../components/UiSelect.vue'

defineEmits(['notify','navigate'])
const range = ref('近 30 天')
const bars = [52,68,46,78,64,84,72,91,69,86,76,93]
const tasks = [
  ['数据权限配置待确认','产品中心','今天 14:30','orange'],
  ['供应商资质复核','采购管理','今天 16:00','blue'],
  ['月度经营报表提交','数据中心','明天 10:00','green'],
]
</script>

<template>
  <div class="page-container">
    <UiPageHeader title="综合看板" description="关键经营数据与业务趋势总览，更新于今天 10:24" :breadcrumbs="[{label:'首页',href:'#/home'},{label:'综合看板'}]">
      <template #actions><UiButton variant="outline" icon="download" @click="$emit('notify','报表已开始导出')">导出报表</UiButton><UiButton icon="refresh" @click="$emit('notify','数据已刷新')">刷新数据</UiButton></template>
    </UiPageHeader>

    <div class="grid grid-4" style="margin-bottom:16px">
      <MetricCard label="本月销售额" value="¥ 286.4" unit="万" trend="12.6%" icon="money" color="#2563eb" tint="#eff6ff" />
      <MetricCard label="活跃客户" value="8,492" unit="人" trend="8.2%" icon="users" color="#7c3aed" tint="#f5f3ff" />
      <MetricCard label="订单总量" value="12,680" unit="单" trend="5.7%" icon="bag" color="#059669" tint="#ecfdf5" />
      <MetricCard label="退款金额" value="¥ 18.2" unit="万" trend="2.1%" direction="down" icon="refresh" color="#ea580c" tint="#fff7ed" />
    </div>

    <div class="grid grid-7-5" style="margin-bottom:16px">
      <UiCard title="销售趋势">
        <template #action><div class="chart-legend"><span class="legend-item"><i class="legend-dot"/>销售额</span><UiSelect v-model="range" size="sm" :options="['近 7 天','近 30 天','近 90 天']" style="width:108px"/></div></template>
        <div class="chart-wrap">
          <svg viewBox="0 0 700 240" role="img" aria-label="近十二个月销售额折线图">
            <defs><linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b82f6" stop-opacity=".27"/><stop offset="1" stop-color="#3b82f6" stop-opacity="0"/></linearGradient></defs>
            <g class="chart-grid"><line x1="38" y1="20" x2="686" y2="20"/><line x1="38" y1="68" x2="686" y2="68"/><line x1="38" y1="116" x2="686" y2="116"/><line x1="38" y1="164" x2="686" y2="164"/><line x1="38" y1="212" x2="686" y2="212"/></g>
            <g><text class="chart-label" x="4" y="24">320k</text><text class="chart-label" x="4" y="72">240k</text><text class="chart-label" x="4" y="120">160k</text><text class="chart-label" x="4" y="168">80k</text><text class="chart-label" x="18" y="216">0</text></g>
            <path class="chart-area" d="M42 178 C80 167,93 136,132 145 S198 122,225 130 S279 83,324 104 S389 68,430 82 S488 45,526 65 S589 32,630 45 S670 28,684 35 L684 212 L42 212Z"/>
            <path class="chart-line" d="M42 178 C80 167,93 136,132 145 S198 122,225 130 S279 83,324 104 S389 68,430 82 S488 45,526 65 S589 32,630 45 S670 28,684 35"/>
            <g><circle class="chart-point" cx="42" cy="178" r="3"/><circle class="chart-point" cx="132" cy="145" r="3"/><circle class="chart-point" cx="225" cy="130" r="3"/><circle class="chart-point" cx="324" cy="104" r="3"/><circle class="chart-point" cx="430" cy="82" r="3"/><circle class="chart-point" cx="526" cy="65" r="3"/><circle class="chart-point" cx="630" cy="45" r="3"/><circle class="chart-point" cx="684" cy="35" r="3"/></g>
            <g><text class="chart-label" x="35" y="232">01/01</text><text class="chart-label" x="129" y="232">01/06</text><text class="chart-label" x="223" y="232">01/11</text><text class="chart-label" x="318" y="232">01/16</text><text class="chart-label" x="422" y="232">01/21</text><text class="chart-label" x="518" y="232">01/26</text><text class="chart-label" x="657" y="232">01/30</text></g>
          </svg>
        </div>
      </UiCard>

      <UiCard title="客户来源">
        <template #action><button class="card-action" @click="$emit('notify','已打开客户分析')">查看详情</button></template>
        <div style="display:flex;align-items:center;justify-content:center;gap:28px;min-height:248px">
          <div class="donut"><div class="donut-center"><strong>8,492</strong><span>客户总数</span></div></div>
          <div class="stack" style="gap:11px"><span class="legend-item"><i class="legend-dot"/>自然流量 62%</span><span class="legend-item"><i class="legend-dot" style="background:#06b6d4"/>广告投放 17%</span><span class="legend-item"><i class="legend-dot" style="background:#f59e0b"/>活动营销 12%</span><span class="legend-item"><i class="legend-dot" style="background:#e2e8f0"/>其他 9%</span></div>
        </div>
      </UiCard>
    </div>

    <div class="grid grid-7-5">
      <UiCard title="订单量分布">
        <template #action><div class="chart-legend"><span class="legend-item"><i class="legend-dot"/>本年</span><span class="legend-item"><i class="legend-dot" style="background:#bcd2f8"/>上年</span></div></template>
        <div class="bar-chart"><div v-for="(bar,i) in bars" :key="i" class="bar-group"><div class="bar alt" :style="{'--h':`${Math.max(25,bar-14)}%`}"/><div class="bar" :style="{'--h':`${bar}%`}"/><span class="bar-label">{{ i+1 }}月</span></div></div>
      </UiCard>
      <UiCard title="待办事项">
        <template #action><button class="card-action" @click="$emit('navigate','/workbench')">全部待办</button></template>
        <div class="notice-list">
          <div v-for="(task,i) in tasks" :key="task[0]" class="notice-item"><span class="notice-dot" :style="{background:i===0?'#f59e0b':i===1?'#2563eb':'#10b981'}"/><div class="notice-content"><strong>{{ task[0] }}</strong><span>{{ task[1] }} · {{ task[2] }}</span></div><AppIcon name="chevronRight" :size="14" class="subtle"/></div>
        </div>
      </UiCard>
    </div>
  </div>
</template>
