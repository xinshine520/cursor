# Change: 添加动态新闻页面

## Why
用户需要访问企业新闻动态，了解华玥智能的最新资讯、产品更新、行业动态等信息。当前网站缺少新闻展示功能，无法满足用户获取最新信息的需求。

## What Changes
- **新增新闻页面** (`/news`): 创建独立的新闻列表页面，支持动态加载和展示新闻文章
- **新增新闻详情页面** (`/news/:id`): 支持查看单篇新闻的详细内容
- **更新导航菜单**: 在顶部导航栏添加"新闻"链接，跳转到新闻列表页面
- **新增 Mock 数据**: 在 `src/mocks/mock-data.ts` 中添加新闻相关的 Mock 数据
- **新增 Mock API**: 在 `src/mocks/api.ts` 中添加获取新闻列表和新闻详情的 API 函数
- **新增路由配置**: 在 `src/router/index.ts` 中添加新闻相关路由

## Impact
- **受影响的功能**: 
  - 导航栏 (`src/components/Navbar.vue`)
  - 路由系统 (`src/router/index.ts`)
  - Mock 数据层 (`src/mocks/mock-data.ts`, `src/mocks/api.ts`)
- **新增文件**:
  - `src/views/News.vue` - 新闻列表页面
  - `src/views/NewsDetail.vue` - 新闻详情页面
  - `src/components/NewsCard.vue` - 新闻卡片组件（可选）
- **新增能力**: `news` - 新闻展示和管理能力

