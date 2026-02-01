<template>
  <section
    ref="sectionRef"
    id="products"
    class="py-24 bg-white"
  >
    <div class="container-custom">
      <div
        ref="titleRef"
        class="text-center mb-16 transition-all duration-300"
        :class="{
          'opacity-0 translate-y-4': !isTitleVisible,
          'opacity-100 translate-y-0': isTitleVisible,
        }"
      >
        <h2 class="text-h2 mb-4">AI 模型</h2>
        <p class="text-body text-neutral-gray max-w-2xl mx-auto">
          提供多种AI模型，满足不同应用场景需求
        </p>
      </div>

      <div v-if="loading" class="text-center py-12">
        <div class="text-body text-neutral-gray">加载中...</div>
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <ModelCard
          v-for="(model, index) in models"
          :key="model.id"
          :model="model"
          :delay="index * 100"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ModelCard from './ModelCard.vue'
import type { Model } from '../types'
import { getModels } from '../mocks/api'

const sectionRef = ref<HTMLElement | null>(null)
const titleRef = ref<HTMLElement | null>(null)
const isTitleVisible = ref(false)
const models = ref<Model[]>([])
const loading = ref(true)

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        isTitleVisible.value = true
      }
    })
  },
  { threshold: 0.1 }
)

const fetchModels = async () => {
  try {
    loading.value = true
    const response = await getModels()
    if (response.code === 200 && response.data) {
      models.value = response.data
    }
  } catch (error) {
    console.error('获取模型列表失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (titleRef.value) {
    observer.observe(titleRef.value)
  }
  fetchModels()
})
</script>

