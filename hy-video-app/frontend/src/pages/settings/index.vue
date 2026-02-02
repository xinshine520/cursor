<template>
  <view class="page">
    <!-- 基本信息 -->
    <view class="section">
      <view class="section-title">基本信息</view>
      <view class="info-list">
        <view class="info-item" @click="showNicknameDialog">
          <text class="label">昵称</text>
          <view class="value-box">
            <text class="value">{{ userInfo?.nickname || '未设置' }}</text>
            <text class="arrow">›</text>
          </view>
        </view>
        
        <view class="info-item">
          <text class="label">用户名</text>
          <view class="value-box">
            <text class="value readonly">{{ userInfo?.username }}</text>
          </view>
        </view>
        
        <view class="info-item" @click="showEmailDialog">
          <text class="label">邮箱</text>
          <view class="value-box">
            <text class="value">{{ userInfo?.email || '未设置' }}</text>
            <text class="arrow">›</text>
          </view>
        </view>
        
        <view class="info-item" @click="showPhoneDialog">
          <text class="label">手机号</text>
          <view class="value-box">
            <text class="value">{{ userInfo?.phone || '未设置' }}</text>
            <text class="arrow">›</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 安全设置 -->
    <view class="section">
      <view class="section-title">安全设置</view>
      <view class="info-list">
        <view class="info-item" @click="goChangePassword">
          <text class="label">修改密码</text>
          <view class="value-box">
            <text class="arrow">›</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 退出登录 -->
    <view class="section">
      <button class="logout-btn" @click="handleLogout">退出登录</button>
    </view>

    <!-- 修改昵称弹窗 -->
    <uni-popup ref="nicknamePopup" type="dialog">
      <view class="dialog">
        <view class="dialog-title">修改昵称</view>
        <input
          class="dialog-input"
          v-model="nickname"
          placeholder="请输入昵称"
        />
        <view class="dialog-actions">
          <button class="dialog-btn cancel" @click="closeNicknameDialog">取消</button>
          <button class="dialog-btn confirm" @click="updateNickname">确定</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUserStore } from '../../stores/user'
import { updateUserInfo } from '../../api/user'

const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)

const nicknamePopup = ref<any>(null)
const nickname = ref('')

// 显示修改昵称弹窗
function showNicknameDialog() {
  nickname.value = userInfo.value?.nickname || ''
  // 注意：uni-popup 需要安装 @dcloudio/uni-ui
  // 这里使用简单的实现
  uni.showModal({
    title: '修改昵称',
    editable: true,
    placeholderText: '请输入昵称',
    content: userInfo.value?.nickname || '',
    success: async (res) => {
      if (res.confirm && res.content) {
        await updateNickname(res.content)
      }
    }
  })
}

function closeNicknameDialog() {
  nicknamePopup.value?.close()
}

// 更新昵称
async function updateNickname(newNickname?: string) {
  const value = newNickname || nickname.value
  if (!value) {
    uni.showToast({ title: '昵称不能为空', icon: 'none' })
    return
  }

  try {
    await updateUserInfo({ nickname: value })
    userStore.updateUserInfo({ nickname: value })
    uni.showToast({ title: '修改成功', icon: 'success' })
    closeNicknameDialog()
  } catch (error) {
    console.error('修改昵称失败:', error)
  }
}

// 修改邮箱
function showEmailDialog() {
  uni.showModal({
    title: '修改邮箱',
    editable: true,
    placeholderText: '请输入邮箱',
    content: userInfo.value?.email || '',
    success: async (res) => {
      if (res.confirm && res.content) {
        try {
          await updateUserInfo({ email: res.content })
          userStore.updateUserInfo({ email: res.content })
          uni.showToast({ title: '修改成功', icon: 'success' })
        } catch (error) {
          console.error('修改邮箱失败:', error)
        }
      }
    }
  })
}

// 修改手机号
function showPhoneDialog() {
  uni.showModal({
    title: '修改手机号',
    editable: true,
    placeholderText: '请输入手机号',
    content: userInfo.value?.phone || '',
    success: async (res) => {
      if (res.confirm && res.content) {
        try {
          await updateUserInfo({ phone: res.content })
          userStore.updateUserInfo({ phone: res.content })
          uni.showToast({ title: '修改成功', icon: 'success' })
        } catch (error) {
          console.error('修改手机号失败:', error)
        }
      }
    }
  })
}

// 跳转修改密码页面
function goChangePassword() {
  uni.navigateTo({
    url: '/pages/change-password/index'
  })
}

// 退出登录
function handleLogout() {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: async (res) => {
      if (res.confirm) {
        await userStore.logout()
      }
    }
  })
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: #F8FAFC;
  padding-bottom: 48rpx;
}

.section {
  margin-top: 24rpx;
  background-color: #FFFFFF;
  padding: 0 32rpx;
}

.section-title {
  padding: 32rpx 0 16rpx;
  font-size: 28rpx;
  font-weight: 600;
  color: #64748B;
}

.info-list {
  border-top: 1rpx solid #F1F5F9;
}

.info-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx 0;
  border-bottom: 1rpx solid #F1F5F9;
}

.info-item:last-child {
  border-bottom: none;
}

.label {
  font-size: 28rpx;
  color: #1E293B;
}

.value-box {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.value {
  font-size: 28rpx;
  color: #64748B;
}

.value.readonly {
  color: #94A3B8;
}

.arrow {
  font-size: 48rpx;
  color: #CBD5E1;
  font-weight: 300;
}

.logout-btn {
  width: 100%;
  height: 88rpx;
  margin-top: 48rpx;
  background-color: #FFFFFF;
  border: 1rpx solid #F87171;
  border-radius: 12rpx;
  color: #F87171;
  font-size: 28rpx;
}

.logout-btn:active {
  background-color: #FEF2F2;
}

.dialog {
  background-color: #FFFFFF;
  border-radius: 16rpx;
  padding: 48rpx 32rpx;
  width: 560rpx;
}

.dialog-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1E293B;
  margin-bottom: 32rpx;
  text-align: center;
}

.dialog-input {
  width: 100%;
  height: 88rpx;
  padding: 0 24rpx;
  background-color: #F8FAFC;
  border-radius: 12rpx;
  font-size: 28rpx;
  box-sizing: border-box;
  margin-bottom: 32rpx;
}

.dialog-actions {
  display: flex;
  gap: 24rpx;
}

.dialog-btn {
  flex: 1;
  height: 88rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  border: none;
}

.dialog-btn.cancel {
  background-color: #F1F5F9;
  color: #64748B;
}

.dialog-btn.confirm {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #FFFFFF;
}
</style>
