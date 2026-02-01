<template>
  <section id="solutions" class="py-24 bg-bg-light">
    <div class="container-custom">
      <div class="text-center mb-16">
        <h2 class="text-h2 mb-4">智能代理，满足真实需求</h2>
        <p class="text-body text-neutral-gray max-w-2xl mx-auto">
          提供强大的AI能力，满足实际业务需求
        </p>
      </div>

      <div v-if="loading" class="text-center py-12">
        <div class="text-body text-neutral-gray">加载中...</div>
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div
          v-for="feature in features"
          :key="feature.id"
          class="card"
        >
          <div class="text-4xl mb-4">{{ feature.icon }}</div>
          <h3 class="text-h3 mb-3">{{ feature.title }}</h3>
          <p class="text-body text-neutral-gray">{{ feature.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getFeatures } from '../mocks/api'
import type { Feature } from '../mocks/mock-data'

const features = ref<Feature[]>([])
const loading = ref(true)

const fetchFeatures = async () => {
  try {
    loading.value = true
    const response = await getFeatures()
    if (response.code === 200 && response.data) {
      features.value = response.data
    }
  } catch (error) {
    console.error('获取功能特性失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchFeatures()
})
</script>

