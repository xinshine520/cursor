import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Pricing from '../views/Pricing.vue'
import ProductDetail from '../views/ProductDetail.vue'
import News from '../views/News.vue'
import NewsDetail from '../views/NewsDetail.vue'
import AiAgentCustomization from '../views/AiAgentCustomization.vue'

const NAVBAR_OFFSET_PX = 80

const router = createRouter({
  // 使用 Vite 的 BASE_URL，支持部署到子路径
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }

    // hash 跳转（如 /#products），预留顶部导航栏高度，避免被遮挡
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
        top: NAVBAR_OFFSET_PX,
      }
    }

    // 默认回到顶部
    return { top: 0, behavior: 'smooth' }
  },
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home,
    },
    {
      path: '/pricing',
      name: 'Pricing',
      component: Pricing,
    },
    {
      path: '/product/:id',
      name: 'ProductDetail',
      component: ProductDetail,
      props: true,
    },
    {
      path: '/news',
      name: 'News',
      component: News,
    },
    {
      path: '/news/:id',
      name: 'NewsDetail',
      component: NewsDetail,
      props: true,
    },
    {
      path: '/ai-agent',
      name: 'AiAgentCustomization',
      component: AiAgentCustomization,
    },
  ],
})

export default router

