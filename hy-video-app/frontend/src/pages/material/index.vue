<template>
  <view class="page">
    <view class="tabs">
      <view 
        v-for="tab in tabs" 
        :key="tab.id"
        :class="['tab-item', { active: currentTab === tab.id }]"
        @click="switchTab(tab.id)"
      >
        {{ tab.name }}
      </view>
    </view>

    <view v-if="loading" class="loading">
      <text>加载中...</text>
    </view>

    <view v-else class="material-list">
      <view 
        v-for="item in materials" 
        :key="item.id" 
        class="material-card"
        @click="viewDetail(item)"
      >
        <view class="thumbnail">
          <text class="emoji">{{ item.thumbnail }}</text>
          <view v-if="item.duration" class="duration">{{ formatDuration(item.duration) }}</view>
        </view>
        <view class="info">
          <text class="title">{{ item.title }}</text>
          <view class="tags">
            <text v-for="tag in item.tags" :key="tag" class="tag">{{ tag }}</text>
          </view>
          <view class="stats">
            <text class="stat">📥 {{ formatNumber(item.downloads) }}</text>
            <text class="stat">❤️ {{ formatNumber(item.likes) }}</text>
            <text class="stat">{{ formatFileSize(item.size) }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Material } from '../../api/mockData'
import { 
  getMockOfficialMaterials, 
  getMockPersonalMaterials, 
  getMockGeneratedMaterials 
} from '../../api/mockMaterial'
import { formatFileSize, formatDuration, formatNumber } from '../../api/mockData'

const currentTab = ref('official')
const loading = ref(false)
const tabs = ref([
  { id: 'official', name: '官方' },
  { id: 'personal', name: '个人' },
  { id: 'generated', name: '生成' }
])

const materials = ref<Material[]>([])

// 加载素材数据
async function loadMaterials() {
  loading.value = true
  try {
    let res
    switch (currentTab.value) {
      case 'official':
        res = await getMockOfficialMaterials()
        break
      case 'personal':
        res = await getMockPersonalMaterials()
        break
      case 'generated':
        res = await getMockGeneratedMaterials()
        break
    }
    
    if (res.code === 200) {
      materials.value = res.data.list
    }
  } catch (error) {
    console.error('加载素材失败:', error)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

// 切换标签
function switchTab(tabId: string) {
  currentTab.value = tabId
  loadMaterials()
}

// 查看详情
function viewDetail(item: Material) {
  uni.showModal({
    title: item.title,
    content: `类型: ${item.type}\n作者: ${item.author}\n标签: ${item.tags.join(', ')}\n创建时间: ${item.createdAt}`,
    showCancel: false
  })
}

onMounted(() => {
  loadMaterials()
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: #F8FAFC;
}

.tabs {
  display: flex;
  background-color: #FFFFFF;
  padding: 24rpx 32rpx;
  gap: 32rpx;
  position: sticky;
  top: 0;
  z-index: 10;
}

.tab-item {
  font-size: 28rpx;
  color: #64748B;
  padding-bottom: 12rpx;
  transition: all 0.3s;
  cursor: pointer;
}

.tab-item.active {
  color: #2563EB;
  font-weight: 600;
  border-bottom: 4rpx solid #2563EB;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 80rpx;
  color: #64748B;
  font-size: 28rpx;
}

.material-list {
  padding: 24rpx 32rpx;
}

.material-card {
  background-color: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  display: flex;
  gap: 24rpx;
  transition: all 0.3s;
}

.material-card:active {
  background-color: #F8FAFC;
  transform: scale(0.98);
}

.thumbnail {
  width: 160rpx;
  height: 160rpx;
  border-radius: 12rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.emoji {
  font-size: 80rpx;
}

.duration {
  position: absolute;
  bottom: 8rpx;
  right: 8rpx;
  background-color: rgba(0, 0, 0, 0.7);
  color: #FFFFFF;
  font-size: 20rpx;
  padding: 4rpx 8rpx;
  border-radius: 4rpx;
}

.info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  justify-content: space-between;
}

.title {
  font-size: 28rpx;
  font-weight: 600;
  color: #1E293B;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tags {
  display: flex;
  gap: 12rpx;
  flex-wrap: wrap;
}

.tag {
  font-size: 20rpx;
  color: #667eea;
  background-color: #EEF2FF;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}

.stats {
  display: flex;
  gap: 24rpx;
  font-size: 24rpx;
  color: #64748B;
}

.stat {
  display: flex;
  align-items: center;
  gap: 4rpx;
}
</style>
