<template>
  <div
    ref="cardRef"
    class="card group relative overflow-hidden transition-all duration-300"
    :class="{
      'opacity-0 translate-y-4': !isVisible,
      'opacity-100 translate-y-0': isVisible,
    }"
    :style="{ transitionDelay: `${props.delay || 0}ms` }"
  >

    <div class="space-y-4">
      <!-- 模型名称和徽章 -->
      <div class="flex items-start justify-between">
        <div>
          <div class="flex items-center gap-2 mb-2">
            <span class="text-2xl transition-transform duration-300 group-hover:scale-110">{{ model.icon }}</span>
            <h3 class="text-h3 transition-colors duration-300 group-hover:text-tech-blue">{{ model.name }}</h3>
          </div>
          <span class="text-small text-neutral-gray">{{ model.version }}</span>
        </div>
        <span
          class="px-3 py-1 rounded-full text-xs font-bold"
          :class="{
            'bg-success-green/20 text-success-green': model.badge === 'SOTA',
            'bg-tech-blue/20 text-tech-blue': model.badge === 'No.1',
            'bg-warning-orange/20 text-warning-orange': model.badge === 'Beta',
          }"
        >
          {{ model.badge }}
        </span>
      </div>

      <!-- 技术标签 -->
      <div class="flex flex-wrap gap-2">
        <span
          v-for="tag in model.tags"
          :key="tag"
          class="px-2 py-1 bg-bg-light text-small text-neutral-gray rounded"
        >
          {{ tag }}
        </span>
      </div>

      <!-- 能力描述 -->
      <p class="text-body text-text-dark">{{ model.description }}</p>

      <!-- 数据展示 -->
      <div class="space-y-2 pt-4 border-t border-bg-light">
        <div class="flex justify-between text-small transition-colors duration-300 group-hover:bg-bg-light/50 -mx-2 px-2 py-1 rounded">
          <span class="text-neutral-gray">推理速度:</span>
          <span class="font-medium text-text-dark group-hover:text-tech-blue transition-colors duration-300">{{ model.metrics.speed }}</span>
        </div>
        <div class="flex justify-between text-small transition-colors duration-300 group-hover:bg-bg-light/50 -mx-2 px-2 py-1 rounded">
          <span class="text-neutral-gray">上下文长度:</span>
          <span class="font-medium text-text-dark group-hover:text-tech-blue transition-colors duration-300">{{ model.metrics.context }}</span>
        </div>
        <div class="flex justify-between text-small transition-colors duration-300 group-hover:bg-bg-light/50 -mx-2 px-2 py-1 rounded">
          <span class="text-neutral-gray">准确率:</span>
          <span class="font-medium text-text-dark group-hover:text-tech-blue transition-colors duration-300">{{ model.metrics.accuracy }}</span>
        </div>
      </div>

      <!-- 查看详情链接 -->
      <router-link
        :to="`/product/${model.id}`"
        class="inline-flex items-center gap-2 text-tech-blue hover:text-tech-blue-dark transition-all duration-300 font-medium group-hover:gap-3"
      >
        查看详情
        <svg class="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { Model } from '../types'

const props = defineProps<{
  model: Model
  delay?: number
}>()

const cardRef = ref<HTMLElement | null>(null)
const isVisible = ref(false)

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        isVisible.value = true
      }
    })
  },
  { threshold: 0.1 }
)

onMounted(() => {
  if (cardRef.value) {
    observer.observe(cardRef.value)
  }
})

onUnmounted(() => {
  if (cardRef.value) {
    observer.unobserve(cardRef.value)
  }
  observer.disconnect()
})
</script>

