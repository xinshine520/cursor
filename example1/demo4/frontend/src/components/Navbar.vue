<template>
  <nav
    ref="navbarRef"
    class="fixed top-0 left-0 right-0 z-50 bg-white shadow-md transition-all duration-300"
    :class="{
      '-translate-y-full': isScrollingDown && isScrolled,
    }"
  >
    <div class="container-custom">
      <div class="flex items-center justify-between h-16">
        <!-- Logo和产品名称 -->
        <router-link
          to="/"
          class="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div class="w-10 h-10 bg-tech-blue rounded-lg flex items-center justify-center">
            <span class="text-white font-bold text-lg">HY</span>
          </div>
          <span class="text-xl font-bold text-text-dark">华玥智能</span>
        </router-link>

        <!-- 主导航菜单 -->
        <div class="hidden md:flex items-center gap-8">
          <router-link
            :to="{ path: '/', hash: '#products' }"
            class="text-text-dark hover:text-tech-blue transition-colors"
          >
            产品
          </router-link>
          <router-link
            :to="{ path: '/', hash: '#solutions' }"
            class="text-text-dark hover:text-tech-blue transition-colors"
          >
            解决方案
          </router-link>
          <router-link
            :to="{ path: '/', hash: '#developers' }"
            class="text-text-dark hover:text-tech-blue transition-colors"
          >
            开发者
          </router-link>
          <router-link
            to="/pricing"
            class="text-text-dark hover:text-tech-blue transition-colors"
          >
            价格
          </router-link>
          <router-link
            to="/news"
            class="text-text-dark hover:text-tech-blue transition-colors"
          >
            新闻
          </router-link>
          <router-link
            to="/ai-agent"
            class="text-text-dark hover:text-tech-blue transition-colors"
          >
            AI Agent定制化
          </router-link>
        </div>

        <!-- 右侧操作 -->
        <div class="flex items-center gap-4">
          <!-- 搜索图标 -->
          <button class="p-2 hover:bg-bg-light rounded-lg transition-colors">
            <svg class="w-5 h-5 text-neutral-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <!-- 控制台按钮 -->
          <button class="btn-primary">控制台</button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const navbarRef = ref<HTMLElement | null>(null)
const isScrolled = ref(false)
const isScrollingDown = ref(false)
let lastScrollY = 0

const handleScroll = () => {
  const currentScrollY = window.scrollY
  isScrolled.value = currentScrollY > 10
  isScrollingDown.value = currentScrollY > lastScrollY && currentScrollY > 100
  lastScrollY = currentScrollY
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

