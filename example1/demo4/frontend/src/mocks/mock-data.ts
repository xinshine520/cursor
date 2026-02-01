import type { Model, ModelDetail, NewsItem, NewsDetail } from '../types'

export interface Feature {
  id: number
  icon: string
  title: string
  description: string
}

export interface PerformanceBenchmarkItem {
  model: string
  mtBench: number
  humanEval: number
  mmlu: number
  speed: string
  context: string
  isCurrent?: boolean
}

export interface HeroMetric {
  value: number
  prefix?: string
  suffix: string
  label: string
}

export interface HeroData {
  title: string
  subtitle: string
  metrics: HeroMetric[]
  dashboard: {
    accuracy: string
    speed: { label: string; value: string; percentage: number }
    context: { label: string; value: string; percentage: number }
    multimodal: { label: string; value: string; percentage: number }
  }
}

export interface PricingPlan {
  id: number
  name: string
  description: string
  price: string
  priceUnit: string
  features: string[]
  popular?: boolean
  inputPrice: string
  outputPrice: string
}

export const mockHeroData: HeroData = {
  title: '华玥智能 · 355B MoE Architecture',
  subtitle: 'SOTA性能 AI平台，提供高效优化和强大能力',
  metrics: [
    { value: 120, suffix: ' tokens/s', label: '推理速度' },
    { value: 200, suffix: 'K', label: '上下文长度' },
    { value: 1, prefix: '第', suffix: '名', label: '评测排名' },
    { value: 23, prefix: '+', suffix: '%', label: '性能提升' },
  ],
  dashboard: {
    accuracy: '98.5%',
    speed: { label: '推理速度', value: '120 tokens/s', percentage: 95 },
    context: { label: '上下文处理', value: '200K', percentage: 100 },
    multimodal: { label: '多模态能力', value: '95%', percentage: 95 },
  },
}

export const mockFeatures: Feature[] = [
  { id: 1, icon: '🚀', title: '通用翻译', description: '支持100+语言实时翻译，准确率高达98.5%' },
  { id: 2, icon: '💡', title: '代码生成', description: '智能代码生成，支持多种编程语言和框架' },
  { id: 3, icon: '📊', title: '数据分析', description: '强大的数据分析能力，自动生成可视化报告' },
  { id: 4, icon: '🎨', title: '内容创作', description: '高质量内容创作，支持多种文体和风格' },
  { id: 5, icon: '🔍', title: '智能搜索', description: '语义搜索能力，理解用户真实意图' },
  { id: 6, icon: '🤖', title: '自动化', description: '智能自动化流程，提升工作效率' },
]

export const mockModels: Model[] = [
  {
    id: 1,
    name: 'HY-AI-4.6',
    version: 'v4.6',
    badge: 'SOTA',
    tags: ['MoE', '200K Context', 'Function Call'],
    description: '通用大语言模型，支持复杂推理和多轮对话',
    metrics: { speed: '120 tokens/s', context: '200K', accuracy: '98.5%' },
    icon: '📄',
  },
  {
    id: 2,
    name: 'HY-Vision-2.0',
    version: 'v2.0',
    badge: 'No.1',
    tags: ['Vision', 'Multi-modal', 'OCR'],
    description: '视觉理解模型，支持图像识别和视觉问答',
    metrics: { speed: '85 tokens/s', context: '100K', accuracy: '96.8%' },
    icon: '👁️',
  },
  {
    id: 3,
    name: 'HY-Speech-1.5',
    version: 'v1.5',
    badge: 'Beta',
    tags: ['Speech', 'TTS', 'STT'],
    description: '语音处理模型，支持语音识别和合成',
    metrics: { speed: '实时', context: '50K', accuracy: '94.2%' },
    icon: '🎤',
  },
]

const modelDetailsById: Record<number, Omit<ModelDetail, keyof Model>> = {
  1: {
    parameters: '355,000,000,000',
    architecture: 'MoE (Mixture of Experts)',
    benchmark: { mtBench: 9.2, humanEval: 85.3, mmlu: 88.7 },
    pricing: { input: '¥0.01 / 1K tokens', output: '¥0.03 / 1K tokens' },
  },
  2: {
    parameters: '180,000,000,000',
    architecture: 'Vision Transformer',
    benchmark: { mtBench: 8.5, humanEval: 78.2, mmlu: 82.1 },
    pricing: { input: '¥0.015 / 1K tokens', output: '¥0.04 / 1K tokens' },
  },
  3: {
    parameters: '120,000,000,000',
    architecture: 'Speech Transformer',
    benchmark: { mtBench: 7.8, humanEval: 72.5, mmlu: 75.3 },
    pricing: { input: '¥0.02 / 1K tokens', output: '¥0.05 / 1K tokens' },
  },
}

export function mockModelDetail(id: number): ModelDetail | null {
  const model = mockModels.find((m) => m.id === id)
  if (!model) return null
  const detail = modelDetailsById[id]
  if (!detail) return null
  return { ...model, ...detail }
}

export const mockPerformanceBenchmark: PerformanceBenchmarkItem[] = [
  {
    model: 'HY-AI-4.6',
    mtBench: 9.2,
    humanEval: 85.3,
    mmlu: 88.7,
    speed: '120 tokens/s',
    context: '200K',
    isCurrent: true,
  },
  {
    model: '竞品 A',
    mtBench: 8.7,
    humanEval: 82.1,
    mmlu: 85.2,
    speed: '95 tokens/s',
    context: '128K',
  },
  {
    model: '竞品 B',
    mtBench: 8.5,
    humanEval: 80.5,
    mmlu: 83.8,
    speed: '110 tokens/s',
    context: '100K',
  },
  {
    model: '竞品 C',
    mtBench: 8.3,
    humanEval: 79.2,
    mmlu: 82.5,
    speed: '88 tokens/s',
    context: '64K',
  },
]

export const mockPricingPlans: PricingPlan[] = [
  {
    id: 1,
    name: '基础版',
    description: '适合个人开发者和小型项目',
    price: '0.01',
    priceUnit: '元/1K tokens',
    inputPrice: '输入: ¥0.01 / 1K tokens',
    outputPrice: '输出: ¥0.03 / 1K tokens',
    features: ['API 调用权限', '基础模型访问', '100万 tokens/月', '邮件技术支持', '文档和示例代码'],
  },
  {
    id: 2,
    name: '专业版',
    description: '适合中小型企业和团队',
    price: '0.008',
    priceUnit: '元/1K tokens',
    inputPrice: '输入: ¥0.008 / 1K tokens',
    outputPrice: '输出: ¥0.025 / 1K tokens',
    popular: true,
    features: [
      'API 调用权限',
      '所有模型访问',
      '1000万 tokens/月',
      '优先技术支持',
      '专属客户经理',
      '定制化服务',
      'SLA 保障',
    ],
  },
  {
    id: 3,
    name: '企业版',
    description: '适合大型企业和定制需求',
    price: '定制',
    priceUnit: '',
    inputPrice: '输入: 批量折扣',
    outputPrice: '输出: 批量折扣',
    features: [
      'API 调用权限',
      '所有模型访问',
      '无限 tokens',
      '7x24 技术支持',
      '专属技术团队',
      '私有化部署选项',
      '定制化开发',
      'SLA 保障',
    ],
  },
]

export const mockNewsList: NewsItem[] = [
  {
    id: 1,
    title: '华玥智能发布 HY-AI-4.6 模型，性能提升 23%',
    summary: '华玥智能正式发布最新一代大语言模型 HY-AI-4.6，采用 MoE 架构，在多项基准测试中取得 SOTA 成绩，推理速度提升至 120 tokens/s。',
    publishDate: '2024-12-28',
    author: '技术团队',
    category: '产品发布',
  },
  {
    id: 2,
    title: '华玥智能荣获 2024 年度 AI 创新企业奖',
    summary: '在刚刚结束的 2024 年度 AI 创新大会上，华玥智能凭借在人工智能领域的卓越贡献，荣获"年度 AI 创新企业奖"。',
    publishDate: '2024-12-25',
    author: '市场部',
    category: '公司动态',
  },
  {
    id: 3,
    title: '华玥智能与多家企业达成战略合作',
    summary: '华玥智能宣布与多家行业领先企业达成战略合作协议，共同推进 AI 技术在各行业的应用落地，助力企业数字化转型。',
    publishDate: '2024-12-22',
    author: '商务团队',
    category: '合作动态',
  },
  {
    id: 4,
    title: 'HY-Vision-2.0 视觉模型正式上线',
    summary: '华玥智能视觉理解模型 HY-Vision-2.0 正式上线，支持图像识别、视觉问答、OCR 等多种视觉任务，准确率达到 96.8%。',
    publishDate: '2024-12-20',
    author: '技术团队',
    category: '产品发布',
  },
  {
    id: 5,
    title: '华玥智能开发者大会圆满落幕',
    summary: '为期三天的华玥智能开发者大会圆满落幕，吸引了超过 1000 名开发者参与，共同探讨 AI 技术的最新发展和应用实践。',
    publishDate: '2024-12-18',
    author: '市场部',
    category: '活动动态',
  },
  {
    id: 6,
    title: '华玥智能 API 调用量突破 10 亿次',
    summary: '华玥智能平台 API 调用量正式突破 10 亿次大关，标志着平台服务能力和用户规模达到新的里程碑。',
    publishDate: '2024-12-15',
    author: '运营团队',
    category: '里程碑',
  },
  {
    id: 7,
    title: '华玥智能推出企业版定制化服务',
    summary: '为满足大型企业的定制化需求，华玥智能正式推出企业版服务，提供私有化部署、专属技术团队等全方位支持。',
    publishDate: '2024-12-12',
    author: '商务团队',
    category: '产品发布',
  },
  {
    id: 8,
    title: '华玥智能参与制定 AI 行业标准',
    summary: '华玥智能作为行业领先企业，受邀参与制定 AI 行业技术标准，为推动行业健康发展贡献力量。',
    publishDate: '2024-12-10',
    author: '技术团队',
    category: '行业动态',
  },
  {
    id: 9,
    title: '华玥智能开源多个 AI 工具库',
    summary: '华玥智能宣布开源多个 AI 工具库，包括数据处理、模型训练、API 封装等工具，助力开发者快速构建 AI 应用。',
    publishDate: '2024-12-08',
    author: '技术团队',
    category: '开源动态',
  },
  {
    id: 10,
    title: '华玥智能完成 B 轮融资，估值达 50 亿元',
    summary: '华玥智能宣布完成 B 轮融资，融资金额达数亿元，公司估值达到 50 亿元，将用于技术研发和市场拓展。',
    publishDate: '2024-12-05',
    author: '市场部',
    category: '公司动态',
  },
  {
    id: 11,
    title: '华玥智能推出多模态 AI 解决方案',
    summary: '华玥智能正式推出多模态 AI 解决方案，整合文本、图像、语音等多种模态，为企业提供一站式 AI 服务。',
    publishDate: '2024-12-03',
    author: '产品团队',
    category: '产品发布',
  },
  {
    id: 12,
    title: '华玥智能技术团队荣获最佳创新奖',
    summary: '华玥智能技术团队凭借在 AI 领域的创新成果，荣获"最佳创新团队奖"，展现了团队的技术实力和创新能力。',
    publishDate: '2024-12-01',
    author: '人事部',
    category: '团队荣誉',
  },
]

const newsDetailsById: Record<number, Omit<NewsDetail, keyof NewsItem>> = {
  1: {
    content: `华玥智能正式发布最新一代大语言模型 HY-AI-4.6，这是公司在 AI 领域的重要里程碑。

## 核心特性

HY-AI-4.6 采用先进的 MoE (Mixture of Experts) 架构，参数量达到 355B，在多项基准测试中取得了 SOTA（State-of-the-Art）成绩。

### 性能提升

- **推理速度**：提升至 120 tokens/s，相比上一代提升 23%
- **上下文长度**：支持 200K tokens 的长上下文处理
- **准确率**：在 MT-Bench、HumanEval、MMLU 等评测中均取得优异成绩

### 技术突破

HY-AI-4.6 在以下方面实现了重大突破：

1. **架构优化**：采用 MoE 架构，显著提升了模型的推理效率
2. **多模态能力**：增强了对图像、语音等多模态数据的理解能力
3. **函数调用**：支持复杂的函数调用和工具使用场景

### 应用场景

HY-AI-4.6 适用于多种应用场景，包括：
- 复杂推理和多轮对话
- 代码生成和编程辅助
- 内容创作和文本生成
- 数据分析和报告生成

### 定价信息

- 输入：¥0.01 / 1K tokens
- 输出：¥0.03 / 1K tokens

华玥智能将持续优化模型性能，为用户提供更好的 AI 服务体验。`,
  },
  2: {
    content: `在刚刚结束的 2024 年度 AI 创新大会上，华玥智能凭借在人工智能领域的卓越贡献，荣获"年度 AI 创新企业奖"。

## 获奖理由

华玥智能在过去一年中取得了多项重要成就：

- 发布了多款领先的 AI 模型
- 服务了超过 10,000 家企业客户
- API 调用量突破 10 亿次
- 在多项技术评测中取得优异成绩

## 未来展望

华玥智能将继续致力于 AI 技术的创新和应用，为更多企业提供优质的 AI 服务，推动 AI 技术在各行业的应用落地。`,
  },
  3: {
    content: `华玥智能宣布与多家行业领先企业达成战略合作协议，共同推进 AI 技术在各行业的应用落地。

## 合作内容

本次战略合作涵盖以下方面：

1. **技术合作**：共同研发行业专用 AI 解决方案
2. **市场拓展**：联合推广 AI 技术在各行业的应用
3. **生态建设**：共建 AI 技术生态，推动行业发展

## 合作意义

此次合作将进一步推动 AI 技术在各行业的应用，助力企业数字化转型，为行业发展注入新的动力。`,
  },
  4: {
    content: `华玥智能视觉理解模型 HY-Vision-2.0 正式上线，这是公司在视觉 AI 领域的重要突破。

## 核心能力

HY-Vision-2.0 具备以下核心能力：

- **图像识别**：准确识别图像中的物体、场景和内容
- **视觉问答**：理解图像内容并回答相关问题
- **OCR 识别**：高精度文字识别，支持多种语言

## 性能指标

- 准确率：96.8%
- 推理速度：85 tokens/s
- 上下文长度：100K

## 应用场景

适用于图像分析、文档处理、内容审核等多种视觉任务场景。`,
  },
  5: {
    content: `为期三天的华玥智能开发者大会圆满落幕，吸引了超过 1000 名开发者参与。

## 大会亮点

- 发布了多项新产品和功能
- 举办了多场技术分享和培训
- 展示了最新的 AI 应用案例
- 提供了丰富的开发者资源

## 开发者反馈

参会开发者对大会给予了高度评价，认为内容丰富、收获颇丰，对华玥智能的技术实力和服务能力有了更深入的了解。`,
  },
  6: {
    content: `华玥智能平台 API 调用量正式突破 10 亿次大关，标志着平台服务能力和用户规模达到新的里程碑。

## 里程碑意义

10 亿次 API 调用量体现了：
- 平台服务的稳定性和可靠性
- 用户对华玥智能技术的信任
- AI 技术在各行业的广泛应用

## 未来目标

华玥智能将继续优化平台性能，提升服务质量，为更多用户提供优质的 AI 服务。`,
  },
  7: {
    content: `为满足大型企业的定制化需求，华玥智能正式推出企业版服务。

## 企业版特性

- **私有化部署**：支持本地部署，保障数据安全
- **专属技术团队**：提供 7x24 小时技术支持
- **定制化开发**：根据企业需求定制开发
- **SLA 保障**：提供服务水平协议保障

## 适用场景

适用于对数据安全、服务稳定性有高要求的大型企业。`,
  },
  8: {
    content: `华玥智能作为行业领先企业，受邀参与制定 AI 行业技术标准。

## 参与内容

华玥智能将参与以下标准的制定：
- AI 模型评测标准
- AI 服务接口规范
- AI 数据安全标准

## 行业意义

参与行业标准制定体现了华玥智能的技术实力和行业影响力，将推动 AI 行业的健康发展。`,
  },
  9: {
    content: `华玥智能宣布开源多个 AI 工具库，助力开发者快速构建 AI 应用。

## 开源项目

包括以下工具库：
- 数据处理工具
- 模型训练框架
- API 封装库
- 开发工具集

## 开源意义

通过开源，华玥智能希望：
- 降低 AI 应用开发门槛
- 推动 AI 技术普及
- 与开发者社区共同成长

所有开源项目已在 GitHub 上发布，欢迎开发者使用和贡献。`,
  },
  10: {
    content: `华玥智能宣布完成 B 轮融资，融资金额达数亿元，公司估值达到 50 亿元。

## 融资用途

本轮融资将主要用于：
- 技术研发和产品创新
- 市场拓展和品牌建设
- 团队建设和人才引进
- 基础设施建设

## 投资方

本轮融资由多家知名投资机构领投，体现了资本市场对华玥智能发展前景的认可。`,
  },
  11: {
    content: `华玥智能正式推出多模态 AI 解决方案，整合文本、图像、语音等多种模态。

## 解决方案特点

- **多模态融合**：统一处理文本、图像、语音等多种数据
- **一站式服务**：提供完整的 AI 服务能力
- **灵活部署**：支持云端和本地部署

## 应用场景

适用于需要处理多种数据类型的复杂应用场景，如智能客服、内容审核、多媒体分析等。`,
  },
  12: {
    content: `华玥智能技术团队凭借在 AI 领域的创新成果，荣获"最佳创新团队奖"。

## 团队成就

技术团队在过去一年中：
- 发布了多款领先的 AI 模型
- 在多项技术评测中取得优异成绩
- 获得了多项技术专利
- 发表了多篇高质量论文

## 团队展望

技术团队将继续致力于 AI 技术的创新，为公司和行业做出更大贡献。`,
  },
}

export function mockNewsDetail(id: number): NewsDetail | null {
  const news = mockNewsList.find((n) => n.id === id)
  if (!news) return null
  const detail = newsDetailsById[id]
  if (!detail) return null
  return { ...news, ...detail }
}

// AI Agent 定制化 Mock 数据
import type { AiAgentCustomizationData } from '../types'

export const mockAiAgentCustomizationData: AiAgentCustomizationData = {
  hero: {
    title: 'AI Agent 定制化服务',
    subtitle: '打造专属智能助手，赋能企业数字化转型',
    description:
      '基于华玥智能强大的 AI 能力，为您量身定制专属 AI Agent，满足不同行业和场景的个性化需求，助力企业提升效率、降低成本、创新业务模式。',
    ctaText: '联系销售',
  },
  features: [
    {
      id: 1,
      icon: '🔧',
      title: '任务编排',
      description: '灵活的任务编排能力，支持复杂工作流的自动化执行，可根据业务需求自定义任务流程',
    },
    {
      id: 2,
      icon: '📚',
      title: '知识库集成',
      description: '无缝集成企业知识库，支持多源数据接入，让 AI Agent 深度理解您的业务知识',
    },
    {
      id: 3,
      icon: '🎯',
      title: '多模态支持',
      description: '支持文本、图像、语音等多种模态处理，满足复杂业务场景的多样化需求',
    },
    {
      id: 4,
      icon: '💬',
      title: '自定义提示词',
      description: '灵活配置提示词模板，精准控制 AI Agent 的行为和输出，确保符合业务规范',
    },
    {
      id: 5,
      icon: '🔌',
      title: 'API 集成',
      description: '丰富的 API 接口，轻松集成现有业务系统，实现数据互通和流程协同',
    },
    {
      id: 6,
      icon: '📊',
      title: '数据分析',
      description: '强大的数据分析能力，自动生成业务洞察报告，助力数据驱动决策',
    },
  ],
  scenarios: [
    {
      id: 1,
      name: '智能客服',
      industry: '电商/金融',
      description: '7x24 小时智能客服，自动处理常见问题，提升客户满意度，降低人工成本',
      examples: ['订单查询', '产品咨询', '售后处理', '投诉建议'],
      icon: '💬',
    },
    {
      id: 2,
      name: '数据分析助手',
      industry: '企业服务',
      description: '智能分析业务数据，自动生成可视化报告，提供数据洞察和决策建议',
      examples: ['销售分析', '用户画像', '市场趋势', '运营优化'],
      icon: '📈',
    },
    {
      id: 3,
      name: '内容创作助手',
      industry: '媒体/营销',
      description: '自动生成高质量内容，支持多种文体和风格，提升内容创作效率',
      examples: ['文章撰写', '营销文案', '社交媒体', '产品介绍'],
      icon: '✍️',
    },
    {
      id: 4,
      name: '代码生成助手',
      industry: '软件开发',
      description: '智能代码生成和优化，支持多种编程语言，提升开发效率',
      examples: ['代码生成', 'Bug 修复', '代码审查', '文档生成'],
      icon: '💻',
    },
  ],
  process: [
    {
      id: 1,
      step: 1,
      title: '需求分析',
      description: '深入了解您的业务场景和需求，明确 AI Agent 的功能定位和应用目标',
    },
    {
      id: 2,
      step: 2,
      title: '方案设计',
      description: '基于需求分析，设计定制化方案，包括功能架构、技术选型和实施路径',
    },
    {
      id: 3,
      step: 3,
      title: '开发实现',
      description: '专业团队进行开发实现，包括模型训练、系统集成和功能开发',
    },
    {
      id: 4,
      step: 4,
      title: '测试验证',
      description: '全面测试 AI Agent 的功能和性能，确保满足业务需求和质量标准',
    },
    {
      id: 5,
      step: 5,
      title: '部署上线',
      description: '协助部署到生产环境，提供技术支持和培训，确保平稳运行',
    },
  ],
  advantages: [
    {
      id: 1,
      title: '高性能',
      description: '基于华玥智能先进的 AI 模型，提供卓越的性能表现和响应速度',
    },
    {
      id: 2,
      title: '可扩展性',
      description: '灵活的架构设计，支持业务增长和功能扩展，适应未来需求变化',
    },
    {
      id: 3,
      title: '安全性',
      description: '企业级安全保障，数据加密传输和存储，符合行业合规要求',
    },
    {
      id: 4,
      title: '易集成',
      description: '标准化的 API 接口，轻松集成现有系统，降低集成成本',
    },
  ],
}


