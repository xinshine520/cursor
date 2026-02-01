<template>
  <div class="min-h-screen">
    <Navbar />
    
    <!-- Hero 区域 -->
    <section class="pt-32 pb-20 bg-deep-space text-white">
      <div class="container-custom">
        <div
          ref="heroRef"
          class="text-center max-w-4xl mx-auto"
          :class="{
            'opacity-0 translate-y-8': !heroVisible,
            'opacity-100 translate-y-0': heroVisible,
          }"
          style="transition: opacity 0.8s ease-out, transform 0.8s ease-out;"
        >
          <h1 class="text-h1 mb-6">{{ data?.hero.title }}</h1>
          <p class="text-xl mb-4 text-gray-300">{{ data?.hero.subtitle }}</p>
          <p class="text-body text-gray-400 mb-8 max-w-2xl mx-auto">
            {{ data?.hero.description }}
          </p>
          <button class="btn-primary bg-white text-deep-space hover:bg-gray-100">
            {{ data?.hero.ctaText }}
          </button>
        </div>
      </div>
    </section>

    <!-- 功能特性区域 -->
    <section class="py-24 bg-white">
      <div class="container-custom">
        <div
          ref="featuresTitleRef"
          class="text-center mb-16"
          :class="{
            'opacity-0 translate-y-8': !featuresTitleVisible,
            'opacity-100 translate-y-0': featuresTitleVisible,
          }"
          style="transition: opacity 0.8s ease-out, transform 0.8s ease-out;"
        >
          <h2 class="text-h2 mb-4 text-text-dark">核心功能特性</h2>
          <p class="text-body text-neutral-gray max-w-2xl mx-auto">
            强大的定制化能力，满足不同业务场景需求
          </p>
        </div>

        <div v-if="loading" class="text-center py-12">
          <div class="text-body text-neutral-gray">加载中...</div>
        </div>
        <div
          v-else
          ref="featuresRef"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          :class="{
            'opacity-0 translate-y-8': !featuresVisible,
            'opacity-100 translate-y-0': featuresVisible,
          }"
          style="transition: opacity 0.8s ease-out, transform 0.8s ease-out; transition-delay: 0.2s;"
        >
          <div
            v-for="feature in data?.features"
            :key="feature.id"
            class="card"
          >
            <div class="text-4xl mb-4">{{ feature.icon }}</div>
            <h3 class="text-h3 mb-3 text-text-dark">{{ feature.title }}</h3>
            <p class="text-body text-neutral-gray">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 使用场景区域 -->
    <section class="py-24 bg-bg-light">
      <div class="container-custom">
        <div
          ref="scenariosTitleRef"
          class="text-center mb-16"
          :class="{
            'opacity-0 translate-y-8': !scenariosTitleVisible,
            'opacity-100 translate-y-0': scenariosTitleVisible,
          }"
          style="transition: opacity 0.8s ease-out, transform 0.8s ease-out;"
        >
          <h2 class="text-h2 mb-4 text-text-dark">应用场景</h2>
          <p class="text-body text-neutral-gray max-w-2xl mx-auto">
            覆盖多个行业和业务场景，助力企业数字化转型
          </p>
        </div>

        <div
          v-if="!loading"
          ref="scenariosRef"
          class="grid grid-cols-1 md:grid-cols-2 gap-8"
          :class="{
            'opacity-0 translate-y-8': !scenariosVisible,
            'opacity-100 translate-y-0': scenariosVisible,
          }"
          style="transition: opacity 0.8s ease-out, transform 0.8s ease-out; transition-delay: 0.2s;"
        >
          <div
            v-for="scenario in data?.scenarios"
            :key="scenario.id"
            class="card"
          >
            <div class="flex items-start gap-4 mb-4">
              <div class="text-4xl">{{ scenario.icon }}</div>
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <h3 class="text-h3 text-text-dark">{{ scenario.name }}</h3>
                  <span class="px-3 py-1 bg-tech-blue/10 text-tech-blue text-sm rounded-full">
                    {{ scenario.industry }}
                  </span>
                </div>
                <p class="text-body text-neutral-gray mb-4">{{ scenario.description }}</p>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="example in scenario.examples"
                    :key="example"
                    class="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full"
                  >
                    {{ example }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 定制流程区域 -->
    <section class="py-24 bg-white">
      <div class="container-custom">
        <div
          ref="processTitleRef"
          class="text-center mb-16"
          :class="{
            'opacity-0 translate-y-8': !processTitleVisible,
            'opacity-100 translate-y-0': processTitleVisible,
          }"
          style="transition: opacity 0.8s ease-out, transform 0.8s ease-out;"
        >
          <h2 class="text-h2 mb-4 text-text-dark">定制流程</h2>
          <p class="text-body text-neutral-gray max-w-2xl mx-auto">
            从需求分析到部署上线，全程专业服务
          </p>
        </div>

        <div
          v-if="!loading"
          ref="processRef"
          class="max-w-4xl mx-auto"
          :class="{
            'opacity-0 translate-y-8': !processVisible,
            'opacity-100 translate-y-0': processVisible,
          }"
          style="transition: opacity 0.8s ease-out, transform 0.8s ease-out; transition-delay: 0.2s;"
        >
          <div class="relative">
            <!-- 连接线 -->
            <div class="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 hidden md:block"></div>
            
            <div
              v-for="step in data?.process"
              :key="step.id"
              class="relative flex items-start gap-6 mb-8 last:mb-0"
            >
              <!-- 步骤编号 -->
              <div class="flex-shrink-0 w-16 h-16 bg-tech-blue text-white rounded-full flex items-center justify-center text-2xl font-bold relative z-10">
                {{ step.step }}
              </div>
              
              <!-- 步骤内容 -->
              <div class="flex-1 pt-2">
                <h3 class="text-h3 mb-2 text-text-dark">{{ step.title }}</h3>
                <p class="text-body text-neutral-gray">{{ step.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 技术优势区域 -->
    <section class="py-24 bg-bg-light">
      <div class="container-custom">
        <div
          ref="advantagesTitleRef"
          class="text-center mb-16"
          :class="{
            'opacity-0 translate-y-8': !advantagesTitleVisible,
            'opacity-100 translate-y-0': advantagesTitleVisible,
          }"
          style="transition: opacity 0.8s ease-out, transform 0.8s ease-out;"
        >
          <h2 class="text-h2 mb-4 text-text-dark">技术优势</h2>
          <p class="text-body text-neutral-gray max-w-2xl mx-auto">
            基于先进技术，提供卓越的服务体验
          </p>
        </div>

        <div
          v-if="!loading"
          ref="advantagesRef"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          :class="{
            'opacity-0 translate-y-8': !advantagesVisible,
            'opacity-100 translate-y-0': advantagesVisible,
          }"
          style="transition: opacity 0.8s ease-out, transform 0.8s ease-out; transition-delay: 0.2s;"
        >
          <div
            v-for="advantage in data?.advantages"
            :key="advantage.id"
            class="card text-center"
          >
            <h3 class="text-h3 mb-3 text-text-dark">{{ advantage.title }}</h3>
            <p class="text-body text-neutral-gray">{{ advantage.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 行动号召区域 -->
    <section class="py-24 bg-deep-space text-white">
      <div class="container-custom">
        <div
          ref="ctaRef"
          class="text-center max-w-3xl mx-auto"
          :class="{
            'opacity-0 translate-y-8': !ctaVisible,
            'opacity-100 translate-y-0': ctaVisible,
          }"
          style="transition: opacity 0.8s ease-out, transform 0.8s ease-out;"
        >
          <h2 class="text-h2 mb-6">开始您的 AI Agent 定制之旅</h2>
          <p class="text-body text-gray-300 mb-8">
            联系我们的专业团队，为您量身定制专属 AI Agent 解决方案
          </p>
          <button class="btn-primary bg-white text-deep-space hover:bg-gray-100">
            联系销售
          </button>
        </div>
      </div>
    </section>

    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getAiAgentCustomizationData } from '../mocks/api'
import type { AiAgentCustomizationData } from '../types'
import Navbar from '../components/Navbar.vue'
import Footer from '../components/Footer.vue'
import { useScrollReveal } from '../composables/useScrollReveal'

const data = ref<AiAgentCustomizationData | null>(null)
const loading = ref(true)

// 滚动显示动画
const {
  isVisible: heroVisible,
  elementRef: heroRef,
} = useScrollReveal()

const {
  isVisible: featuresTitleVisible,
  elementRef: featuresTitleRef,
} = useScrollReveal()

const {
  isVisible: featuresVisible,
  elementRef: featuresRef,
} = useScrollReveal()

const {
  isVisible: scenariosTitleVisible,
  elementRef: scenariosTitleRef,
} = useScrollReveal()

const {
  isVisible: scenariosVisible,
  elementRef: scenariosRef,
} = useScrollReveal()

const {
  isVisible: processTitleVisible,
  elementRef: processTitleRef,
} = useScrollReveal()

const {
  isVisible: processVisible,
  elementRef: processRef,
} = useScrollReveal()

const {
  isVisible: advantagesTitleVisible,
  elementRef: advantagesTitleRef,
} = useScrollReveal()

const {
  isVisible: advantagesVisible,
  elementRef: advantagesRef,
} = useScrollReveal()

const {
  isVisible: ctaVisible,
  elementRef: ctaRef,
} = useScrollReveal()

const fetchData = async () => {
  try {
    loading.value = true
    const response = await getAiAgentCustomizationData()
    if (response.code === 200 && response.data) {
      data.value = response.data
    }
  } catch (error) {
    console.error('获取 AI Agent 定制化数据失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

