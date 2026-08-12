import { createApp } from 'vue'
import App from './App.vue'
import { createLanUi } from './plugin.js'
import '../styles.css'
import '../font-preview.css'

document.documentElement.dataset.font = localStorage.getItem('lan-font') || 'inter-noto'
createApp(App).use(createLanUi({locale:'zh-CN',size:'md',density:'default'})).mount('#app')
