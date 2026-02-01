export interface Model {
  id: number
  name: string
  version: string
  badge: string
  tags: string[]
  description: string
  metrics: {
    speed: string
    context: string
    accuracy: string
  }
  icon: string
}

export interface ModelDetail extends Model {
  parameters: string
  architecture: string
  benchmark: {
    mtBench: number
    humanEval: number
    mmlu: number
  }
  pricing: {
    input: string
    output: string
  }
}

export interface NewsItem {
  id: number
  title: string
  summary: string
  publishDate: string
  author?: string
  thumbnail?: string
  category?: string
}

export interface NewsDetail extends NewsItem {
  content: string
}

// AI Agent 定制化相关类型
export interface AiAgentFeature {
  id: number
  icon: string
  title: string
  description: string
}

export interface AiAgentScenario {
  id: number
  name: string
  industry: string
  description: string
  examples: string[]
  icon: string
}

export interface AiAgentProcessStep {
  id: number
  step: number
  title: string
  description: string
}

export interface AiAgentAdvantage {
  id: number
  title: string
  description: string
}

export interface AiAgentCustomizationData {
  hero: {
    title: string
    subtitle: string
    description: string
    ctaText: string
  }
  features: AiAgentFeature[]
  scenarios: AiAgentScenario[]
  process: AiAgentProcessStep[]
  advantages: AiAgentAdvantage[]
}

