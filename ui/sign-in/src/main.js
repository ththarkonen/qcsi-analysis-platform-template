import { createApp } from 'vue'
import App from './App.vue'

import Particles from 'particles.vue3'

import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap"

import "./assets/css/global.css"

const app = createApp(App)
app.use( Particles )

app.mount('#app')
