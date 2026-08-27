import { createApp } from 'vue'
import { createPinia } from 'pinia'
// UI 라이브러리(Element Plus)는 전역 등록 — 컴포넌트마다 import 없이 <el-button> 같은 태그를 바로 씀
// (실무에선 번들 줄이려고 쓰는 것만 자동 import하는 방식도 있지만, 이 규모에선 전역이 깔끔)
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'

// use(createPinia())를 해줘야 컴포넌트 어디서든 useConfigStore() 같은 스토어를 꺼내 쓸 수 있음
createApp(App).use(router).use(createPinia()).use(ElementPlus).mount('#app')
