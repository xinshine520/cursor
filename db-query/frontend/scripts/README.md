# Playwright Demo Scripts

## 使用 Playwright 打开浏览器测试并截图

### 快速开始

1. **安装依赖**（如果还没有）：
   ```bash
   cd db-query/frontend
   pnpm install
   pnpm add -D tsx playwright
   ```

2. **确保前端服务器运行**：
   ```bash
   # 在另一个终端窗口
   cd db-query/frontend
   pnpm dev
   ```

3. **运行脚本**：
   ```bash
   cd db-query/frontend
   npx tsx scripts/demo-screenshot.ts
   ```

### 可用的脚本

#### 1. `simple-screenshot.ts` - 简单示例
打开网页并截图，适合快速测试：
```bash
npx tsx scripts/simple-screenshot.ts
```

#### 2. `interactive-demo.ts` - 交互式示例
点击按钮、填写表单并截图：
```bash
npx tsx scripts/interactive-demo.ts
```

#### 3. `demo-screenshot.ts` - 完整演示流程
完整的用户流程：导航 → 输入查询 → 生成 SQL → 执行查询 → 截图：
```bash
npx tsx scripts/demo-screenshot.ts
```

### 方法二：使用 Playwright Test

```bash
cd db-query/frontend

# 运行测试（headed 模式，可以看到浏览器）
npx playwright test e2e/demo-flow.spec.ts --headed

# 调试模式（逐步执行）
npx playwright test --debug

# 运行所有测试
npx playwright test --headed
```

### 方法三：使用 Playwright UI 模式（最直观）

```bash
cd db-query/frontend
npx playwright test --ui
```

这会打开 Playwright UI，你可以：
- 看到测试执行过程
- 逐步调试
- 查看截图和视频
- 检查元素选择器

## 截图保存位置

所有截图会保存在 `db-query/images/` 目录下。

## 注意事项

1. **确保前端服务器运行**：
   ```bash
   cd db-query/frontend
   pnpm dev
   ```

2. **确保后端服务器运行**（可选，如果使用 mock 数据则不需要）：
   ```bash
   cd db-query/backend
   uv run uvicorn src.main:app --reload --port 8000
   ```

3. **安装 Playwright 浏览器**（首次运行）：
   ```bash
   npx playwright install chromium
   ```

## 示例：手动编写 Playwright 脚本

```typescript
import { chromium } from 'playwright';

async function demo() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:5173/');
  await page.screenshot({ path: 'screenshot.png', fullPage: true });
  
  await browser.close();
}

demo();
```

运行：
```bash
npx tsx your-script.ts
```

## 更多信息

详细的使用指南请查看：`db-query/PLAYWRIGHT_USAGE.md`
