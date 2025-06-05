import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router' // Assuming router setup will be in src/router/index.js

// Import Styles
import './index.css' // Tailwind CSS
import './assets/custom.css' // Your custom styles
import '@fortawesome/fontawesome-free/css/all.min.css' // Font Awesome

const app = createApp(App)

app.use(createPinia()) // Use Pinia
app.use(router) // Use Vue Router

app.mount('#app')

