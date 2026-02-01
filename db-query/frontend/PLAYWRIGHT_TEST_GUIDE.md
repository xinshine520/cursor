# Playwright E2E 测试指南

## 快速开始

### 1. 安装依赖

```bash
cd db-query/frontend
pnpm install
```

### 2. 安装 Playwright 浏览器

```bash
pnpm exec playwright install
```

### 3. 运行测试

```bash
# 运行所有测试
pnpm run test:e2e

# UI 模式（推荐用于调试）
pnpm run test:e2e:ui

# 有头模式（可以看到浏览器）
pnpm run test:e2e:headed

# 调试模式
pnpm run test:e2e:debug
```

## 测试文件结构

```
e2e/
├── fixtures.ts              # 测试辅助工具和 Mock API
├── global-setup.ts          # 全局设置
├── global-teardown.ts       # 全局清理
├── homepage.spec.ts         # 首页测试
├── connections.spec.ts      # 连接管理测试
├── query.spec.ts            # SQL 查询测试
└── schema-explorer.spec.ts  # 架构浏览器测试
```

## 测试覆盖的功能

### ✅ 首页测试 (homepage.spec.ts)
- 页面标题和导航显示
- 连接列表显示
- 架构浏览器显示
- 添加连接表单
- 语言切换
- 暗色模式切换

### ✅ 连接管理测试 (connections.spec.ts)
- 连接表单显示
- 表单验证
- URL 格式验证
- 创建连接成功
- 连接列表显示
- 选择连接

### ✅ SQL 查询测试 (query.spec.ts)
- 查询页面显示
- 连接选择器
- SQL 编辑器
- 自然语言查询输入
- SQL 生成
- SQL 执行
- 查询结果表显示
- 错误处理
- 使用生成的 SQL

### ✅ 架构浏览器测试 (schema-explorer.spec.ts)
- 架构浏览器显示
- 无连接时的提示
- 选择连接后加载架构
- 搜索表
- 展开表显示列
- 表详情显示
- 刷新元数据

## Mock API

测试使用 `MockApiHelper` 来模拟 API 响应，避免依赖真实后端：

```typescript
test('example', async ({ page, mockApi }) => {
  await mockApi.setupMocks(); // 设置默认 mock
  await mockApi.mockApiError('/endpoint', 400, { code: 'ERROR', message: 'Error' });
  // 测试代码
});
```

## 常见问题修复

### Monaco Editor 测试

Monaco Editor 是异步加载的，测试中需要等待：

```typescript
await page.waitForTimeout(2000); // 等待编辑器加载
```

### 元素选择器

使用 Playwright 的最佳实践：

```typescript
// ✅ 好的选择器
await page.getByRole('button', { name: /执行查询/i })
await page.getByLabel(/连接名称/i)
await page.getByText(/数据查询工具/i)

// ❌ 避免使用
await page.locator('.some-class') // 脆弱的选择器
```

### 等待策略

```typescript
// 等待元素可见
await expect(page.getByText('Text')).toBeVisible({ timeout: 5000 });

// 等待 API 调用完成
await page.waitForTimeout(1000);

// 等待网络请求
await page.waitForResponse('**/connections');
```

## 调试测试

### 1. 使用 UI 模式

```bash
pnpm run test:e2e:ui
```

这会打开 Playwright UI，可以：
- 逐步执行测试
- 查看页面快照
- 检查元素
- 修改选择器

### 2. 使用调试模式

```bash
pnpm run test:e2e:debug
```

打开 Playwright Inspector，可以：
- 暂停执行
- 检查页面状态
- 执行命令

### 3. 查看测试报告

```bash
pnpm run test:e2e:report
```

查看 HTML 测试报告，包括：
- 测试结果
- 截图
- 视频录制
- 跟踪信息

## CI/CD 集成

在 CI 环境中运行测试：

```yaml
# GitHub Actions 示例
- name: Install dependencies
  run: pnpm install

- name: Install Playwright browsers
  run: pnpm exec playwright install --with-deps

- name: Run tests
  run: pnpm run test:e2e
  env:
    CI: true
```

## 最佳实践

1. **使用有意义的测试名称**
   ```typescript
   test('should create connection when form is valid', ...)
   ```

2. **每个测试独立**
   - 使用 `beforeEach` 设置状态
   - 不依赖其他测试的执行顺序

3. **使用 Mock API**
   - 避免依赖外部服务
   - 测试各种场景（成功、错误）

4. **等待策略**
   - 使用 `expect().toBeVisible()` 而不是固定延迟
   - 只在必要时使用 `waitForTimeout`

5. **清理资源**
   - 测试后清理 mock
   - 重置状态

## 故障排除

### 测试失败：元素找不到

1. 检查选择器是否正确
2. 增加等待时间
3. 使用 `test:e2e:debug` 调试

### 测试失败：Monaco Editor 问题

1. 增加等待时间（Monaco 异步加载）
2. 使用键盘操作而不是直接点击编辑器
3. 检查编辑器是否完全加载

### 测试失败：API Mock 不工作

1. 检查路由模式是否正确
2. 确保在 `beforeEach` 中设置了 mock
3. 检查 API URL 配置

## 下一步

- 添加更多测试用例
- 提高测试覆盖率
- 集成到 CI/CD 流程
- 添加视觉回归测试
