<template>
  <view class="page">
    <view class="container">
      <!-- Logo -->
      <view class="logo-section">
        <image class="logo" src="/static/logo.png" mode="aspectFit" />
        <text class="app-name">华玥AI</text>
        <text class="slogan">智能创作平台</text>
      </view>

      <!-- 登录表单 -->
      <view class="form-section">
        <view class="form-item">
          <text class="label">账号</text>
          <input
            class="input"
            v-model="formData.username"
            placeholder="请输入用户名"
            placeholder-class="placeholder"
          />
        </view>

        <view class="form-item">
          <text class="label">密码</text>
          <input
            class="input"
            v-model="formData.password"
            type="password"
            placeholder="请输入密码"
            placeholder-class="placeholder"
          />
        </view>

        <button class="login-btn" @click="handleLogin" :loading="loading">
          登录
        </button>

        <view class="actions">
          <text class="link" @click="goRegister">注册账号</text>
          <text class="link">忘记密码</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '../../stores/user'

const userStore = useUserStore()

const loading = ref(false)
const formData = ref({
  username: '',
  password: ''
})

// 登录
async function handleLogin() {
  if (!formData.value.username) {
    uni.showToast({
      title: '请输入用户名',
      icon: 'none'
    })
    return
  }

  if (!formData.value.password) {
    uni.showToast({
      title: '请输入密码',
      icon: 'none'
    })
    return
  }

  loading.value = true
  try {
    await userStore.login(formData.value)
    // 登录成功，跳转到首页
    uni.switchTab({
      url: '/pages/index/index'
    })
  } catch (error) {
    console.error('登录失败:', error)
  } finally {
    loading.value = false
  }
}

// 跳转注册页
function goRegister() {
  uni.navigateTo({
    url: '/pages/register/index'
  })
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.container {
  width: 100%;
  padding: 0 64rpx;
}

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 80rpx;
}

.logo {
  width: 160rpx;
  height: 160rpx;
  margin-bottom: 32rpx;
  background-color: #FFFFFF;
  border-radius: 80rpx;
}

.app-name {
  font-size: 48rpx;
  font-weight: 700;
  color: #FFFFFF;
  margin-bottom: 16rpx;
}

.slogan {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
}

.form-section {
  background-color: #FFFFFF;
  border-radius: 24rpx;
  padding: 48rpx 40rpx;
}

.form-item {
  margin-bottom: 32rpx;
}

.label {
  display: block;
  font-size: 28rpx;
  color: #1E293B;
  margin-bottom: 16rpx;
  font-weight: 500;
}

.input {
  width: 100%;
  height: 88rpx;
  padding: 0 24rpx;
  background-color: #F8FAFC;
  border-radius: 12rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.placeholder {
  color: #94A3B8;
}

.login-btn {
  width: 100%;
  height: 96rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12rpx;
  color: #FFFFFF;
  font-size: 32rpx;
  font-weight: 600;
  border: none;
  margin-top: 48rpx;
}

.login-btn:active {
  opacity: 0.9;
}

.actions {
  display: flex;
  justify-content: space-between;
  margin-top: 32rpx;
}

.link {
  font-size: 26rpx;
  color: #667eea;
}
</style>
