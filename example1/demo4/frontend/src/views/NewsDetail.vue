<template>
  <div class="min-h-screen bg-bg-light">
    <Navbar />
    <div class="pt-24 pb-18">
      <div class="container-custom max-w-4xl">
        <!-- 加载状态 -->
        <div v-if="loading" class="flex justify-center items-center py-20">
          <div class="text-neutral-gray">加载中...</div>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="error" class="flex flex-col items-center justify-center py-20">
          <div class="text-neutral-gray mb-4">{{ error }}</div>
          <div class="flex gap-4">
            <button
              @click="fetchNewsDetail"
              class="btn-primary"
            >
              重试
            </button>
            <router-link
              to="/news"
              class="btn-secondary"
            >
              返回列表
            </router-link>
          </div>
        </div>

        <!-- 新闻详情 -->
        <div v-else-if="newsDetail" class="bg-white rounded-card p-8 md:p-12">
          <!-- 返回按钮 -->
          <router-link
            to="/news"
            class="inline-flex items-center gap-2 text-neutral-gray hover:text-tech-blue transition-colors duration-300 mb-8"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span>返回新闻列表</span>
          </router-link>

          <!-- 分类标签 -->
          <div v-if="newsDetail.category" class="mb-4">
            <span class="px-3 py-1 bg-tech-blue/10 text-tech-blue text-small rounded-full font-medium">
              {{ newsDetail.category }}
            </span>
          </div>

          <!-- 标题 -->
          <h1 class="text-h1 text-text-dark mb-6">
            {{ newsDetail.title }}
          </h1>

          <!-- 元信息 -->
          <div class="flex items-center gap-4 text-small text-neutral-gray mb-8 pb-8 border-b border-bg-light">
            <span>{{ formatDate(newsDetail.publishDate) }}</span>
            <span v-if="newsDetail.author">{{ newsDetail.author }}</span>
          </div>

          <!-- 内容 -->
          <div
            class="prose prose-lg max-w-none text-body text-text-dark"
            v-html="formatContent(newsDetail.content)"
          />
        </div>
      </div>
    </div>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Navbar from '../components/Navbar.vue'
import Footer from '../components/Footer.vue'
import { getNewsDetail } from '../mocks/api'
import type { NewsDetail } from '../types'

const route = useRoute()
const newsDetail = ref<NewsDetail | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

async function fetchNewsDetail() {
  try {
    loading.value = true
    error.value = null
    const id = Number(route.params.id)
    if (isNaN(id)) {
      error.value = '无效的新闻 ID'
      return
    }
    const response = await getNewsDetail(id)
    if (response.code === 200 && response.data) {
      newsDetail.value = response.data
    } else {
      error.value = response.message || '新闻未找到'
    }
  } catch (err) {
    error.value = '加载失败，请稍后重试'
    console.error('Failed to fetch news detail:', err)
  } finally {
    loading.value = false
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}年${month}月${day}日`
}

function formatContent(content: string): string {
  // 将 Markdown 风格的标题转换为 HTML，然后处理段落
  let formatted = content
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\n\n+/g, '</p><p>')
    .replace(/\n/g, '<br>')
  
  // 确保内容被包裹在段落标签中
  if (!formatted.startsWith('<h')) {
    formatted = '<p>' + formatted
  }
  if (!formatted.endsWith('</p>') && !formatted.endsWith('</h3>') && !formatted.endsWith('</h2>') && !formatted.endsWith('</h1>')) {
    formatted = formatted + '</p>'
  }
  
  return formatted
}

onMounted(() => {
  fetchNewsDetail()
})
</script>

<style scoped>
.prose h1 {
  @apply text-h1 text-text-dark mb-4 mt-8;
}

.prose h2 {
  @apply text-h2 text-text-dark mb-3 mt-6;
}

.prose h3 {
  @apply text-h3 text-text-dark mb-2 mt-4;
}

.prose p {
  @apply mb-4 leading-relaxed;
}

.prose ul,
.prose ol {
  @apply mb-4 ml-6;
}

.prose li {
  @apply mb-2;
}
</style>

