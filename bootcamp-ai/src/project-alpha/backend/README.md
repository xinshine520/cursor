# Ticket Hub Backend

Ticket 管理系统后端服务

## 环境要求

- Python 3.12+
- PostgreSQL 18.x
- [uv](https://github.com/astral-sh/uv) - 快速 Python 包管理器

## 安装 uv

```bash
# macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Windows (PowerShell)
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"

# 或使用 pip
pip install uv
```

## 快速开始

### 1. 安装依赖

```bash
# 安装项目依赖
uv sync

# 安装开发依赖
uv sync --extra dev
```

### 2. 配置环境变量

```bash
# 复制环境变量示例文件
cp env.example .env

# 编辑 .env 文件，设置数据库连接等信息
```

### 3. 初始化数据库

```bash
# 运行数据库迁移
uv run alembic upgrade head
```

### 4. 启动开发服务器

```bash
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

访问 http://localhost:8000/docs 查看 API 文档

## 常用命令

```bash
# 运行 Python 脚本
uv run python script.py

# 运行测试
uv run pytest

# 格式化代码
uv run black .
uv run isort .

# 类型检查
uv run mypy .

# 添加新依赖
uv add package-name

# 添加开发依赖
uv add --dev package-name
```

## 项目结构

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py          # FastAPI 应用入口
│   ├── config.py        # 配置管理
│   ├── database.py      # 数据库连接
│   ├── models/          # SQLAlchemy 模型
│   ├── schemas/         # Pydantic 模型
│   ├── routers/         # API 路由
│   ├── services/        # 业务逻辑层
│   └── utils/           # 工具函数
├── alembic/             # 数据库迁移
├── tests/               # 测试文件
├── pyproject.toml       # 项目配置和依赖
└── env.example          # 环境变量示例
```

## 开发规范

- 使用 `black` 格式化代码
- 使用 `isort` 整理导入
- 使用 `mypy` 进行类型检查
- 遵循 PEP 8 代码规范
