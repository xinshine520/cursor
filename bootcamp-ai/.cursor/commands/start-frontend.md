---
description: 启动前端开发服务器
argument-hint: [port]
allowed-tools: Bash(cd,npm)
---

# 启动前端开发服务器

我将帮助您启动 Project Alpha 前端开发服务器。

## 步骤 1: 检查当前目录

!`pwd`

## 步骤 2: 切换到前端目录

```bash
cd src/project-alpha/frontend || cd project-alpha/frontend || cd frontend
```

## 步骤 3: 检查环境变量文件

```bash
if [ ! -f .env ]; then
  echo "⚠️  .env 文件不存在，请从 .env.example 复制并配置"
  if [ -f .env.example ]; then
    echo "发现 .env.example 文件"
  fi
fi
```

## 步骤 4: 检查依赖是否安装

```bash
if [ ! -d node_modules ]; then
  echo "📦 未找到 node_modules，正在安装依赖..."
  npm install
else
  echo "✅ 依赖已安装"
fi
```

## 步骤 5: 启动开发服务器

```bash
# Vite 默认端口是 5173，可以通过参数覆盖
PORT=${1:-5173}

echo "🚀 启动前端开发服务器..."
echo "访问 http://localhost:$PORT 查看应用"
echo ""

# 如果指定了端口，设置环境变量
if [ "$PORT" != "5173" ]; then
  PORT=$PORT npm run dev
else
  npm run dev
fi
```

**使用方法：**

- `/start-frontend` - 使用默认端口 5173 启动
- `/start-frontend 3000` - 使用指定端口 3000 启动

**注意事项：**

- 确保已安装 Node.js (18+)
- 确保已配置 `.env` 文件（包含 API 地址）
- 首次运行前需要执行 `npm install` 安装依赖
- Vite 会自动打开浏览器（如果配置了）

**环境变量配置：**

在 `.env` 文件中设置：
```
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_APP_TITLE=Project Alpha
```

