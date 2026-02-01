<template>
  <section class="pt-32 pb-24 bg-white">
    <div class="container-custom">
      <!-- 加载状态 -->
      <div v-if="loading" class="text-center py-24">
        <div class="text-body text-neutral-gray">加载中...</div>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="text-center py-24">
        <div class="text-h3 mb-4 text-text-dark">产品未找到</div>
        <p class="text-body text-neutral-gray mb-8">
          抱歉，找不到您要查看的产品。
        </p>
        <router-link to="/" class="btn-primary">
          返回首页
        </router-link>
      </div>

      <!-- 产品详情 -->
      <div v-else-if="productDetail" class="max-w-4xl mx-auto">
        <!-- 返回按钮 -->
        <router-link
          to="/"
          class="inline-flex items-center gap-2 text-tech-blue hover:text-tech-blue-dark transition-colors mb-8"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span>返回产品列表</span>
        </router-link>

        <!-- 产品头部信息 -->
        <div class="mb-12">
          <div class="flex items-start gap-4 mb-6">
            <span class="text-6xl">{{ productDetail.icon }}</span>
            <div class="flex-1">
              <div class="flex items-center gap-4 mb-2">
                <h1 class="text-h1">{{ productDetail.name }}</h1>
                <span
                  class="px-4 py-1 rounded-full text-sm font-bold"
                  :class="{
                    'bg-success-green/20 text-success-green': productDetail.badge === 'SOTA',
                    'bg-tech-blue/20 text-tech-blue': productDetail.badge === 'No.1',
                    'bg-warning-orange/20 text-warning-orange': productDetail.badge === 'Beta',
                  }"
                >
                  {{ productDetail.badge }}
                </span>
              </div>
              <p class="text-body text-neutral-gray mb-4">
                {{ productDetail.version }} · {{ productDetail.description }}
              </p>
              <!-- 技术标签 -->
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="tag in productDetail.tags"
                  :key="tag"
                  class="px-3 py-1 bg-bg-light text-small text-neutral-gray rounded"
                >
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 性能指标卡片 -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div class="card text-center">
            <div class="text-3xl font-bold text-tech-blue mb-2">
              {{ productDetail.metrics.speed }}
            </div>
            <div class="text-small text-neutral-gray">推理速度</div>
          </div>
          <div class="card text-center">
            <div class="text-3xl font-bold text-tech-blue mb-2">
              {{ productDetail.metrics.context }}
            </div>
            <div class="text-small text-neutral-gray">上下文长度</div>
          </div>
          <div class="card text-center">
            <div class="text-3xl font-bold text-tech-blue mb-2">
              {{ productDetail.metrics.accuracy }}
            </div>
            <div class="text-small text-neutral-gray">准确率</div>
          </div>
        </div>

        <!-- 详细信息 -->
        <div class="space-y-8">
          <!-- 技术规格 -->
          <div class="card">
            <h2 class="text-h2 mb-6">技术规格</h2>
            <div class="space-y-4">
              <div class="flex justify-between py-3 border-b border-bg-light">
                <span class="text-body text-neutral-gray">参数量</span>
                <span class="text-body font-medium text-text-dark">
                  {{ productDetail.parameters }}
                </span>
              </div>
              <div class="flex justify-between py-3 border-b border-bg-light">
                <span class="text-body text-neutral-gray">架构</span>
                <span class="text-body font-medium text-text-dark">
                  {{ productDetail.architecture }}
                </span>
              </div>
              <div class="flex justify-between py-3 border-b border-bg-light">
                <span class="text-body text-neutral-gray">推理速度</span>
                <span class="text-body font-medium text-text-dark">
                  {{ productDetail.metrics.speed }}
                </span>
              </div>
              <div class="flex justify-between py-3 border-b border-bg-light">
                <span class="text-body text-neutral-gray">上下文长度</span>
                <span class="text-body font-medium text-text-dark">
                  {{ productDetail.metrics.context }}
                </span>
              </div>
              <div class="flex justify-between py-3">
                <span class="text-body text-neutral-gray">准确率</span>
                <span class="text-body font-medium text-text-dark">
                  {{ productDetail.metrics.accuracy }}
                </span>
              </div>
            </div>
          </div>

          <!-- 性能评测 -->
          <div class="card">
            <h2 class="text-h2 mb-6">性能评测</h2>
            <div class="space-y-4">
              <div class="flex justify-between py-3 border-b border-bg-light">
                <span class="text-body text-neutral-gray">MT-Bench</span>
                <span class="text-body font-medium text-text-dark">
                  {{ productDetail.benchmark.mtBench }}
                </span>
              </div>
              <div class="flex justify-between py-3 border-b border-bg-light">
                <span class="text-body text-neutral-gray">HumanEval</span>
                <span class="text-body font-medium text-text-dark">
                  {{ productDetail.benchmark.humanEval }}%
                </span>
              </div>
              <div class="flex justify-between py-3">
                <span class="text-body text-neutral-gray">MMLU</span>
                <span class="text-body font-medium text-text-dark">
                  {{ productDetail.benchmark.mmlu }}%
                </span>
              </div>
            </div>
            <p class="text-small text-neutral-gray mt-6">
              * 评测结果仅供参考，实际表现可能有所不同。
            </p>
          </div>

          <!-- 价格信息 -->
          <div class="card">
            <h2 class="text-h2 mb-6">价格信息</h2>
            <div class="space-y-4">
              <div class="flex justify-between py-3 border-b border-bg-light">
                <span class="text-body text-neutral-gray">输入 Token</span>
                <span class="text-body font-medium text-text-dark">
                  {{ productDetail.pricing.input }}
                </span>
              </div>
              <div class="flex justify-between py-3">
                <span class="text-body text-neutral-gray">输出 Token</span>
                <span class="text-body font-medium text-text-dark">
                  {{ productDetail.pricing.output }}
                </span>
              </div>
            </div>
            <div class="mt-6">
              <router-link to="/pricing" class="btn-primary inline-block">
                查看完整价格方案
              </router-link>
            </div>
          </div>

          <!-- CTA 按钮 -->
          <div class="flex flex-wrap gap-4">
            <button class="btn-primary flex-1 md:flex-none">
              开始使用
            </button>
            <button class="btn-secondary flex-1 md:flex-none">
              查看文档
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { ModelDetail } from '../types'
import { getModelDetail } from '../mocks/api'

const props = defineProps<{
  productId: number
}>()

const productDetail = ref<ModelDetail | null>(null)
const loading = ref(true)
const error = ref(false)

const fetchProductDetail = async () => {
  try {
    loading.value = true
    error.value = false
    const response = await getModelDetail(props.productId)
    if (response.code === 200 && response.data) {
      productDetail.value = response.data
    } else {
      error.value = true
    }
  } catch (err) {
    console.error('获取产品详情失败:', err)
    error.value = true
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchProductDetail()
})
</script>

