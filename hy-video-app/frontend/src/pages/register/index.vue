<template>
  <view class="page">
    <view class="container">
      <!-- Logo -->
      <view class="logo-section">
        <image class="logo" src="/static/logo.png" mode="aspectFit" />
        <text class="app-name">注册账号</text>
      </view>

      <!-- 注册表单 -->
      <view class="form-section">
        <view class="form-item">
          <text class="label">用户名</text>
          <input
            class="input"
            v-model="formData.username"
            placeholder="请输入用户名（3-20个字符）"
            placeholder-class="placeholder"
          />
        </view>

        <view class="form-item">
          <text class="label">密码</text>
          <input
            class="input"
            v-model="formData.password"
            type="password"
            placeholder="请输入密码（6-20个字符）"
            placeholder-class="placeholder"
          />
        </view>

        <view class="form-item">
          <text class="label">确认密码</text>
          <input
            class="input"
            v-model="confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            placeholder-class="placeholder"
          />
        </view>

        <view class="form-item">
          <text class="label">昵称（可选）</text>
          <input
            class="input"
            v-model="formData.nickname"
            placeholder="请输入昵称"
            placeholder-class="placeholder"
          />
        </view>

        <button class="register-btn" @click="handleRegister" :loading="loading">
          注册
        </button>

        <view class="actions">
          <text class="link" @click="goLogin">已有账号？去登录</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { register } from '../../api/auth'

const loading = ref(false)
const formData = ref({
  username: '',
  password: '',
  nickname: ''
})
const confirmPassword = ref('')

// 注册
async function handleRegister() {
  // 验证
  if (!formData.value.username) {
    uni.showToast({ title: '请输入用户名', icon: 'none' })
    return
  }
  
  if (formData.value.username.length < 3 || formData.value.username.length > 20) {
    uni.showToast({ title: '用户名长度必须在3-20个字符', icon: 'none' })
    return
  }

  if (!formData.value.password) {
    uni.showToast({ title: '请输入密码', icon: 'none' })
    return
  }
  
  if (formData.value.password.length < 6 || formData.value.password.length > 20) {
    uni.showToast({ title: '密码长度必须在6-20个字符', icon: 'none' })
    return
  }

  if (formData.value.password !== confirmPassword.value) {
    uni.showToast({ title: '两次密码不一致', icon: 'none' })
    return
  }

  loading.value = true
  try {
    await register(formData.value)
    uni.showToast({
      title: '注册成功',
      icon: 'success'
    })
    // 注册成功，跳转到登录页
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (error) {
    console.error('注册失败:', error)
  } finally {
    loading.value = false
  }
}

// 返回登录页
function goLogin() {
  uni.navigateBack()
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 48rpx 0;
}

.container {
  width: 100%;
  padding: 0 64rpx;
}

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 64rpx;
}

.logo {
  width: 120rpx;
  height: 120rpx;
  margin-bottom: 24rpx;
  background-color: #FFFFFF;
  border-radius: 60rpx;
}

.app-name {
  font-size: 40rpx;
  font-weight: 700;
  color: #FFFFFF;
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

.register-btn {
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

.register-btn:active {
  opacity: 0.9;
}

.actions {
  display: flex;
  justify-content: center;
  margin-top: 32rpx;
}

.link {
  font-size: 26rpx;
  color: #667eea;
}
</style>
