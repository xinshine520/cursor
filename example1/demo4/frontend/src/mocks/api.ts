import type { Model, ModelDetail, NewsItem, NewsDetail, AiAgentCustomizationData } from '../types'
import type {
  Feature,
  HeroData,
  PerformanceBenchmarkItem,
  PricingPlan,
} from './mock-data'
import {
  mockFeatures,
  mockHeroData,
  mockModelDetail,
  mockModels,
  mockNewsDetail,
  mockNewsList,
  mockPerformanceBenchmark,
  mockPricingPlans,
  mockAiAgentCustomizationData,
} from './mock-data'

export interface ApiResponse<T> {
  code: number
  message: string
  data: T
  traceId: string
}

const DEFAULT_DELAY_MS = 180

function generateTraceId(): string {
  return `trace-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

function withDelay<T>(data: T, delayMs = DEFAULT_DELAY_MS): Promise<T> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(data), delayMs)
  })
}

function ok<T>(data: T): ApiResponse<T> {
  return {
    code: 200,
    message: 'success',
    data,
    traceId: generateTraceId(),
  }
}

function notFound<T>(message: string, data: T): ApiResponse<T> {
  return {
    code: 404,
    message,
    data,
    traceId: generateTraceId(),
  }
}

// 首页 Hero 区域
export async function getHero(): Promise<ApiResponse<HeroData>> {
  return withDelay(ok(mockHeroData))
}

// 功能特性
export async function getFeatures(): Promise<ApiResponse<Feature[]>> {
  return withDelay(ok(mockFeatures))
}

// 模型列表
export async function getModels(): Promise<ApiResponse<Model[]>> {
  return withDelay(ok(mockModels))
}

// 模型详情
export async function getModelDetail(id: number): Promise<ApiResponse<ModelDetail | null>> {
  const detail = mockModelDetail(id)
  if (!detail) {
    return withDelay(notFound('模型未找到', null))
  }
  return withDelay(ok(detail))
}

// 性能基准
export async function getPerformanceBenchmark(): Promise<ApiResponse<PerformanceBenchmarkItem[]>> {
  return withDelay(ok(mockPerformanceBenchmark))
}

// 价格方案
export async function getPricingPlans(): Promise<ApiResponse<PricingPlan[]>> {
  return withDelay(ok(mockPricingPlans))
}

// 新闻列表
export async function getNewsList(): Promise<ApiResponse<NewsItem[]>> {
  return withDelay(ok(mockNewsList))
}

// 新闻详情
export async function getNewsDetail(id: number): Promise<ApiResponse<NewsDetail | null>> {
  const detail = mockNewsDetail(id)
  if (!detail) {
    return withDelay(notFound('新闻未找到', null))
  }
  return withDelay(ok(detail))
}

// AI Agent 定制化数据
export async function getAiAgentCustomizationData(): Promise<ApiResponse<AiAgentCustomizationData>> {
  return withDelay(ok(mockAiAgentCustomizationData))
}


