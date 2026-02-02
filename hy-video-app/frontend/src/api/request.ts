// API 请求工具封装
interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  header?: any
}

interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

const BASE_URL = 'http://localhost:8080/api/v1'

// 请求拦截器
function requestInterceptor(options: RequestOptions) {
  // 添加 token
  const token = uni.getStorageSync('token')
  if (token) {
    options.header = {
      ...options.header,
      'Authorization': `Bearer ${token}`
    }
  }
  
  // 添加请求头
  options.header = {
    'Content-Type': 'application/json',
    ...options.header
  }
  
  return options
}

// 响应拦截器
function responseInterceptor(response: any): Promise<ApiResponse> {
  const { statusCode, data } = response
  
  if (statusCode === 200) {
    if (data.code === 200) {
      return Promise.resolve(data)
    } else if (data.code === 401) {
      // token 过期，清除本地存储并跳转登录
      uni.removeStorageSync('token')
      uni.removeStorageSync('userInfo')
      uni.showToast({
        title: '登录已过期，请重新登录',
        icon: 'none'
      })
      setTimeout(() => {
        uni.reLaunch({
          url: '/pages/login/index'
        })
      }, 1500)
      return Promise.reject(data)
    } else {
      uni.showToast({
        title: data.message || '请求失败',
        icon: 'none'
      })
      return Promise.reject(data)
    }
  } else {
    uni.showToast({
      title: '网络错误',
      icon: 'none'
    })
    return Promise.reject({ code: statusCode, message: '网络错误' })
  }
}

// 通用请求方法
export function request<T = any>(options: RequestOptions): Promise<ApiResponse<T>> {
  return new Promise((resolve, reject) => {
    // 请求拦截
    options = requestInterceptor(options)
    
    uni.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data,
      header: options.header,
      success: (res) => {
        responseInterceptor(res)
          .then(resolve)
          .catch(reject)
      },
      fail: (err) => {
        uni.showToast({
          title: '网络请求失败',
          icon: 'none'
        })
        reject(err)
      }
    })
  })
}

// GET 请求
export function get<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
  return request<T>({
    url,
    method: 'GET',
    data
  })
}

// POST 请求
export function post<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
  return request<T>({
    url,
    method: 'POST',
    data
  })
}

// PUT 请求
export function put<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
  return request<T>({
    url,
    method: 'PUT',
    data
  })
}

// DELETE 请求
export function del<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
  return request<T>({
    url,
    method: 'DELETE',
    data
  })
}
