<template>
  <section class="pt-32 pb-24 bg-gradient-to-b from-deep-space to-tech-blue-dark text-white">
    <div class="container-custom">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <!-- 左侧文案 -->
        <div class="space-y-8">
          <div class="space-y-4">
            <h1 class="text-h1">
              {{ heroData?.title || '华玥智能 · 355B MoE Architecture' }}
            </h1>
            <p class="text-xl text-white/90">
              {{ heroData?.subtitle || 'SOTA性能 AI平台，提供高效优化和强大能力' }}
            </p>
          </div>

          <!-- CTA按钮 -->
          <div class="flex flex-wrap gap-4">
            <button class="btn-primary bg-white text-tech-blue hover:bg-bg-light">
              查看详情
            </button>
            <button class="btn-secondary">
              技术分析
            </button>
          </div>

          <!-- 性能标签 -->
          <div v-if="heroData" class="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8">
            <MetricCard
              v-for="(metric, index) in heroData.metrics"
              :key="index"
              :value="metric.value"
              :prefix="metric.prefix"
              :suffix="metric.suffix"
              :label="metric.label"
            />
          </div>
        </div>

        <!-- 右侧可视化元素 -->
        <div class="relative">
          <div class="bg-white/10 backdrop-blur-sm rounded-card p-8 border border-white/20">
            <!-- 模拟性能仪表盘 -->
            <div v-if="heroData" class="space-y-6">
              <div class="text-center">
                <div class="text-4xl font-bold mb-2">{{ heroData.dashboard.accuracy }}</div>
                <div class="text-sm text-white/80">准确率</div>
              </div>
              <div class="space-y-4">
                <div>
                  <div class="flex justify-between text-sm mb-2">
                    <span>{{ heroData.dashboard.speed.label }}</span>
                    <span>{{ heroData.dashboard.speed.value }}</span>
                  </div>
                  <div class="h-2 bg-white/20 rounded-full overflow-hidden">
                    <div
                      class="h-full bg-white rounded-full"
                      :style="`width: ${heroData.dashboard.speed.percentage}%`"
                    ></div>
                  </div>
                </div>
                <div>
                  <div class="flex justify-between text-sm mb-2">
                    <span>{{ heroData.dashboard.context.label }}</span>
                    <span>{{ heroData.dashboard.context.value }}</span>
                  </div>
                  <div class="h-2 bg-white/20 rounded-full overflow-hidden">
                    <div
                      class="h-full bg-white rounded-full"
                      :style="`width: ${heroData.dashboard.context.percentage}%`"
                    ></div>
                  </div>
                </div>
                <div>
                  <div class="flex justify-between text-sm mb-2">
                    <span>{{ heroData.dashboard.multimodal.label }}</span>
                    <span>{{ heroData.dashboard.multimodal.value }}</span>
                  </div>
                  <div class="h-2 bg-white/20 rounded-full overflow-hidden">
                    <div
                      class="h-full bg-white rounded-full"
                      :style="`width: ${heroData.dashboard.multimodal.percentage}%`"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import MetricCard from './MetricCard.vue'
import { getHero } from '../mocks/api'

import type { HeroData } from '../mocks/mock-data'

const heroData = ref<HeroData | null>(null)
const loading = ref(true)

const fetchHeroData = async () => {
  try {
    loading.value = true
    const response = await getHero()
    if (response.code === 200 && response.data) {
      heroData.value = response.data
    }
  } catch (error) {
    console.error('获取英雄区数据失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchHeroData()
})
</script>

