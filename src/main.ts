import {createApp} from 'vue'
import {router} from "./router";
import ElementPlus from 'element-plus'
import App from './App.vue'
import 'element-plus/dist/index.css'
import "./style.css"
import './samples/node-api'
import {createPinia} from 'pinia'

const app = createApp(App);
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(ElementPlus)

app.mount('#app').$nextTick(() => {
    postMessage({payload: 'removeLoading'}, '*')
}).then(() => {
    router.push("/kafka")
})


