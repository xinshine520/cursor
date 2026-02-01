<template>
  <div
    ref="cardRef"
    class="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:bg-white/20 hover:border-white/40 hover:shadow-card-hover"
    :class="{
      'opacity-0 translate-y-2': !isVisible,
      'opacity-100 translate-y-0': isVisible,
    }"
  >
    <div class="text-2xl font-bold">
      {{ displayText }}
    </div>
    <div class="text-sm text-white/80 mt-1">{{ label }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useScrollReveal } from '../composables/useScrollReveal'
import { useCounter } from '../composables/useCounter'

const props = defineProps<{
  value: number
  prefix?: string
  suffix?: string
  label: string
}>()

const { isVisible, elementRef: cardRef } = useScrollReveal()
const { count, animate } = useCounter(props.value)

// 对于 "第1名" 这种情况，不使用动画，直接显示
const useAnimation = computed(() => {
  return !(props.prefix === '第' && props.suffix === '名')
})

const displayText = computed(() => {
  if (!useAnimation.value) {
    return `${props.prefix || ''}${props.value}${props.suffix || ''}`
  }
  return `${props.prefix || ''}${count.value}${props.suffix || ''}`
})

watch(isVisible, (newVal) => {
  if (newVal && useAnimation.value) {
    animate()
  }
})

onMounted(() => {
  if (isVisible.value && useAnimation.value) {
    animate()
  }
})
</script>

