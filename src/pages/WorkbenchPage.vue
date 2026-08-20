<script setup>
import AppIcon from '../components/AppIcon.vue'
import UiPageHeader from '../components/UiPageHeader.vue'
import UiAvatar from '../components/UiAvatar.vue'
import MetricCard from '../components/MetricCard.vue'
import UiCard from '../components/UiCard.vue'
defineEmits(['notify','navigate'])

const quick = [
  ['plus','新建订单'],['users','客户管理'],['file','经营报表'],['calendar','日程计划'],
  ['upload','批量导入'],['settings','系统设置'],['bot','智能助手'],['more','更多应用']
]
const activities = [
  ['周琪','提交了销售订单 SO-20260810-024','3 分钟前','blue'],
  ['陈晨','完成了供应商资质审核','18 分钟前','green'],
  ['林一','更新了八月经营目标','1 小时前','purple'],
  ['系统','生成了昨日销售数据日报','2 小时前','orange'],
]
</script>

<template>
  <div class="page-container">
    <UiPageHeader title="我的工作台" description="集中处理待办、业务动态与常用功能" :breadcrumbs="[{label:'工作台',href:'#/workbench'},{label:'我的工作台'}]"><template #actions><button class="icon-btn outline" title="自定义工作台" @click="$emit('notify','工作台编辑模式已开启')"><AppIcon name="settings"/></button></template></UiPageHeader>
    <div class="card welcome-card" style="margin-bottom:16px">
      <UiAvatar name="Deng Pan" size="lg"/><div class="welcome-copy"><h2>早上好，Deng Pan 👋</h2><p>今天是 2026 年 8 月 10 日，星期一。你有 <strong class="text-brand">6 项待办</strong>需要处理。</p></div>
      <div class="welcome-weather"><AppIcon name="sun" :size="30" class="weather-icon"/><div><strong>29°C</strong><div class="subtle" style="font-size:10px">上海 · 晴</div></div></div>
    </div>
    <div class="grid grid-4" style="margin-bottom:16px"><MetricCard label="我的待办" value="6" unit="项" trend="2 项" direction="down" icon="checkCircle" color="#2563eb" tint="#eff6ff"/><MetricCard label="本周完成" value="28" unit="项" trend="16.7%" icon="check" color="#059669" tint="#ecfdf5"/><MetricCard label="待审批" value="12" unit="项" trend="3 项" direction="down" icon="file" color="#ea580c" tint="#fff7ed"/><MetricCard label="未读消息" value="9" unit="条" trend="4 条" direction="down" icon="bell" color="#7c3aed" tint="#f5f3ff"/></div>
    <div class="grid grid-8-4" style="margin-bottom:16px">
      <UiCard title="快捷入口"><div class="quick-grid"><button v-for="item in quick" :key="item[1]" class="quick-action" @click="item[1]==='智能助手'?$emit('navigate','/ai'):$emit('notify',`${item[1]}已打开`)"><span class="quick-icon"><AppIcon :name="item[0]"/></span><span>{{ item[1] }}</span></button></div></UiCard>
      <UiCard title="最新公告"><template #action><button class="card-action" @click="$emit('notify','已标记全部公告为已读')">全部已读</button></template><div class="notice-list"><div class="notice-item"><span class="notice-dot"/><div class="notice-content"><strong>关于 8 月系统版本升级的通知</strong><span>系统公告 · 10:20</span></div></div><div class="notice-item"><span class="notice-dot" style="background:#10b981"/><div class="notice-content"><strong>2026 半年度优秀团队评选结果</strong><span>行政中心 · 昨天</span></div></div><div class="notice-item"><span class="notice-dot" style="background:#f59e0b"/><div class="notice-content"><strong>数据安全合规培训提醒</strong><span>信息中心 · 08-08</span></div></div></div></UiCard>
    </div>
    <div class="grid grid-8-4">
      <UiCard title="我的待办"><template #action><button class="card-action" @click="$emit('navigate','/data')">查看全部</button></template><div class="table-wrap"><table class="data-table"><thead><tr><th>待办事项</th><th>业务模块</th><th>优先级</th><th>截止时间</th><th>操作</th></tr></thead><tbody><tr><td><span class="cell-title">审批华东区域采购申请</span></td><td>采购管理</td><td><span class="tag tag-red">紧急</span></td><td>今天 14:00</td><td><button class="btn btn-text btn-sm" @click="$emit('notify','已进入审批')">处理</button></td></tr><tr><td><span class="cell-title">确认 Q3 销售目标拆解</span></td><td>目标管理</td><td><span class="tag tag-orange">较高</span></td><td>今天 18:00</td><td><button class="btn btn-text btn-sm" @click="$emit('notify','已进入确认')">处理</button></td></tr><tr><td><span class="cell-title">更新重点客户跟进记录</span></td><td>客户管理</td><td><span class="tag tag-blue">普通</span></td><td>明天 12:00</td><td><button class="btn btn-text btn-sm" @click="$emit('notify','已打开客户记录')">处理</button></td></tr></tbody></table></div></UiCard>
      <UiCard title="团队动态"><template #action><button class="card-action" @click="$emit('notify','动态已刷新')"><AppIcon name="refresh" :size="14"/></button></template><div><div v-for="a in activities" :key="a[1]" class="activity-item"><UiAvatar :name="a[0]" :color="a[3]" size="sm"/><div class="activity-copy"><strong>{{ a[0] }}</strong> {{ a[1] }}<span class="activity-time">{{ a[2] }}</span></div></div></div></UiCard>
    </div>
  </div>
</template>
