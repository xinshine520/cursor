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

    <view v-else class="asset-list">
      <view 
        v-for="item in assets" 
        :key="item.id" 
        class="asset-card"
        @click="viewDetail(item)"
      >
        <view class="thumbnail">
          <text class="emoji">{{ item.thumbnail }}</text>
          <view v-if="item.duration" class="duration">{{ formatDuration(item.duration) }}</view>
          <view :class="['status-badge', getStatusClass(item.status)]">
            {{ getStatusText(item.status) }}
          </view>
        </view>
        <view class="info">
          <text class="title">{{ item.title }}</text>
          <text v-if="item.description" class="desc">{{ item.description }}</text>
          <view class="stats">
            <text class="stat">👁️ {{ formatNumber(item.views) }}</text>
            <text class="stat">❤️ {{ formatNumber(item.likes) }}</text>
            <text class="stat">🔗 {{ formatNumber(item.shares) }}</text>
          </view>
          <text class="time">{{ item.createdAt }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Asset } from '../../api/mockData'
import { 
  getMockCreationAssets, 
  getMockBrandAssets, 
  getMockWorkAssets 
} from '../../api/mockMaterial'
import { formatDuration, formatNumber } from '../../api/mockData'

const currentTab = ref('creation')
const loading = ref(false)
const tabs = ref([
  { id: 'creation', name: '智能创作' },
  { id: 'brand', name: '品牌视频' },
  { id: 'work', name: '作品' }
])

const assets = ref<Asset[]>([])

// 加载资产数据
async function loadAssets() {
  loading.value = true
  try {
    let res
    switch (currentTab.value) {
      case 'creation':
        res = await getMockCreationAssets()
        break
      case 'brand':
        res = await getMockBrandAssets()
        break
      case 'work':
        res = await getMockWorkAssets()
        break
    }
    
    if (res.code === 200) {
      assets.value = res.data.list
    }
  } catch (error) {
    console.error('加载资产失败:', error)
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
  loadAssets()
}

// 获取状态文本
function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    'published': '已发布',
    'draft': '草稿',
    'processing': '处理中',
    'failed': '失败'
  }
  return statusMap[status] || status
}

// 获取状态样式类
function getStatusClass(status: string): string {
  return `status-${status}`
}

// 查看详情
function viewDetail(item: Asset) {
  const statsText = `
观看: ${formatNumber(item.views)}
点赞: ${formatNumber(item.likes)}
分享: ${formatNumber(item.shares)}
创建: ${item.createdAt}
${item.publishedAt ? '发布: ' + item.publishedAt : ''}
  `.trim()
  
  uni.showModal({
    title: item.title,
    content: item.description ? `${item.description}\n\n${statsText}` : statsText,
    showCancel: false
  })
}

onMounted(() => {
  loadAssets()
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

.asset-list {
  padding: 24rpx 32rpx;
}

.asset-card {
  background-color: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  display: flex;
  gap: 24rpx;
  transition: all 0.3s;
}

.asset-card:active {
  background-color: #F8FAFC;
  transform: scale(0.98);
}

.thumbnail {
  width: 200rpx;
  height: 200rpx;
  border-radius: 12rpx;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
}

.emoji {
  font-size: 100rpx;
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

.status-badge {
  position: absolute;
  top: 8rpx;
  left: 8rpx;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  font-size: 20rpx;
  font-weight: 600;
}

.status-published {
  background-color: #10B981;
  color: #FFFFFF;
}

.status-draft {
  background-color: #94A3B8;
  color: #FFFFFF;
}

.status-processing {
  background-color: #F59E0B;
  color: #FFFFFF;
}

.status-failed {
  background-color: #EF4444;
  color: #FFFFFF;
}

.info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  justify-content: space-between;
  min-width: 0;
}

.title {
  font-size: 28rpx;
  font-weight: 600;
  color: #1E293B;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.desc {
  font-size: 24rpx;
  color: #64748B;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.5;
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

.time {
  font-size: 22rpx;
  color: #94A3B8;
}
</style>
