// 所有的import都会发起一个网络请求，vite拦截这个请求，渲染即可
import { createApp } from 'vue'
//import { createApp } from '/@modules/vue'
// 编译后@module开头，就是去node_module里找

import App from './App.vue'
// import './index.css'

createApp(App).mount('#app')

// alert("2");
