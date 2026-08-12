import { createApp, h } from 'vue'
import { UiButton } from 'lan-ui-design-system/components/UiButton'
import 'lan-ui-design-system/styles/UiButton.css'

createApp({ render:() => h(UiButton, { icon:'plus' }, () => 'Subpath import') }).mount('#app')
