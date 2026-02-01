<template>
  <router-link
    :to="`/news/${news.id}`"
    class="card group block transition-all duration-300"
  >
    <div class="space-y-4">
      <!-- 分类标签 -->
      <div v-if="news.category" class="flex items-center gap-2">
        <span class="px-3 py-1 bg-tech-blue/10 text-tech-blue text-small rounded-full font-medium">
          {{ news.category }}
        </span>
      </div>

      <!-- 标题 -->
      <h3 class="text-h3 text-text-dark transition-colors duration-300 group-hover:text-tech-blue">
        {{ news.title }}
      </h3>

      <!-- 摘要 -->
      <p class="text-body text-neutral-gray line-clamp-2">
        {{ news.summary }}
      </p>

      <!-- 底部信息 -->
      <div class="flex items-center justify-between pt-4 border-t border-bg-light">
        <div class="flex items-center gap-4 text-small text-neutral-gray">
          <span>{{ formatDate(news.publishDate) }}</span>
          <span v-if="news.author">{{ news.author }}</span>
        </div>
        <div class="flex items-center gap-2 text-tech-blue transition-all duration-300 group-hover:gap-3">
          <span class="font-medium">阅读更多</span>
          <svg class="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  </router-link>
</template>

<script setup lang="ts">
import type { NewsItem } from '../types'

defineProps<{
  news: NewsItem
}>()

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
</script>

