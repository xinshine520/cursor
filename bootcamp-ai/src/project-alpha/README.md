# Project Alpha - Ticket 管理系统

基于标签分类的 Ticket 管理系统

## 项目结构

```
project-alpha/
├── backend/          # FastAPI 后端服务
└── frontend/         # React + Vite 前端应用
```

## 技术栈

### 后端
- **Python**: 3.12+
- **框架**: FastAPI 0.123.x
- **数据库**: PostgreSQL 18.x
- **ORM**: SQLAlchemy 2.0
- **迁移工具**: Alembic
- **包管理**: uv

### 前端
- **框架**: React 19.x
- **构建工具**: Vite 7.x
- **语言**: TypeScript 5.x
- **样式**: Tailwind CSS 4.x
- **组件库**: Shadcn/ui

## 快速开始

### 前置要求

1. **安装 uv** (Python 包管理器)
   ```bash
   # macOS/Linux
   curl -LsSf https://astral.sh/uv/install.sh | sh
   
   # Windows (PowerShell)
   powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
   ```

2. **安装 Node.js** (18+)
   ```bash
   # 使用 nvm 或直接下载安装
   ```

3. **安装 PostgreSQL** (18.x)
   ```bash
   # 根据操作系统安装 PostgreSQL
   ```

### 后端设置

```bash
cd backend

# 安装依赖
uv sync
uv sync --extra dev

# 配置环境变量
cp env.example .env
# 编辑 .env 文件设置数据库连接

# 运行数据库迁移
uv run alembic upgrade head

# 启动开发服务器
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

访问 http://localhost:8000/docs 查看 API 文档

### 前端设置

```bash
cd frontend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件设置 API 地址

# 启动开发服务器
npm run dev
```

访问 http://localhost:5173 查看前端应用

## 开发指南

详细开发计划请参考 [实现计划文档](../../specs/w1/v1-plan-sonnet.md)

## 许可证

MIT


