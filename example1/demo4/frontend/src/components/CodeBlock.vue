<template>
  <div class="relative code-block group">
    <button
      @click="copyCode"
      class="absolute top-4 right-4 px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-sm transition-colors"
    >
      {{ copied ? '已复制' : '复制' }}
    </button>
    <pre class="overflow-x-auto"><code>{{ code }}</code></pre>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  code: string
  language?: string
}>()

const copied = ref(false)

const copyCode = async () => {
  const code = document.querySelector('.code-block code')?.textContent || ''
  await navigator.clipboard.writeText(code)
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2000)
}
</script>

