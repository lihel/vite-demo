// 所有的import都会发起一个网络请求，vite拦截这个请求，渲染即可
// http拦截，按需使用
import { createApp } from "vue"; // node_module
//import { createApp } from '/@modules/vue'
// 编译后@module开头，就是去node_module里找

import App from "./App.vue"; // 解析成额外的 ?type=template请求
// import './index.css' // 也是一个额外的css请求

createApp(App).mount("#app");

// alert("2");
