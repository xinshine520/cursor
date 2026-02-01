# E2E Tests with Playwright

本目录包含使用 Playwright 编写的端到端测试。

## 安装

```bash
# 安装 Playwright 和浏览器
npx playwright install

# 或使用 pnpm
pnpm exec playwright install
```

## 运行测试

```bash
# 运行所有测试
npm run test:e2e

# 运行测试并打开 UI 模式（推荐用于调试）
npm run test:e2e:ui

# 运行测试并打开浏览器（headed 模式）
npm run test:e2e:headed

# 调试模式
npm run test:e2e:debug

# 查看测试报告
npm run test:e2e:report
```

## 测试结构

- `fixtures.ts` - 测试辅助工具和 mock API 帮助类
- `global-setup.ts` - 全局测试设置（检查后端服务等）
- `global-teardown.ts` - 全局测试清理
- `homepage.spec.ts` - 首页测试
- `connections.spec.ts` - 连接管理测试
- `query.spec.ts` - SQL 查询页面测试
- `schema-explorer.spec.ts` - 架构浏览器测试

## 测试前准备

1. **启动后端服务器**（在另一个终端）：
   ```bash
   cd backend
   uv run uvicorn src.main:app --reload --port 8000
   ```

2. **前端服务器会自动启动**（由 Playwright 配置中的 webServer 管理）

## Mock API

测试使用 `MockApiHelper` 类来模拟 API 响应，避免依赖真实的后端服务。这样可以：
- 快速运行测试
- 测试各种场景（成功、错误等）
- 不依赖外部服务

## 编写新测试

参考现有测试文件的结构：

```typescript
import { test, expect } from './fixtures';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page, mockApi }) => {
    await mockApi.setupMocks();
    await page.goto('/');
  });

  test('should do something', async ({ page }) => {
    // Your test code here
  });
});
```

## 故障排除

### 测试失败：无法连接到后端

确保后端服务器正在运行：
```bash
cd backend
uv run uvicorn src.main:app --reload --port 8000
```

### Monaco Editor 测试问题

Monaco Editor 加载是异步的，测试中需要等待：
```typescript
await page.waitForTimeout(2000); // 等待编辑器加载
```

### 元素找不到

使用 Playwright 的调试工具：
```bash
npm run test:e2e:debug
```

这会打开 Playwright Inspector，可以逐步执行测试并查看页面状态。
