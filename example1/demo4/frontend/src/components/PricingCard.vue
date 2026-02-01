<template>
  <div
    class="card relative flex flex-col"
    :class="{
      'ring-2 ring-tech-blue': plan.popular,
    }"
  >
    <!-- 热门标签 -->
    <div
      v-if="plan.popular"
      class="absolute -top-4 left-1/2 transform -translate-x-1/2"
    >
      <span class="bg-tech-blue text-white px-4 py-1 rounded-full text-small font-bold">
        推荐
      </span>
    </div>

    <div class="flex flex-col h-full">
      <div class="flex-1 space-y-6">
        <!-- 方案名称和描述 -->
        <div>
          <h3 class="text-h3 mb-2">{{ plan.name }}</h3>
          <p class="text-body text-neutral-gray">{{ plan.description }}</p>
        </div>

        <!-- 价格 -->
        <div class="border-b border-bg-light pb-6">
          <div class="flex items-baseline gap-2">
            <span
              v-if="plan.price !== '定制'"
              class="text-4xl font-bold text-text-dark"
            >
              ¥{{ plan.price }}
            </span>
            <span
              v-else
              class="text-4xl font-bold text-text-dark"
            >
              {{ plan.price }}
            </span>
            <span
              v-if="plan.priceUnit"
              class="text-body text-neutral-gray"
            >
              {{ plan.priceUnit }}
            </span>
          </div>
          <div class="mt-4 space-y-2 text-small">
            <div class="text-neutral-gray">{{ plan.inputPrice }}</div>
            <div class="text-neutral-gray">{{ plan.outputPrice }}</div>
          </div>
        </div>

        <!-- 功能列表 -->
        <ul class="space-y-3">
          <li
            v-for="feature in plan.features"
            :key="feature"
            class="flex items-start gap-2"
          >
            <svg
              class="w-5 h-5 text-success-green flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span class="text-body text-text-dark">{{ feature }}</span>
          </li>
        </ul>
      </div>

      <!-- CTA 按钮 - 固定在底部 -->
      <div class="mt-auto pt-6">
        <button class="w-full btn-primary">
          查看介绍
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface PricingPlan {
  id: number
  name: string
  description: string
  price: string
  priceUnit: string
  features: string[]
  popular?: boolean
  inputPrice: string
  outputPrice: string
}

defineProps<{
  plan: PricingPlan
}>()
</script>

