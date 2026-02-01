<template>
  <div class="min-h-screen bg-bg-light">
    <Navbar />
    <div class="pt-24 pb-18">
      <div class="container-custom">
        <!-- 页面标题 -->
        <div class="text-center mb-12">
          <h1 class="text-h1 text-text-dark mb-4">新闻动态</h1>
          <p class="text-body text-neutral-gray max-w-2xl mx-auto">
            了解华玥智能的最新资讯、产品更新、行业动态
          </p>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="flex justify-center items-center py-20">
          <div class="text-neutral-gray">加载中...</div>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="error" class="flex flex-col items-center justify-center py-20">
          <div class="text-neutral-gray mb-4">{{ error }}</div>
          <button
            @click="fetchNews"
            class="btn-primary"
          >
            重试
          </button>
        </div>

        <!-- 空状态 -->
        <div v-else-if="newsList.length === 0" class="flex flex-col items-center justify-center py-20">
          <div class="text-neutral-gray mb-4">暂无新闻</div>
        </div>

        <!-- 新闻列表 -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <NewsCard
            v-for="news in newsList"
            :key="news.id"
            :news="news"
          />
        </div>
      </div>
    </div>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Navbar from '../components/Navbar.vue'
import Footer from '../components/Footer.vue'
import NewsCard from '../components/NewsCard.vue'
import { getNewsList } from '../mocks/api'
import type { NewsItem } from '../types'

const newsList = ref<NewsItem[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

async function fetchNews() {
  try {
    loading.value = true
    error.value = null
    const response = await getNewsList()
    if (response.code === 200) {
      // 按发布日期倒序排列（最新的在前）
      newsList.value = response.data.sort((a, b) => {
        return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
      })
    } else {
      error.value = response.message || '加载失败'
    }
  } catch (err) {
    error.value = '加载失败，请稍后重试'
    console.error('Failed to fetch news:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchNews()
})
</script>

