<template>
  <section id="pricing" class="pt-32 pb-24 bg-white">
    <div class="container-custom">
      <div class="text-center mb-16">
        <h2 class="text-h2 mb-4">价格方案</h2>
        <p class="text-body text-neutral-gray max-w-2xl mx-auto">
          灵活的价格方案，满足不同规模的需求
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <div v-if="loading" class="col-span-full text-center py-12">
          <div class="text-body text-neutral-gray">加载中...</div>
        </div>
        <PricingCard
          v-else
          v-for="plan in pricingPlans"
          :key="plan.id"
          :plan="plan"
        />
      </div>

      <!-- 价格说明 -->
      <div class="mt-16 max-w-4xl mx-auto">
        <div class="bg-bg-light rounded-card p-8">
          <h3 class="text-h3 mb-6">价格说明</h3>
          <div class="space-y-4 text-body text-neutral-gray">
            <p>
              <strong class="text-text-dark">输入 Token：</strong>
              用户发送给模型的文本内容，按实际使用量计费。
            </p>
            <p>
              <strong class="text-text-dark">输出 Token：</strong>
              模型生成的文本内容，按实际使用量计费。
            </p>
            <p>
              <strong class="text-text-dark">计费方式：</strong>
              按实际使用的 Token 数量计费，不设最低消费。
            </p>
            <p>
              <strong class="text-text-dark">支付方式：</strong>
              支持支付宝、微信支付、企业转账等多种支付方式。
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import PricingCard from './PricingCard.vue'
import { getPricingPlans } from '../mocks/api'
import type { PricingPlan } from '../mocks/mock-data'

const pricingPlans = ref<PricingPlan[]>([])
const loading = ref(true)

const fetchPricingPlans = async () => {
  try {
    loading.value = true
    const response = await getPricingPlans()
    if (response.code === 200 && response.data) {
      pricingPlans.value = response.data
    }
  } catch (error) {
    console.error('获取价格方案失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchPricingPlans()
})
</script>

