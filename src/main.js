import './assets/scss/main.scss'
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import "boxicons/css/boxicons.min.css";
import ElementPlus from 'element-plus'
import 'element-plus/theme-chalk/el-notification.css'
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import zhTw from "element-plus/es/locale/lang/zh-tw";
import { formatPrice } from './utils/format';

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(ElementPlus, { locale: zhTw });
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

// 全域過濾器/方法
app.config.globalProperties.$formatPrice = formatPrice;

app.mount('#app')
