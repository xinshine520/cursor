# 运行指南 - Database Query Tool

本指南将帮助您启动前端和后端服务器。

## 前置要求

确保已安装：
- ✅ Python 3.11+ 
- ✅ Node.js 18+
- ✅ uv 包管理器 (`pip install uv`)
- ✅ PostgreSQL 数据库（用于测试连接）

## 快速启动

### 方法一：使用启动脚本（推荐）

```powershell
cd db-query
.\start.ps1
```

这个脚本会自动：
1. 检查并创建 `.env` 文件（如果不存在）
2. 在新窗口中启动后端服务器
3. 在当前窗口启动前端开发服务器

### 方法二：手动启动（两个终端）

#### 终端 1 - 启动后端服务器

```powershell
# 1. 进入后端目录
cd db-query\backend

# 2. 安装依赖（首次运行）
uv sync

# 3. 创建 .env 文件（如果不存在）
if (-not (Test-Path .env)) {
    Copy-Item .env.example .env
    Write-Host "请编辑 .env 文件并添加 OPENAI_API_KEY（可选）"
}

# 4. 启动后端服务器
uv run uvicorn src.main:app --reload --port 8000
```

**后端启动成功标志：**
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Application startup complete.
```

#### 终端 2 - 启动前端服务器

```powershell
# 1. 进入前端目录
cd db-query\frontend

# 2. 安装依赖（首次运行）
npm install

# 3. 启动前端开发服务器
npm run dev
```

**前端启动成功标志：**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

## 访问应用

启动成功后，访问以下地址：

- **前端应用**: http://localhost:5173
- **后端 API**: http://localhost:8000
- **API 文档**: http://localhost:8000/docs

## 配置说明

### 后端配置 (`backend/.env`)

```env
# OpenAI API 配置（可选 - 仅用于自然语言转SQL功能）
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_API_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4

# 数据库配置
DATABASE_PATH=./data/db-query.sqlite

# 查询配置
QUERY_TIMEOUT=30

# 服务器配置（可选）
HOST=0.0.0.0
PORT=8000
```

**注意**：
- `OPENAI_API_KEY` 是可选的，只有在使用"自然语言转SQL"功能时才需要
- 如果不配置 OpenAI API Key，其他功能（连接管理、SQL查询、架构浏览）仍然可以正常使用

### 前端配置

前端默认配置在 `frontend/vite.config.ts` 中，API 代理已配置为 `http://localhost:8000`。

如果需要修改，可以设置环境变量：
```env
VITE_API_URL=http://localhost:8000
```

## 常见问题

### 1. 后端无法启动

**问题**: `uv sync` 失败
```powershell
# 解决方案：清理缓存后重试
uv cache clean
uv sync
```

**问题**: 端口 8000 已被占用
```powershell
# 解决方案：使用其他端口
uv run uvicorn src.main:app --reload --port 8001
```

**问题**: 缺少 `.env` 文件
```powershell
# 解决方案：从示例文件创建
cd backend
Copy-Item .env.example .env
# 然后编辑 .env 文件
```

### 2. 前端无法启动

**问题**: 端口 5173 已被占用
```powershell
# 解决方案：Vite 会自动使用下一个可用端口
# 或手动指定端口
npm run dev -- --port 3000
```

**问题**: `npm install` 失败
```powershell
# 解决方案：清理缓存后重试
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### 3. 前后端无法通信

**问题**: 前端无法连接到后端
- 检查后端是否正在运行（访问 http://localhost:8000/docs）
- 检查 `frontend/vite.config.ts` 中的代理配置
- 检查浏览器控制台是否有 CORS 错误

### 4. 数据库连接失败

**问题**: 无法连接到 PostgreSQL
- 检查 PostgreSQL 服务是否运行
- 验证连接 URL 格式：`postgresql://user:password@host:port/database`
- 检查网络连接和防火墙设置

## 开发模式

### 后端热重载

后端使用 `--reload` 参数，代码更改后会自动重启：
```powershell
uv run uvicorn src.main:app --reload --port 8000
```

### 前端热重载

前端使用 Vite，代码更改后会自动刷新浏览器。

## 停止服务器

- **后端**: 在终端中按 `Ctrl+C`
- **前端**: 在终端中按 `Ctrl+C`
- **如果使用 start.ps1**: 关闭前端终端窗口，然后关闭后端 PowerShell 窗口

## 生产环境部署

### 后端生产模式

```powershell
# 不使用 --reload（生产环境）
uv run uvicorn src.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### 前端生产构建

```powershell
cd frontend
npm run build
# 构建产物在 dist/ 目录
```

## 下一步

启动成功后，您可以：

1. **测试连接管理**
   - 访问 http://localhost:5173
   - 添加 PostgreSQL 数据库连接
   - 查看数据库架构

2. **测试 SQL 查询**
   - 进入 Query 页面
   - 编写并执行 SQL SELECT 查询
   - 查看查询结果

3. **测试自然语言转SQL**（需要 OpenAI API Key）
   - 在 Query 页面使用"Natural Language Query"
   - 输入自然语言描述
   - 生成并执行 SQL

更多详细信息请参考 `TESTING_GUIDE.md`。
