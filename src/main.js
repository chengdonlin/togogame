import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import axios from "axios";
import pinia from "./stores";
import {createPinia} from "pinia";
import piniaPluginPersist from "pinia-plugin-persist"
import "./assets/css/global.css"
import "./assets/css/max1250.css"
import "./assets/css/gameHome850.css"
import "./assets/css/median600.css"
import "./assets/css/chess560.css"
import "./assets/js/globalListening"
import {layer} from "@layui/layer-vue"
import "@layui/layer-vue/lib/index.css"


const Axios= axios.create({
    baseURL: '/api',
    timeout: 3000
})

const app = createApp(App)
app.config.globalProperties.$axios = Axios
app.config.globalProperties.$layer = layer

app.use(router).use(pinia).use(createPinia().use(piniaPluginPersist)).mount('#app')
