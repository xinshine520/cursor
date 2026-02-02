import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { LoginRequest, LoginResponse } from '../api/auth'
import type { UserInfo } from '../api/user'
import { login as loginApi, logout as logoutApi } from '../api/auth'
import { getUserInfo as getUserInfoApi } from '../api/user'

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref<string>('')
  const userInfo = ref<UserInfo | null>(null)
  const isLoggedIn = ref<boolean>(false)

  // 初始化：从本地存储读取
  function init() {
    const savedToken = uni.getStorageSync('token')
    const savedUserInfo = uni.getStorageSync('userInfo')
    
    if (savedToken) {
      token.value = savedToken
      isLoggedIn.value = true
    }
    
    if (savedUserInfo) {
      userInfo.value = savedUserInfo
    }
  }

  // 登录
  async function login(data: LoginRequest) {
    try {
      const res = await loginApi(data)
      
      // 保存 token 和用户信息
      token.value = res.data.token
      userInfo.value = res.data.userInfo
      isLoggedIn.value = true
      
      // 持久化到本地存储
      uni.setStorageSync('token', res.data.token)
      uni.setStorageSync('userInfo', res.data.userInfo)
      
      uni.showToast({
        title: '登录成功',
        icon: 'success'
      })
      
      return res
    } catch (error) {
      console.error('登录失败:', error)
      throw error
    }
  }

  // 退出登录
  async function logout() {
    try {
      await logoutApi()
    } catch (error) {
      console.error('退出登录失败:', error)
    } finally {
      // 清除状态
      token.value = ''
      userInfo.value = null
      isLoggedIn.value = false
      
      // 清除本地存储
      uni.removeStorageSync('token')
      uni.removeStorageSync('userInfo')
      
      uni.showToast({
        title: '已退出登录',
        icon: 'success'
      })
      
      // 跳转到登录页
      setTimeout(() => {
        uni.reLaunch({
          url: '/pages/login/index'
        })
      }, 1000)
    }
  }

  // 获取用户信息
  async function getUserInfo() {
    try {
      const res = await getUserInfoApi()
      userInfo.value = res.data
      uni.setStorageSync('userInfo', res.data)
      return res
    } catch (error) {
      console.error('获取用户信息失败:', error)
      throw error
    }
  }

  // 更新用户信息（本地）
  function updateUserInfo(data: Partial<UserInfo>) {
    if (userInfo.value) {
      userInfo.value = { ...userInfo.value, ...data }
      uni.setStorageSync('userInfo', userInfo.value)
    }
  }

  // 初始化
  init()

  return {
    token,
    userInfo,
    isLoggedIn,
    login,
    logout,
    getUserInfo,
    updateUserInfo
  }
})
