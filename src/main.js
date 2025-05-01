import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Vue3Toastify from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faPrint, faFilePdf, faComments } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
const app = createApp(App)
library.add(faPrint, faFilePdf, faComments)
app.component('font-awesome-icon', FontAwesomeIcon)

app.use(Vue3Toastify, {
    autoClose: 3000,
    position: 'top-right',
    theme: 'colored',
    // other options
})

app.use(store)
    .use(router)
    .mount('#app')