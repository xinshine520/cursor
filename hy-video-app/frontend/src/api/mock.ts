// Mock API 数据服务
// 模拟后端接口，用于前端开发和测试

import type { LoginRequest, LoginResponse, RegisterRequest } from './auth'
import type { UserInfo } from './user'

// 模拟延迟
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms))

// Mock 用户数据库
const mockUsers = [
  {
    id: 1,
    username: 'admin',
    password: '111111',
    nickname: '系统管理员',
    avatar: '',
    phone: '13800138000',
    email: 'admin@hyai.com',
    status: 1
  },
  {
    id: 2,
    username: 'user001',
    password: '123456',
    nickname: '张三',
    avatar: '',
    phone: '13800138001',
    email: 'zhangsan@example.com',
    status: 1
  },
  {
    id: 3,
    username: 'user002',
    password: '123456',
    nickname: '李四',
    avatar: '',
    phone: '13800138002',
    email: 'lisi@example.com',
    status: 1
  }
]

// Mock Token 存储
let mockTokenCounter = 1000

/**
 * Mock 登录
 */
export async function mockLogin(data: LoginRequest): Promise<LoginResponse> {
  await delay(800) // 模拟网络延迟

  // 查找用户
  const user = mockUsers.find(u => u.username === data.username)

  // 用户不存在
  if (!user) {
    throw new Error('用户名或密码错误')
  }

  // 密码错误
  if (user.password !== data.password) {
    throw new Error('用户名或密码错误')
  }

  // 账号被禁用
  if (user.status !== 1) {
    throw new Error('账号已被禁用')
  }

  // 生成 Token
  const token = `mock-token-${mockTokenCounter++}-${Date.now()}`

  // 返回登录响应
  return {
    token,
    userInfo: {
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      avatar: user.avatar,
      phone: user.phone,
      email: user.email,
      status: user.status
    }
  }
}

/**
 * Mock 注册
 */
export async function mockRegister(data: RegisterRequest): Promise<void> {
  await delay(800)

  // 检查用户名是否已存在
  const existingUser = mockUsers.find(u => u.username === data.username)
  if (existingUser) {
    throw new Error('用户名已存在')
  }

  // 添加新用户
  const newUser = {
    id: mockUsers.length + 1,
    username: data.username,
    password: data.password,
    nickname: data.nickname || data.username,
    avatar: '',
    phone: '',
    email: '',
    status: 1
  }

  mockUsers.push(newUser)
}

/**
 * Mock 退出登录
 */
export async function mockLogout(): Promise<void> {
  await delay(300)
  // Mock 退出，实际只需清除本地存储
}

/**
 * Mock 获取用户信息
 */
export async function mockGetUserInfo(token: string): Promise<UserInfo> {
  await delay(500)

  // 简单验证 token
  if (!token || !token.startsWith('mock-token-')) {
    throw new Error('Token 无效')
  }

  // 返回第一个用户信息（简化处理）
  const user = mockUsers[0]
  return {
    id: user.id,
    username: user.username,
    nickname: user.nickname,
    avatar: user.avatar,
    phone: user.phone,
    email: user.email,
    status: user.status
  }
}

/**
 * Mock 更新用户信息
 */
export async function mockUpdateUserInfo(data: Partial<UserInfo>): Promise<UserInfo> {
  await delay(800)

  // 模拟更新（实际不修改 mockUsers）
  const user = mockUsers[0]
  return {
    id: user.id,
    username: user.username,
    nickname: data.nickname || user.nickname,
    avatar: data.avatar || user.avatar,
    phone: data.phone || user.phone,
    email: data.email || user.email,
    status: user.status
  }
}

/**
 * Mock 修改密码
 */
export async function mockUpdatePassword(oldPassword: string, newPassword: string): Promise<void> {
  await delay(800)

  // 简单验证旧密码
  if (oldPassword !== '111111' && oldPassword !== '123456') {
    throw new Error('原密码错误')
  }

  // Mock 修改成功
}

/**
 * 通用 Mock 响应包装
 */
export function mockResponse<T>(data: T, code: number = 200, message: string = 'success') {
  return {
    code,
    message,
    data
  }
}
