/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import { registerPlugins } from '@/plugins'
import axios from 'axios'

// Components
import App from './App.vue'

// Composables
import { createApp } from 'vue'

// Router
import router from './router/index'

const app = createApp(App)

registerPlugins(app)

app.use(router).mount('#app')
