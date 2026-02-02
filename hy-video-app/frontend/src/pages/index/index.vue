<template>
  <view class="page">
    <!-- 顶部搜索栏 -->
    <view class="search-bar">
      <view class="search-input">
        <text class="search-icon">🔍</text>
        <input type="text" placeholder="搜索AI工具" />
      </view>
    </view>

    <!-- AI工具网格 -->
    <view class="tools-section">
      <view class="section-title">AI创作工具</view>
      <view class="tools-grid">
        <view 
          v-for="tool in aiTools" 
          :key="tool.id" 
          class="tool-card"
        >
          <text class="tool-icon">{{ tool.icon }}</text>
          <text class="tool-name">{{ tool.name }}</text>
        </view>
      </view>
    </view>

    <!-- 快捷功能 -->
    <view class="quick-actions">
      <view class="section-title">快捷功能</view>
      <view class="action-list">
        <view 
          v-for="action in quickActions" 
          :key="action.id" 
          class="action-item"
        >
          <text class="action-icon">{{ action.icon }}</text>
          <view class="action-info">
            <text class="action-name">{{ action.name }}</text>
            <text class="action-desc">{{ action.desc }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const aiTools = ref([
  { id: 1, name: '账号对标', icon: '🎯' },
  { id: 2, name: '抖音爆款', icon: '🔥' },
  { id: 3, name: 'IP精灵', icon: '✨' },
  { id: 4, name: '文案提取', icon: '📝' },
  { id: 5, name: '选题生成', icon: '💡' },
  { id: 6, name: '文案生成', icon: '✍️' },
  { id: 7, name: '标题生成', icon: '📌' },
  { id: 8, name: '文案改写', icon: '🔄' },
  { id: 9, name: '朋友圈文案', icon: '👥' },
  { id: 10, name: '小红书文案', icon: '📕' },
  { id: 11, name: '视频创作', icon: '🎬' },
  { id: 12, name: '形象训练', icon: '👤' },
  { id: 13, name: '声音训练', icon: '🎤' }
])

const quickActions = ref([
  { id: 1, name: '创建视频', desc: '快速创建AI视频', icon: '🎥' },
  { id: 2, name: '智能剪辑', desc: '自动剪辑视频', icon: '✂️' },
  { id: 3, name: '数字人生成', desc: '创建虚拟数字人', icon: '🤖' }
])
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: #F8FAFC;
  padding-bottom: 100rpx;
}

.search-bar {
  padding: 24rpx 32rpx;
  background-color: #FFFFFF;
}

.search-input {
  display: flex;
  align-items: center;
  padding: 16rpx 24rpx;
  background-color: #F1F5F9;
  border-radius: 48rpx;
}

.search-icon {
  margin-right: 16rpx;
  font-size: 32rpx;
}

input {
  flex: 1;
  font-size: 28rpx;
  border: none;
  background-color: transparent;
}

.tools-section, .quick-actions {
  margin-top: 24rpx;
  padding: 24rpx 32rpx;
  background-color: #FFFFFF;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1E293B;
  margin-bottom: 24rpx;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24rpx;
}

.tool-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24rpx 16rpx;
  background-color: #F8FAFC;
  border-radius: 16rpx;
  transition: all 0.3s;
}

.tool-card:active {
  transform: scale(0.95);
  background-color: #EEF2FF;
}

.tool-icon {
  font-size: 48rpx;
  margin-bottom: 12rpx;
}

.tool-name {
  font-size: 24rpx;
  color: #475569;
  text-align: center;
}

.action-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.action-item {
  display: flex;
  align-items: center;
  padding: 24rpx;
  background-color: #F8FAFC;
  border-radius: 16rpx;
}

.action-icon {
  font-size: 48rpx;
  margin-right: 24rpx;
}

.action-info {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.action-name {
  font-size: 28rpx;
  font-weight: 500;
  color: #1E293B;
}

.action-desc {
  font-size: 24rpx;
  color: #64748B;
}
</style>
