// import { post } from './request'
import { mockLogin, mockRegister, mockLogout, mockResponse } from './mock'

// 登录请求参数
export interface LoginRequest {
  username: string
  password: string
}

// 注册请求参数
export interface RegisterRequest {
  username: string
  password: string
  nickname?: string
  email?: string
  phone?: string
}

// 登录响应
export interface LoginResponse {
  token: string
  userInfo: {
    id: number
    username: string
    nickname: string
    avatar?: string
    email?: string
    phone?: string
  }
}

// 登录 - 使用 Mock 数据
export async function login(data: LoginRequest) {
  try {
    const response = await mockLogin(data)
    return mockResponse(response)
  } catch (error: any) {
    return mockResponse(null, 400, error.message || '登录失败')
  }
}

// 注册 - 使用 Mock 数据
export async function register(data: RegisterRequest) {
  try {
    await mockRegister(data)
    return mockResponse(null, 200, '注册成功')
  } catch (error: any) {
    return mockResponse(null, 400, error.message || '注册失败')
  }
}

// 退出登录 - 使用 Mock 数据
export async function logout() {
  try {
    await mockLogout()
    return mockResponse(null, 200, '退出成功')
  } catch (error: any) {
    return mockResponse(null, 400, error.message || '退出失败')
  }
}
