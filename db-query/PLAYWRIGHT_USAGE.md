# Playwright 使用指南：打开浏览器测试并截图

## 快速开始

### 方法一：使用独立脚本（最简单，推荐用于演示）

1. **安装依赖**（如果还没有安装）：
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

   脚本会：
   - 打开浏览器（可见窗口）
   - 导航到 `http://localhost:5173/`
   - 点击 "SQL 查询" 链接
   - 输入自然语言查询："查询所有 tickets 表记录"
   - 点击 "生成 SQL"
   - 点击 "执行查询"
   - 截图并保存到 `db-query/images/` 目录

### 方法二：使用 Playwright Test（推荐用于自动化测试）

1. **运行测试（headed 模式，可以看到浏览器）**：
   ```bash
   cd db-query/frontend
   npx playwright test e2e/demo-flow.spec.ts --headed
   ```

2. **运行所有测试**：
   ```bash
   npx playwright test --headed
   ```

3. **调试模式（逐步执行）**：
   ```bash
   npx playwright test --debug
   ```

### 方法三：使用 Playwright UI（最直观）

```bash
cd db-query/frontend
npx playwright test --ui
```

这会打开 Playwright UI，你可以：
- 看到测试执行过程
- 逐步调试
- 查看截图和视频
- 检查元素选择器
- 实时修改测试代码

## 截图保存位置

所有截图会保存在 `db-query/images/` 目录下，文件名格式：
- `query-results-2026-01-31T12-30-45.png`（带时间戳）

## 自定义脚本示例

### 简单示例：打开网页并截图

创建文件 `db-query/frontend/scripts/simple-screenshot.ts`：

```typescript
import { chromium } from 'playwright';
import * as path from 'path';

async function simpleDemo() {
  // 启动浏览器（headless: false 表示显示浏览器窗口）
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000, // 减慢操作速度，方便观察
  });
  
  const page = await browser.newPage();
  
  // 导航到网页
  await page.goto('http://localhost:5173/');
  
  // 等待页面加载
  await page.waitForLoadState('networkidle');
  
  // 截图（fullPage: true 表示截取整个页面）
  const screenshotPath = path.join(__dirname, '..', '..', 'images', 'screenshot.png');
  await page.screenshot({ 
    path: screenshotPath,
    fullPage: true 
  });
  
  console.log(`截图已保存到: ${screenshotPath}`);
  
  // 保持浏览器打开 5 秒
  await page.waitForTimeout(5000);
  
  await browser.close();
}

simpleDemo();
```

运行：
```bash
cd db-query/frontend
npx tsx scripts/simple-screenshot.ts
```

### 交互式示例：点击按钮并截图

```typescript
import { chromium } from 'playwright';
import * as path from 'path';

async function interactiveDemo() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:5173/');
  
  // 点击链接
  await page.getByRole('link', { name: /SQL 查询/i }).click();
  
  // 等待页面加载
  await page.waitForLoadState('networkidle');
  
  // 填写表单
  await page.getByPlaceholder(/描述您想要查询的内容/i).fill('查询所有 tickets 表记录');
  
  // 点击按钮
  await page.getByRole('button', { name: /生成 SQL/i }).click();
  
  // 等待结果
  await page.waitForSelector('text=/SELECT/i', { timeout: 10000 });
  
  // 截图
  await page.screenshot({ 
    path: path.join(__dirname, '..', '..', 'images', 'interactive-demo.png'),
    fullPage: true 
  });
  
  await browser.close();
}

interactiveDemo();
```

## 常用 API

### 浏览器操作

```typescript
// 启动浏览器
const browser = await chromium.launch({ 
  headless: false,      // false = 显示浏览器窗口
  slowMo: 500,         // 减慢操作速度（毫秒）
  devtools: true,      // 打开开发者工具
});

// 创建新页面
const page = await browser.newPage();

// 设置视口大小
await page.setViewportSize({ width: 1280, height: 720 });
```

### 页面导航

```typescript
// 导航到 URL
await page.goto('http://localhost:5173/');

// 等待页面加载完成
await page.waitForLoadState('networkidle'); // 等待网络空闲
await page.waitForLoadState('domcontentloaded'); // 等待 DOM 加载
await page.waitForLoadState('load'); // 等待所有资源加载
```

### 元素查找和交互

```typescript
// 通过角色查找（推荐）
await page.getByRole('button', { name: /生成 SQL/i }).click();
await page.getByRole('link', { name: /SQL 查询/i }).click();

// 通过占位符查找
await page.getByPlaceholder(/描述您想要查询的内容/i).fill('查询内容');

// 通过选择器查找
await page.locator('h1').click();
await page.locator('#my-id').fill('text');

// 等待元素出现
await page.waitForSelector('text=/查询结果/i', { timeout: 10000 });

// 检查元素是否可见
const isVisible = await page.locator('.my-class').isVisible();
```

### 截图

```typescript
// 全页面截图
await page.screenshot({ 
  path: 'screenshot.png',
  fullPage: true 
});

// 只截取可见区域
await page.screenshot({ 
  path: 'screenshot.png',
  fullPage: false 
});

// 截取特定元素
await page.locator('.my-element').screenshot({ 
  path: 'element.png' 
});
```

### 等待

```typescript
// 等待固定时间
await page.waitForTimeout(1000); // 1 秒

// 等待网络请求完成
await page.waitForResponse(response => 
  response.url().includes('/api/query') && response.status() === 200
);

// 等待元素出现
await page.waitForSelector('.result-table', { timeout: 10000 });
```

## 调试技巧

1. **使用 `slowMo` 减慢操作速度**：
   ```typescript
   const browser = await chromium.launch({ slowMo: 1000 });
   ```

2. **使用 `headless: false` 查看浏览器操作**：
   ```typescript
   const browser = await chromium.launch({ headless: false });
   ```

3. **暂停执行以便检查**：
   ```typescript
   await page.pause(); // 会打开 Playwright Inspector
   ```

4. **打印页面内容**：
   ```typescript
   console.log(await page.content());
   console.log(await page.title());
   ```

5. **截图调试**：
   ```typescript
   // 在关键步骤后截图
   await page.screenshot({ path: 'debug-step1.png' });
   ```

## 常见问题

### 1. 找不到元素

**问题**：`TimeoutError: Locator.click: Timeout 30000ms exceeded`

**解决方案**：
- 增加超时时间：`await page.waitForSelector('.element', { timeout: 60000 })`
- 检查元素选择器是否正确
- 等待页面完全加载：`await page.waitForLoadState('networkidle')`

### 2. 截图保存失败

**问题**：`Error: ENOENT: no such file or directory`

**解决方案**：
- 确保目录存在：
  ```typescript
  import * as fs from 'fs';
  const dir = path.dirname(screenshotPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  ```

### 3. 浏览器无法启动

**问题**：`Error: Executable doesn't exist`

**解决方案**：
```bash
npx playwright install chromium
```

### 4. 页面加载超时

**问题**：`Navigation timeout`

**解决方案**：
```typescript
await page.goto('http://localhost:5173/', { 
  timeout: 60000, // 60 秒超时
  waitUntil: 'networkidle' 
});
```

## 更多资源

- [Playwright 官方文档](https://playwright.dev/)
- [Playwright API 参考](https://playwright.dev/docs/api/class-playwright)
- [Playwright 最佳实践](https://playwright.dev/docs/best-practices)
