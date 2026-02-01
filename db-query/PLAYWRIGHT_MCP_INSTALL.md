# Playwright MCP 安装指南

Playwright Model Context Protocol (MCP) 是一个服务器，允许 AI 助手通过浏览器自动化与网页交互。

## 前置要求

- Node.js (LTS 版本推荐)
- npm 或 pnpm 包管理器
- Cursor IDE（或其他支持 MCP 的 IDE）

## 安装步骤

### 1. 安装 Playwright

```bash
npm install -g playwright
```

### 2. 安装 Playwright MCP

```bash
npm install -g @playwright/mcp@latest
```

### 3. 安装 Playwright 浏览器

```bash
npx playwright install
```

### 4. 验证安装

```bash
npx playwright --version
npx @playwright/mcp --version
```

## 在 Cursor 中配置 MCP

### 方法一：通过 Cursor 设置（推荐）

1. 打开 Cursor 设置（`Ctrl+,` 或 `Cmd+,`）
2. 搜索 "MCP" 或 "Model Context Protocol"
3. 找到 MCP Servers 配置
4. 添加以下配置：

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp"],
      "env": {}
    }
  }
}
```

### 方法二：手动编辑配置文件

#### Windows

编辑文件：`%APPDATA%\Cursor\User\globalStorage\mcp.json`

或使用 PowerShell：
```powershell
$configPath = "$env:APPDATA\Cursor\User\globalStorage\mcp.json"
# 如果文件不存在，创建它
if (-not (Test-Path $configPath)) {
    New-Item -Path $configPath -ItemType File -Force
}
# 编辑配置文件
notepad $configPath
```

#### macOS/Linux

编辑文件：`~/.config/Cursor/User/globalStorage/mcp.json`

```bash
mkdir -p ~/.config/Cursor/User/globalStorage
nano ~/.config/Cursor/User/globalStorage/mcp.json
```

### 配置文件示例

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp"],
      "env": {
        "PLAYWRIGHT_BROWSERS_PATH": "0"
      }
    }
  }
}
```

## 功能特性

安装后，Playwright MCP 将提供以下功能：

- 📸 **截图功能**：为 AI 提供页面视觉上下文
- 🖱️ **交互录制**：记录点击、输入、滚动等操作
- 🌐 **DOM 提取**：提取页面结构用于选择器生成
- 💻 **JavaScript 执行**：在浏览器中执行 JavaScript
- 🧪 **测试生成**：生成可靠的 Playwright 测试代码

## 使用示例

安装完成后，你可以在 Cursor 中直接使用自然语言与 AI 交互，例如：

- "打开 https://example.com 并截图"
- "在这个页面上找到登录按钮并点击"
- "提取这个页面的所有链接"
- "生成这个页面的 Playwright 测试代码"

## 故障排除

### 问题：找不到 playwright 命令

**解决方案：**
```bash
# 确保全局安装
npm install -g playwright
# 或使用 npx
npx playwright --version
```

### 问题：MCP 服务器无法启动

**解决方案：**
1. 检查 Node.js 版本：`node --version`（需要 18+）
2. 重新安装：`npm install -g @playwright/mcp@latest`
3. 检查 Cursor 配置文件的 JSON 格式是否正确

### 问题：浏览器无法启动

**解决方案：**
```bash
# 重新安装浏览器
npx playwright install
# 或安装特定浏览器
npx playwright install chromium
```

## 相关资源

- [Playwright MCP GitHub](https://github.com/microsoft/playwright-mcp)
- [Playwright 官方文档](https://playwright.dev/)
- [Model Context Protocol 规范](https://modelcontextprotocol.io/)

## 注意事项

- Playwright MCP 需要安装浏览器二进制文件，首次安装可能需要一些时间
- 确保有足够的磁盘空间（浏览器二进制文件约 500MB-1GB）
- 某些功能可能需要网络连接
