---
description: 数据库迁移管理
argument-hint: [create|upgrade|downgrade|current|history] [message|revision]
allowed-tools: Bash(cd,uv,alembic)
---

# 数据库迁移管理

我将帮助您管理 Project Alpha 的数据库迁移。

## 步骤 1: 切换到后端目录

```bash
cd src/project-alpha/backend || cd project-alpha/backend || cd backend
```

## 步骤 2: 解析命令参数

```bash
ACTION=${1:-current}
ARGUMENT=$2

case $ACTION in
  create)
    MESSAGE=${ARGUMENT:-"auto migration"}
    echo "📝 创建新的迁移: $MESSAGE"
    ;;
  upgrade)
    REVISION=${ARGUMENT:-"head"}
    echo "⬆️  升级数据库到: $REVISION"
    ;;
  downgrade)
    REVISION=${ARGUMENT:-"-1"}
    echo "⬇️  降级数据库: $REVISION"
    ;;
  current)
    echo "📍 查看当前数据库版本"
    ;;
  history)
    echo "📜 查看迁移历史"
    ;;
  *)
    echo "❌ 无效的操作: $ACTION"
    echo "使用方法: /migrate [create|upgrade|downgrade|current|history] [message|revision]"
    exit 1
    ;;
esac
```

## 步骤 3: 执行迁移操作

### 创建迁移

```bash
if [ "$ACTION" = "create" ]; then
  if [ -z "$ARGUMENT" ]; then
    echo "⚠️  未提供迁移描述，使用自动生成模式"
    uv run alembic revision --autogenerate -m "$MESSAGE"
  else
    echo "创建手动迁移文件..."
    uv run alembic revision -m "$MESSAGE"
  fi
  
  echo ""
  echo "✅ 迁移文件已创建"
  echo "📝 请检查生成的迁移文件，确认无误后运行升级"
fi
```

### 升级数据库

```bash
if [ "$ACTION" = "upgrade" ]; then
  echo ""
  echo "当前版本:"
  uv run alembic current
  
  echo ""
  echo "正在升级..."
  uv run alembic upgrade $REVISION
  
  echo ""
  echo "升级后版本:"
  uv run alembic current
  
  echo ""
  echo "✅ 数据库升级完成"
fi
```

### 降级数据库

```bash
if [ "$ACTION" = "downgrade" ]; then
  echo ""
  echo "当前版本:"
  uv run alembic current
  
  echo ""
  echo "⚠️  警告: 降级操作会回滚数据库更改"
  echo "正在降级..."
  uv run alembic downgrade $REVISION
  
  echo ""
  echo "降级后版本:"
  uv run alembic current
  
  echo ""
  echo "✅ 数据库降级完成"
fi
```

### 查看当前版本

```bash
if [ "$ACTION" = "current" ]; then
  echo ""
  uv run alembic current
  echo ""
fi
```

### 查看迁移历史

```bash
if [ "$ACTION" = "history" ]; then
  echo ""
  uv run alembic history
  echo ""
fi
```

**使用方法：**

### 创建迁移
- `/migrate create "add user table"` - 创建手动迁移
- `/migrate create` - 自动生成迁移（基于模型变更）

### 升级数据库
- `/migrate upgrade` - 升级到最新版本（head）
- `/migrate upgrade +1` - 升级一个版本
- `/migrate upgrade abc123` - 升级到特定版本

### 降级数据库
- `/migrate downgrade` - 降级一个版本
- `/migrate downgrade -2` - 降级两个版本
- `/migrate downgrade abc123` - 降级到特定版本

### 查看信息
- `/migrate current` - 查看当前数据库版本
- `/migrate history` - 查看所有迁移历史

**注意事项：**

- ⚠️ 生产环境迁移前必须备份数据库
- ⚠️ 降级操作会丢失数据，请谨慎操作
- ✅ 迁移前在开发环境测试升级和回滚
- ✅ 不要修改已提交的迁移文件（创建新迁移）

**迁移文件位置：**

```
backend/
└── alembic/
    └── versions/
        └── {revision}_{description}.py
```

**最佳实践：**

1. 创建迁移前检查模型变更
2. 迁移文件使用描述性名称
3. 确保迁移可逆（包含 downgrade）
4. 测试迁移后再应用到生产环境

