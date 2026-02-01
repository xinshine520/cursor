## 华玥智能｜企业官网（demo4）

基于 `.cursor/rules/style.md` 视觉与交互规范实现的企业官网 Demo。项目为 **纯前端**：Vue 3 + Vite + Tailwind CSS，并通过 `src/mocks` 提供 **本地 Mock 数据**（模拟 API 返回结构与延迟）。

## 快速开始（30 秒）

```bash
cd demo4/frontend
npm install
npm run dev
```

浏览器访问：`http://localhost:3000`

## 构建与发布（Node 运行即可）

### 构建

```bash
cd demo4/frontend
npm run build
```

产物目录：`demo4/frontend/dist/`

### 方式一：Vite 预览（推荐）

```bash
cd demo4/frontend
npm run preview -- --host 0.0.0.0 --port 4173
```

### 方式二：Node 静态服务（支持 History 路由回退）

```bash
cd demo4/frontend
npm run start:prod
```

- **环境变量**
  - **PORT**：端口（默认 `4173`）
  - **BASE_PATH**：子路径（默认 `/`），例如 `BASE_PATH=/huayue`

> 说明：`server.mjs` 已包含 SPA History fallback，刷新 `/pricing`、`/product/1` 不会 404。

## Mock 数据与“API”说明

所有页面数据均通过前端 Mock API 获取（无需后端）：

- **数据源**：`demo4/frontend/src/mocks/mock-data.ts`
- **Mock API**：`demo4/frontend/src/mocks/api.ts`
  - 统一返回：`{ code, message, data, traceId }`
  - 内置延迟：更接近真实请求体验

## 主要页面与路由

- **首页**：`/`
- **价格**：`/pricing`
- **产品详情**：`/product/:id`
- **新闻列表**：`/news`
- **新闻详情**：`/news/:id`
- **AI Agent定制化**：`/ai-agent`
- **导航锚点**：`#products` / `#solutions` / `#developers`

> 路由使用 `createWebHistory(import.meta.env.BASE_URL)`，支持部署到子路径。

## 目录结构（精简）

```
demo4/
└── frontend/
    ├── src/
    │   ├── components/        # 页面组件
    │   ├── composables/       # 组合式函数（动效等）
    │   ├── mocks/             # Mock 数据与 API
    │   ├── router/            # 路由
    │   ├── views/             # 页面
    │   └── style.css          # 全局样式（含卡片/按钮等基础样式）
    ├── server.mjs             # 生产静态服务（History 回退）
    └── vite.config.ts
```

## 设计与交互要点（摘录）

- **主色**：深空蓝 `#0A0F1D`，强调色科技蓝 `#2563EB`
- **栅格**：12 列，最大宽度 `1280px`，间距遵循 8px 基线
- **卡片**：圆角 `12px`，浅色边框 + hover 上浮/阴影增强
- **动效**：滚动 reveal、数字递增、hover 反馈（避免夸张动效）


