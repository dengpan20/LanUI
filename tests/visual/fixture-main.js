import { createApp, nextTick } from 'vue'
import VisualFixture from './VisualFixture.vue'
import '../../styles.css'
import './fixture.css'

const params=new URLSearchParams(location.search)
const theme=params.get('theme')||'light'
const direction=params.get('direction')||'ltr'
const density=params.get('density')||'default'
const state=params.get('state')||'base'
document.documentElement.dataset.theme=theme
document.documentElement.style.colorScheme=theme

createApp(VisualFixture,{theme,direction,density,state}).mount('#visual-app')
await nextTick()
await document.fonts.ready
document.body.dataset.visualReady='true'
