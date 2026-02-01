---
description: 启动后端开发服务器
argument-hint: [port]
allowed-tools: Bash(cd,uv,alembic)
---

# 启动后端开发服务器

我将帮助您启动 Project Alpha 后端开发服务器。

## 步骤 1: 检查当前目录

!`pwd`

## 步骤 2: 切换到后端目录

```bash
cd src/project-alpha/backend || cd project-alpha/backend || cd backend
```

## 步骤 3: 检查环境变量文件

```bash
if [ ! -f .env ]; then
  echo "⚠️  .env 文件不存在，请从 env.example 复制并配置"
  if [ -f env.example ]; then
    echo "发现 env.example 文件"
  fi
fi
```

## 步骤 4: 检查数据库迁移状态

```bash
echo "检查数据库迁移状态..."
uv run alembic current
```

## 步骤 5: 运行数据库迁移（如果需要）

```bash
echo "升级数据库到最新版本..."
uv run alembic upgrade head
```

## 步骤 6: 启动开发服务器

```bash
# 确定端口号（默认 8000）
PORT=${1:-8000}

echo "🚀 启动后端开发服务器在端口 $PORT..."
echo "访问 http://localhost:$PORT/docs 查看 API 文档"
echo ""

uv run uvicorn app.main:app --reload --host 0.0.0.0 --port $PORT
```

**使用方法：**

- `/start-backend` - 使用默认端口 8000 启动
- `/start-backend 8080` - 使用指定端口 8080 启动

**注意事项：**

- 确保已安装 uv 包管理器
- 确保已配置 `.env` 文件（包含数据库连接）
- 确保 PostgreSQL 数据库正在运行
- 首次运行前需要执行 `uv sync` 安装依赖

