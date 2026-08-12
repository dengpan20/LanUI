import { createApp, nextTick } from 'vue'
import InteractionFixture from './InteractionFixture.vue'
import '../../styles.css'
import './fixture.css'

const params = new URLSearchParams(location.search)
const direction = params.get('direction') || 'ltr'
document.documentElement.dir = direction

createApp(InteractionFixture, { direction }).mount('#interaction-app')
await nextTick()
await document.fonts.ready
document.body.dataset.interactionReady = 'true'
