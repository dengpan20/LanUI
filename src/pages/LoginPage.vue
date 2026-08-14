<script setup>
import { ref } from 'vue'
import AppIcon from '../components/AppIcon.vue'
import UiButton from '../components/UiButton.vue'
import UiInput from '../components/UiInput.vue'
const emit=defineEmits(['login'])
const email=ref('');const password=ref('');const remember=ref(true);const error=ref('');const loading=ref(false)
function submit(){ if(!/^\S+@\S+\.\S+$/.test(email.value)){error.value='请输入有效的邮箱地址';return}if(!password.value){error.value='请输入密码';return}loading.value=true;setTimeout(()=>{loading.value=false;emit('login',{email:email.value,remember:remember.value})},500) }
function demo(){email.value='demo@lanui.cn';password.value='lanui-demo';submit()}
</script>
<template>
  <div class="auth-page"><section class="auth-visual"><div class="auth-brand"><span class="brand-mark"><AppIcon name="layers"/></span>Lan UI <span class="brand-version">V1.49.0</span></div><div class="auth-message"><div class="auth-kicker">Clean Enterprise Design System</div><h1>让复杂业务，拥有清晰秩序。</h1><p>基于统一 Token、组件与交互模式构建的企业级后台系统，兼顾信息密度、效率与一致性。</p><div class="auth-features"><span class="auth-feature"><AppIcon name="checkCircle"/>Vue 3 组件化</span><span class="auth-feature"><AppIcon name="checkCircle"/>完整交互状态</span><span class="auth-feature"><AppIcon name="checkCircle"/>响应式与暗色模式</span></div></div><div class="auth-grid-art"/><div class="auth-footer">© 2026 Lan UI · Design System Showcase</div></section>
    <main class="auth-form-wrap"><form class="auth-form" @submit.prevent="submit"><h2>欢迎回来</h2><p>登录企业工作台，继续处理你的业务。</p><label class="field"><span class="field-label required">邮箱</span><UiInput v-model.trim="email" icon="user" clearable :invalid="!!error && !/^\S+@\S+\.\S+$/.test(email)" type="email" autocomplete="email" placeholder="name@company.com" @input="error=''"/></label><label class="field"><span class="field-label required">密码</span><UiInput v-model="password" icon="lock" password-toggle :invalid="!!error&&!password" type="password" autocomplete="current-password" placeholder="请输入密码" @input="error=''"/><span v-if="error" class="field-error"><AppIcon name="alert" :size="12"/>{{ error }}</span></label><div class="auth-options"><label class="checkbox"><input v-model="remember" type="checkbox"/>记住登录状态</label><a href="#" @click.prevent="error='演示环境：请联系管理员重置密码'">忘记密码？</a></div><UiButton type="submit" size="lg" :loading="loading">登录工作台</UiButton><div class="auth-divider">或</div><UiButton variant="outline" size="lg" icon="sparkles" class="demo-login" @click="demo">使用演示账号</UiButton><div class="auth-note">演示环境支持任意有效格式邮箱与非空密码</div></form></main>
  </div>
</template>
