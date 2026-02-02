// Mock 素材和资产 API 服务
import type { Material, Asset } from './mockData'
import { 
  officialMaterials, 
  personalMaterials, 
  generatedMaterials,
  creationAssets,
  brandAssets,
  workAssets
} from './mockData'

// 模拟延迟
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Mock 响应包装
 */
function mockResponse<T>(data: T, code: number = 200, message: string = 'success') {
  return {
    code,
    message,
    data
  }
}

// ================ 素材相关 API ================

/**
 * 获取官方素材列表
 */
export async function getMockOfficialMaterials(page: number = 1, pageSize: number = 20) {
  await delay(600)
  
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const list = officialMaterials.slice(start, end)
  
  return mockResponse({
    list,
    total: officialMaterials.length,
    page,
    pageSize
  })
}

/**
 * 获取个人素材列表
 */
export async function getMockPersonalMaterials(page: number = 1, pageSize: number = 20) {
  await delay(600)
  
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const list = personalMaterials.slice(start, end)
  
  return mockResponse({
    list,
    total: personalMaterials.length,
    page,
    pageSize
  })
}

/**
 * 获取生成素材列表
 */
export async function getMockGeneratedMaterials(page: number = 1, pageSize: number = 20) {
  await delay(600)
  
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const list = generatedMaterials.slice(start, end)
  
  return mockResponse({
    list,
    total: generatedMaterials.length,
    page,
    pageSize
  })
}

/**
 * 根据分类获取素材
 */
export async function getMockMaterialsByCategory(category: 'official' | 'personal' | 'generated') {
  await delay(600)
  
  let list: Material[] = []
  switch (category) {
    case 'official':
      list = officialMaterials
      break
    case 'personal':
      list = personalMaterials
      break
    case 'generated':
      list = generatedMaterials
      break
  }
  
  return mockResponse({ list, total: list.length })
}

/**
 * 搜索素材
 */
export async function searchMockMaterials(keyword: string) {
  await delay(700)
  
  const allMaterials = [...officialMaterials, ...personalMaterials, ...generatedMaterials]
  const list = allMaterials.filter(m => 
    m.title.includes(keyword) || 
    m.tags.some(tag => tag.includes(keyword))
  )
  
  return mockResponse({ list, total: list.length })
}

/**
 * 下载素材
 */
export async function downloadMockMaterial(id: number) {
  await delay(400)
  
  const allMaterials = [...officialMaterials, ...personalMaterials, ...generatedMaterials]
  const material = allMaterials.find(m => m.id === id)
  
  if (!material) {
    return mockResponse(null, 404, '素材不存在')
  }
  
  // 模拟下载计数+1
  material.downloads++
  
  return mockResponse({ 
    downloadUrl: `https://mock-download.com/${id}`,
    fileName: material.title
  })
}

/**
 * 点赞素材
 */
export async function likeMockMaterial(id: number) {
  await delay(300)
  
  const allMaterials = [...officialMaterials, ...personalMaterials, ...generatedMaterials]
  const material = allMaterials.find(m => m.id === id)
  
  if (!material) {
    return mockResponse(null, 404, '素材不存在')
  }
  
  // 模拟点赞计数+1
  material.likes++
  
  return mockResponse({ likes: material.likes })
}

// ================ 资产相关 API ================

/**
 * 获取智能创作资产列表
 */
export async function getMockCreationAssets(page: number = 1, pageSize: number = 20) {
  await delay(600)
  
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const list = creationAssets.slice(start, end)
  
  return mockResponse({
    list,
    total: creationAssets.length,
    page,
    pageSize
  })
}

/**
 * 获取品牌视频资产列表
 */
export async function getMockBrandAssets(page: number = 1, pageSize: number = 20) {
  await delay(600)
  
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const list = brandAssets.slice(start, end)
  
  return mockResponse({
    list,
    total: brandAssets.length,
    page,
    pageSize
  })
}

/**
 * 获取作品集资产列表
 */
export async function getMockWorkAssets(page: number = 1, pageSize: number = 20) {
  await delay(600)
  
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const list = workAssets.slice(start, end)
  
  return mockResponse({
    list,
    total: workAssets.length,
    page,
    pageSize
  })
}

/**
 * 根据类型获取资产
 */
export async function getMockAssetsByType(type: 'creation' | 'brand' | 'work') {
  await delay(600)
  
  let list: Asset[] = []
  switch (type) {
    case 'creation':
      list = creationAssets
      break
    case 'brand':
      list = brandAssets
      break
    case 'work':
      list = workAssets
      break
  }
  
  return mockResponse({ list, total: list.length })
}

/**
 * 获取资产详情
 */
export async function getMockAssetDetail(id: number) {
  await delay(500)
  
  const allAssets = [...creationAssets, ...brandAssets, ...workAssets]
  const asset = allAssets.find(a => a.id === id)
  
  if (!asset) {
    return mockResponse(null, 404, '资产不存在')
  }
  
  return mockResponse(asset)
}

/**
 * 搜索资产
 */
export async function searchMockAssets(keyword: string) {
  await delay(700)
  
  const allAssets = [...creationAssets, ...brandAssets, ...workAssets]
  const list = allAssets.filter(a => 
    a.title.includes(keyword) || 
    (a.description && a.description.includes(keyword))
  )
  
  return mockResponse({ list, total: list.length })
}

/**
 * 点赞资产
 */
export async function likeMockAsset(id: number) {
  await delay(300)
  
  const allAssets = [...creationAssets, ...brandAssets, ...workAssets]
  const asset = allAssets.find(a => a.id === id)
  
  if (!asset) {
    return mockResponse(null, 404, '资产不存在')
  }
  
  // 模拟点赞计数+1
  asset.likes++
  
  return mockResponse({ likes: asset.likes })
}

/**
 * 分享资产
 */
export async function shareMockAsset(id: number) {
  await delay(300)
  
  const allAssets = [...creationAssets, ...brandAssets, ...workAssets]
  const asset = allAssets.find(a => a.id === id)
  
  if (!asset) {
    return mockResponse(null, 404, '资产不存在')
  }
  
  // 模拟分享计数+1
  asset.shares++
  
  return mockResponse({ 
    shareUrl: `https://mock-share.com/asset/${id}`,
    shares: asset.shares 
  })
}

/**
 * 删除资产
 */
export async function deleteMockAsset(id: number) {
  await delay(500)
  
  // Mock 删除逻辑（实际不从数组中删除）
  return mockResponse(null, 200, '删除成功')
}

/**
 * 发布资产
 */
export async function publishMockAsset(id: number) {
  await delay(800)
  
  const allAssets = [...creationAssets, ...brandAssets, ...workAssets]
  const asset = allAssets.find(a => a.id === id)
  
  if (!asset) {
    return mockResponse(null, 404, '资产不存在')
  }
  
  // 模拟发布
  asset.status = 'published'
  asset.publishedAt = new Date().toISOString().split('T')[0]
  
  return mockResponse(asset, 200, '发布成功')
}
