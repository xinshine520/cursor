<template>
  <section id="developers" class="py-24 bg-white">
    <div class="container-custom">
      <div class="text-center mb-16">
        <h2 class="text-h2 mb-4">性能基准测试</h2>
        <p class="text-body text-neutral-gray max-w-2xl mx-auto">
          基于MT-Bench和HumanEval评测结果
        </p>
      </div>

      <!-- 代码示例 -->
      <div class="mb-12">
        <CodeBlock
          :code="codeExample"
          language="typescript"
        />
      </div>

      <!-- 性能对比表格 -->
      <div v-if="loading" class="text-center py-12">
        <div class="text-body text-neutral-gray">加载中...</div>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-bg-light">
              <th class="px-6 py-4 text-left font-bold text-text-dark">模型</th>
              <th class="px-6 py-4 text-left font-bold text-text-dark">MT-Bench</th>
              <th class="px-6 py-4 text-left font-bold text-text-dark">HumanEval</th>
              <th class="px-6 py-4 text-left font-bold text-text-dark">推理速度</th>
              <th class="px-6 py-4 text-left font-bold text-text-dark">上下文长度</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, index) in performanceData"
              :key="index"
              :class="{
                'bg-bg-light': index % 2 === 1,
                'bg-tech-blue/5': row.isCurrent,
              }"
            >
              <td class="px-6 py-4 font-medium">{{ row.model }}</td>
              <td class="px-6 py-4">{{ row.mtBench }}</td>
              <td class="px-6 py-4">{{ row.humanEval }}</td>
              <td class="px-6 py-4">{{ row.speed }}</td>
              <td class="px-6 py-4">{{ row.context }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p class="text-small text-neutral-gray mt-6 text-center">
        * 评测结果仅供参考，实际表现可能有所不同。
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import CodeBlock from './CodeBlock.vue'
import { getPerformanceBenchmark } from '../mocks/api'

const codeExample = `import { HYAI } from '@hy-ai/sdk';

const client = new HYAI({
  apiKey: 'your-api-key',
});

const response = await client.chat.completions.create({
  model: 'hy-ai-4.6',
  messages: [
    { role: 'user', content: '你好，世界！' }
  ],
});

console.log(response.choices[0].message.content);
// 输出: "你好！我能为你做些什么？"`

interface PerformanceRow {
  model: string
  mtBench: string
  humanEval: string
  speed: string
  context: string
  isCurrent?: boolean
}

const performanceData = ref<PerformanceRow[]>([])
const loading = ref(true)

const fetchPerformanceData = async () => {
  try {
    loading.value = true
    const response = await getPerformanceBenchmark()
    if (response.code === 200 && response.data) {
      performanceData.value = response.data.map((item) => ({
        model: item.model,
        mtBench: String(item.mtBench),
        humanEval: `${item.humanEval}%`,
        speed: item.speed,
        context: item.context,
        isCurrent: item.isCurrent,
      }))
    }
  } catch (error) {
    console.error('获取性能数据失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchPerformanceData()
})
</script>

