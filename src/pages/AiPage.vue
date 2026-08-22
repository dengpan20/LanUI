<script setup>
import { nextTick, ref } from 'vue'
import AppIcon from '../components/AppIcon.vue'
import UiPageHeader from '../components/UiPageHeader.vue'
import UiAvatar from '../components/UiAvatar.vue'
const emit = defineEmits(['notify'])
const input = ref('')
const sending = ref(false)
const messages = ref([
  {role:'assistant',text:'你好，我是 Lan AI 企业助手。我可以帮你分析经营数据、生成业务摘要，或快速定位系统功能。今天想先了解什么？',quick:['总结本周销售情况','有哪些逾期待办？','生成客户复盘提纲']},
  {role:'user',text:'帮我总结一下本周的销售表现。'},
  {role:'assistant',text:'本周销售额为 72.6 万元，环比增长 12.6%。其中华东区域贡献最高，占比 41%；企业客户新增 128 家。值得关注的是退款率下降了 0.8 个百分点，但渠道客户转化率仍低于目标 3.2%。建议优先复盘华南渠道的线索跟进效率。'}
])
const history=['本周销售表现总结','重点客户跟进建议','Q3 经营目标拆解','供应商风险分析','月度数据报告']
async function send(text){ const value=(text||input.value).trim();if(!value||sending.value)return;messages.value.push({role:'user',text:value});input.value='';sending.value=true;await nextTick();setTimeout(()=>{messages.value.push({role:'assistant',text:`已收到“${value}”。这是一个交互演示：在实际产品中，这里会连接企业知识库与业务数据，并以结构化卡片返回答案。`});sending.value=false;nextTick(()=>document.querySelector('.messages')?.scrollTo({top:99999,behavior:'smooth'}))},700) }
</script>

<template>
  <div class="page-container">
    <UiPageHeader title="智能问答" description="结合业务数据与企业知识库的 AI 工作助手" :breadcrumbs="[{label:'工作台',href:'#/workbench'},{label:'智能问答'}]"/>
    <section class="card chat-layout">
      <aside class="chat-history"><button class="btn btn-primary" style="width:100%" @click="messages=[messages[0]]"><AppIcon name="plus" :size="15"/>新建对话</button><div class="chat-history-title">最近对话</div><button v-for="(h,i) in history" :key="h" class="chat-history-item" :class="{active:i===0}">{{ h }}</button></aside>
      <div class="chat-main"><header class="chat-top"><div class="chat-title"><span class="bot-mark"><AppIcon name="sparkles"/></span><div><strong>Lan AI 助手</strong><span>● 服务正常</span></div></div><div><button class="icon-btn" title="清空对话" @click="messages=[messages[0]]"><AppIcon name="trash" :size="15"/></button><button class="icon-btn" title="更多"><AppIcon name="more" :size="15"/></button></div></header>
        <div class="messages"><div v-for="(m,i) in messages" :key="i" class="message" :class="m.role"><UiAvatar :name="m.role==='assistant'?'AI':'Admin User'" :color="m.role==='assistant'?'blue':'purple'" size="sm"/><div><div class="message-bubble">{{ m.text }}<div v-if="m.quick" class="quick-prompts"><button v-for="q in m.quick" :key="q" class="prompt-chip" @click="send(q)">{{ q }}</button></div></div><div v-if="m.role==='assistant'" class="message-tools"><button @click="navigator.clipboard?.writeText(m.text);emit('notify','回答已复制')"><AppIcon name="copy" :size="12"/> 复制</button><button @click="emit('notify','已重新生成回答')"><AppIcon name="refresh" :size="12"/> 重新生成</button></div></div></div><div v-if="sending" class="message assistant"><UiAvatar name="AI" size="sm"/><div class="message-bubble"><span class="spinner" style="display:inline-block;color:var(--brand-600)"/> 正在思考…</div></div></div>
        <div class="composer-wrap"><div class="composer"><button class="icon-btn" title="上传附件" @click="emit('notify','附件上传功能已打开')"><AppIcon name="plus"/></button><textarea v-model="input" rows="1" placeholder="输入问题，Enter 发送，Shift + Enter 换行" @keydown.enter.exact.prevent="send()"/><button class="btn btn-primary" :disabled="!input.trim()||sending" @click="send()"><AppIcon name="send" :size="15"/>发送</button></div><div class="subtle" style="text-align:center;font-size:9px;margin-top:6px">AI 生成内容仅供参考，重要业务决策请核验原始数据</div></div>
      </div>
    </section>
  </div>
</template>
