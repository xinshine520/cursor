<template>
  <view class="page">
    <!-- 用户信息 -->
    <view class="user-section" @click="handleUserClick">
      <image class="avatar" :src="userInfo?.avatar || '/static/logo.png'" />
      <view class="user-info">
        <text class="username">{{ userInfo?.nickname || '未登录' }}</text>
        <text class="user-id">{{ userInfo ? `ID: ${userInfo.id}` : '点击登录' }}</text>
      </view>
    </view>

    <!-- 功能列表 -->
    <view class="menu-section">
      <view class="menu-title">AI工具</view>
      <view class="menu-list">
        <view 
          v-for="tool in aiTools" 
          :key="tool.id" 
          class="menu-item"
          @click="handleMenuClick(tool)"
        >
          <text class="menu-icon">{{ tool.icon }}</text>
          <text class="menu-text">{{ tool.name }}</text>
          <text class="menu-arrow">›</text>
        </view>
      </view>
    </view>

    <view class="menu-section">
      <view class="menu-title">个人中心</view>
      <view class="menu-list">
        <view 
          v-for="item in personalMenu" 
          :key="item.id" 
          class="menu-item"
          @click="handleMenuClick(item)"
        >
          <text class="menu-icon">{{ item.icon }}</text>
          <text class="menu-text">{{ item.name }}</text>
          <text class="menu-arrow">›</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUserStore } from '../../stores/user'

const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)
const isLoggedIn = computed(() => userStore.isLoggedIn)

// 点击用户信息区域
function handleUserClick() {
  if (!isLoggedIn.value) {
    uni.navigateTo({
      url: '/pages/login/index'
    })
  }
}

// 点击菜单项
function handleMenuClick(item: any) {
  if (!isLoggedIn.value) {
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    })
    setTimeout(() => {
      uni.navigateTo({
        url: '/pages/login/index'
      })
    }, 1500)
    return
  }

  // 根据菜单项跳转
  if (item.name === '账号设置') {
    uni.navigateTo({
      url: '/pages/settings/index'
    })
  } else {
    uni.showToast({
      title: `${item.name}功能开发中`,
      icon: 'none'
    })
  }
}

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

const personalMenu = ref([
  { id: 1, name: '基本信息', icon: '👤' },
  { id: 2, name: '我的资产', icon: '💼' },
  { id: 3, name: '我的数字人', icon: '🤖' },
  { id: 4, name: '我的声音', icon: '🎤' },
  { id: 5, name: '授权视频', icon: '🎥' },
  { id: 6, name: '卡密兑换', icon: '🎁' },
  { id: 7, name: '账号设置', icon: '⚙️' }
])
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: #F8FAFC;
}

.user-section {
  display: flex;
  align-items: center;
  padding: 48rpx 32rpx;
  background: linear-gradient(135deg, #2563EB 0%, #06B6D4 100%);
  color: #FFFFFF;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  background-color: #FFFFFF;
  margin-right: 24rpx;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.username {
  font-size: 36rpx;
  font-weight: 600;
}

.user-id {
  font-size: 24rpx;
  opacity: 0.8;
}

.menu-section {
  margin-top: 24rpx;
  background-color: #FFFFFF;
  padding: 24rpx 0;
}

.menu-title {
  padding: 0 32rpx 16rpx;
  font-size: 28rpx;
  font-weight: 600;
  color: #64748B;
}

.menu-list {
  display: flex;
  flex-direction: column;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 24rpx 32rpx;
  border-bottom: 1rpx solid #F1F5F9;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-icon {
  font-size: 40rpx;
  margin-right: 24rpx;
}

.menu-text {
  flex: 1;
  font-size: 28rpx;
  color: #1E293B;
}

.menu-arrow {
  font-size: 48rpx;
  color: #CBD5E1;
  font-weight: 300;
}
</style>
