// import { get, put } from './request'
import { mockGetUserInfo, mockUpdateUserInfo, mockUpdatePassword, mockResponse } from './mock'

// 用户信息
export interface UserInfo {
  id: number
  username: string
  nickname: string
  avatar?: string
  email?: string
  phone?: string
  status?: number
  createdAt?: string
}

// 获取用户信息 - 使用 Mock 数据
export async function getUserInfo() {
  try {
    const token = uni.getStorageSync('token')
    const userInfo = await mockGetUserInfo(token)
    return mockResponse(userInfo)
  } catch (error: any) {
    return mockResponse(null, 401, error.message || '获取用户信息失败')
  }
}

// 更新用户信息 - 使用 Mock 数据
export async function updateUserInfo(data: Partial<UserInfo>) {
  try {
    const updatedInfo = await mockUpdateUserInfo(data)
    return mockResponse(updatedInfo)
  } catch (error: any) {
    return mockResponse(null, 400, error.message || '更新用户信息失败')
  }
}

// 修改密码 - 使用 Mock 数据
export async function updatePassword(data: { oldPassword: string; newPassword: string }) {
  try {
    await mockUpdatePassword(data.oldPassword, data.newPassword)
    return mockResponse(null, 200, '密码修改成功')
  } catch (error: any) {
    return mockResponse(null, 400, error.message || '密码修改失败')
  }
}
