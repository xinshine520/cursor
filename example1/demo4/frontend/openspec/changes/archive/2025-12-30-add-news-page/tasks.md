## 1. 数据层实现
- [x] 1.1 在 `src/types/index.ts` 中添加新闻相关的 TypeScript 类型定义（`NewsItem`, `NewsDetail`）
- [x] 1.2 在 `src/mocks/mock-data.ts` 中添加新闻 Mock 数据（至少 10-15 条新闻数据）
- [x] 1.3 在 `src/mocks/api.ts` 中添加 `getNewsList()` 和 `getNewsDetail(id)` 函数

## 2. 路由配置
- [x] 2.1 在 `src/router/index.ts` 中添加 `/news` 路由（新闻列表页）
- [x] 2.2 在 `src/router/index.ts` 中添加 `/news/:id` 路由（新闻详情页）

## 3. 组件开发
- [x] 3.1 创建 `src/views/News.vue` - 新闻列表页面组件
  - 实现新闻列表展示（卡片式布局）
  - 支持分页或无限滚动（可选）
  - 实现加载状态和错误处理
- [x] 3.2 创建 `src/views/NewsDetail.vue` - 新闻详情页面组件
  - 展示新闻标题、发布时间、作者、正文内容
  - 实现返回列表按钮
  - 实现加载状态和错误处理
- [x] 3.3 创建 `src/components/NewsCard.vue` - 新闻卡片组件（可选，用于列表展示）

## 4. 导航更新
- [x] 4.1 在 `src/components/Navbar.vue` 中添加"新闻"菜单项
  - 位置：在"价格"菜单项之后
  - 链接：`to="/news"`
  - 样式：与其他菜单项保持一致

## 5. 样式和交互
- [x] 5.1 确保新闻页面样式符合项目设计规范（Tailwind CSS）
- [x] 5.2 实现新闻卡片的 hover 效果（与现有卡片组件保持一致）
- [x] 5.3 确保响应式设计，移动端友好

## 6. 测试和验证
- [x] 6.1 验证新闻列表页面正常加载和显示
- [x] 6.2 验证新闻详情页面正常加载和显示
- [x] 6.3 验证导航菜单"新闻"链接正常工作
- [x] 6.4 验证路由跳转和浏览器前进/后退功能正常
- [x] 6.5 运行 `npm run build` 确保构建成功

