import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import './assets/css/storefront.css' // Import storefront styles
import './assets/css/dashboard.css' // Import dashboard styles
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'
import '@fortawesome/fontawesome-free/css/all.css'

import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

app.mount('#app')
