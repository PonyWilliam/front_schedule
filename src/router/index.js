import { createRouter,createWebHistory} from "vue-router";
import workspace from '../views/workspace.vue'
import setting from '../views/settings.vue'
import share from '../views/share.vue'

// 2. 定义一些路由
// 每个路由都需要映射到一个组件。
// 我们后面再讨论嵌套路由。
const routes = [
  { path: '/', component: workspace },
  {path: '/home', component: workspace},
  { path: '/share',component:share},
  { path: '/setting',component:setting}
]
const router = createRouter({
  // 4. 内部提供了 history 模式的实现。为了简单起见，我们在这里使用 hash 模式。
  history: createWebHistory(),
  routes, // `routes: routes` 的缩写
})

export default router