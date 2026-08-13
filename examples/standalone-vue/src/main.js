import { createApp } from 'vue'
import App from './App.vue'
import { registerIcon } from 'lan-ui-design-system/icons'
import 'lan-ui-design-system/style.css'
import './standalone.css'

registerIcon('projectMark','<path d="M12 2 21 7v10l-9 5-9-5V7l9-5Z"/><path d="m7 9 5 3 5-3M12 12v6"/>')
createApp(App).mount('#app')
