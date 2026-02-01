np# Project Context

## Purpose
华玥智能企业官网是一个纯前端展示项目，用于展示AI产品、解决方案、价格方案等信息。项目基于 `.cursor/rules/style.md` 视觉与交互规范实现，采用现代化的前端技术栈，通过本地 Mock 数据模拟 API 响应，无需后端服务即可运行。

**主要目标**：
- 提供清晰、现代的企业官网展示
- 展示AI产品模型、功能特性、性能基准等信息
- 支持响应式设计，适配多种设备
- 提供流畅的用户交互体验（滚动动画、hover效果等）

## Tech Stack
- **前端框架**: Vue 3 (Composition API)
- **构建工具**: Vite 5.x
- **类型系统**: TypeScript 5.x
- **样式方案**: Tailwind CSS 3.x
- **路由管理**: Vue Router 4.x
- **代码质量**: ESLint + Prettier
- **类型检查**: vue-tsc 2.x

## Project Conventions

### Code Style
- **格式化工具**: Prettier
  - 单引号 (`singleQuote: true`)
  - 无分号 (`semi: false`)
  - 行宽限制: 100 字符 (`printWidth: 100`)
  - 缩进: 2 个空格 (`tabWidth: 2`)
  - 尾随逗号: ES5 风格 (`trailingComma: 'es5'`)

- **代码检查**: ESLint
  - 扩展: `plugin:vue/vue3-essential`, `eslint:recommended`, `@vue/eslint-config-typescript`
  - 规则: 允许单词组件名 (`vue/multi-word-component-names: 'off'`)

- **TypeScript 配置**:
  - 严格模式: `strict: true`
  - 未使用变量/参数检查: `noUnusedLocals: true`, `noUnusedParameters: true`
  - 目标: ES2020
  - 模块解析: `bundler` (Vite)

- **命名约定**:
  - 组件文件: PascalCase (如 `Navbar.vue`, `ModelCard.vue`)
  - 组合式函数: camelCase，以 `use` 开头 (如 `useScrollReveal.ts`, `useCounter.ts`)
  - 类型定义: PascalCase (如 `Model`, `ApiResponse`)
  - 变量/函数: camelCase
  - 常量: UPPER_SNAKE_CASE (如 `NAVBAR_OFFSET_PX`)

- **代码注释**:
  - 使用中文注释
  - 公共函数/组件需要文档说明
  - 复杂逻辑必须添加注释

### Architecture Patterns
- **组件化架构**: 
  - 页面级组件 (`views/`): Home, Pricing, ProductDetail
  - 可复用组件 (`components/`): Navbar, Footer, ModelCard, PricingCard 等
  - 组合式函数 (`composables/`): 封装可复用的逻辑（如滚动动画、数字递增）

- **数据管理**:
  - **Mock API 模式**: 所有数据通过 `src/mocks/api.ts` 提供的函数获取
  - **统一响应格式**: `{ code, message, data, traceId }`
  - **模拟延迟**: 内置 180ms 延迟，更接近真实请求体验
  - **数据源**: `src/mocks/mock-data.ts` 集中管理所有 Mock 数据

- **路由设计**:
  - SPA 单页应用，使用 Vue Router History 模式
  - 支持部署到子路径 (`import.meta.env.BASE_URL`)
  - Hash 锚点导航支持平滑滚动，自动处理固定导航栏偏移

- **样式方案**:
  - Tailwind CSS 工具类优先
  - 自定义主题色和间距（`tailwind.config.js`）
  - 全局样式类（`.card`, `.container-custom` 等）定义在 `src/style.css`

- **类型安全**:
  - 所有 API 响应和数据结构都有 TypeScript 类型定义 (`src/types/index.ts`)
  - 组件 Props 使用 TypeScript 接口定义

### Testing Strategy
目前项目未配置测试框架。如需添加测试，建议：
- 单元测试: Vitest + Vue Test Utils
- 组件测试: 覆盖核心组件（如 ModelCard, PricingCard）
- E2E 测试: Playwright 或 Cypress（可选）

### Git Workflow
- **提交信息格式**: 中文，格式 `类型: 简短描述`
  - 类型包括: `feat`（新功能）、`fix`（修复）、`docs`（文档）、`style`（格式）、`refactor`（重构）、`test`（测试）、`chore`（构建/工具）
- **分支策略**: 主分支 `main`，功能开发使用特性分支
- **提交前检查**: 运行 `npm run lint` 确保代码质量

## Domain Context
- **项目名称**: 华玥智能（HY AI）
- **业务领域**: AI 企业服务，提供AI模型、解决方案和开发者工具
- **主要页面**:
  - 首页 (`/`): Hero区域、产品模型展示、功能特性、性能基准
  - 价格页 (`/pricing`): 价格方案展示
  - 产品详情页 (`/product/:id`): 单个AI模型的详细信息
- **导航结构**:
  - 产品 (`#products`): 模型列表
  - 解决方案 (`#solutions`): 功能特性
  - 开发者 (`#developers`): 性能基准和代码示例
  - 价格 (`/pricing`): 价格方案
- **设计规范**:
  - 主色: 深空蓝 `#0A0F1D`，强调色科技蓝 `#2563EB`
  - 栅格: 12列，最大宽度 1280px，间距遵循 8px 基线
  - 卡片: 圆角 12px，浅色边框，hover 上浮效果
  - 动效: 滚动 reveal、数字递增、hover 反馈（避免夸张动效）

## Important Constraints
- **纯前端项目**: 无后端 API 服务，无数据库，所有数据通过前端 Mock 提供
- **部署要求**: 
  - 支持部署到子路径（通过 `BASE_URL` 环境变量）
  - 生产环境需要支持 SPA History 模式回退（`server.mjs` 已实现）
- **浏览器兼容性**: 现代浏览器（ES2020+），不支持 IE
- **性能要求**: 
  - 首屏加载优化
  - 图片懒加载（如需要）
  - 代码分割（Vite 自动处理）
- **代码质量**: 
  - TypeScript 严格模式，不允许未使用的变量/参数
  - ESLint 检查必须通过
  - 构建前必须通过 `vue-tsc` 类型检查

## External Dependencies
- **无外部 API 依赖**: 项目完全使用本地 Mock 数据，不依赖任何外部服务
- **构建时依赖**: 
  - Node.js 环境（开发和生产构建）
  - npm 包管理器
- **运行时依赖**: 
  - 现代浏览器环境（支持 ES2020+）
  - 生产部署可使用 Node.js 静态服务器（`server.mjs`）或任何支持 SPA History 模式的 Web 服务器
