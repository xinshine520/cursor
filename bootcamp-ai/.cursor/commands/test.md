---
description: 运行项目测试
argument-hint: [backend|frontend|all]
allowed-tools: Bash(cd,uv,npm,pytest)
---

# 运行项目测试

我将帮助您运行 Project Alpha 项目的测试。

## 步骤 1: 确定测试范围

```bash
TEST_SCOPE=${1:-all}

case $TEST_SCOPE in
  backend)
    echo "🧪 运行后端测试..."
    ;;
  frontend)
    echo "🧪 运行前端测试..."
    ;;
  all)
    echo "🧪 运行所有测试..."
    ;;
  *)
    echo "❌ 无效的参数: $TEST_SCOPE"
    echo "使用方法: /test [backend|frontend|all]"
    exit 1
    ;;
esac
```

## 步骤 2: 运行后端测试

```bash
if [ "$TEST_SCOPE" = "backend" ] || [ "$TEST_SCOPE" = "all" ]; then
  echo ""
  echo "=========================================="
  echo "后端测试 (Python/FastAPI)"
  echo "=========================================="
  
  cd src/project-alpha/backend || cd project-alpha/backend || cd backend 2>/dev/null || {
    echo "⚠️  未找到后端目录，跳过后端测试"
    cd - > /dev/null
  }
  
  if [ $? -eq 0 ]; then
    # 检查测试目录是否存在
    if [ -d "tests" ] && [ "$(ls -A tests 2>/dev/null)" ]; then
      echo "运行 pytest..."
      uv run pytest -v --tb=short
    else
      echo "⚠️  未找到测试文件，跳过后端测试"
    fi
    
    cd - > /dev/null
  fi
  
  echo ""
fi
```

## 步骤 3: 运行前端测试

```bash
if [ "$TEST_SCOPE" = "frontend" ] || [ "$TEST_SCOPE" = "all" ]; then
  echo ""
  echo "=========================================="
  echo "前端测试 (React/TypeScript)"
  echo "=========================================="
  
  cd src/project-alpha/frontend || cd project-alpha/frontend || cd frontend 2>/dev/null || {
    echo "⚠️  未找到前端目录，跳过前端测试"
    cd - > /dev/null
  }
  
  if [ $? -eq 0 ]; then
    # 检查是否有测试脚本
    if grep -q '"test"' package.json 2>/dev/null; then
      echo "运行前端测试..."
      npm test
    elif [ -f "vitest.config.ts" ] || [ -f "vitest.config.js" ]; then
      echo "运行 Vitest..."
      npx vitest run
    else
      echo "⚠️  未配置测试脚本，跳过前端测试"
    fi
    
    cd - > /dev/null
  fi
  
  echo ""
fi
```

## 步骤 4: 测试总结

```bash
echo "=========================================="
echo "✅ 测试完成"
echo "=========================================="
```

**使用方法：**

- `/test` - 运行所有测试（后端 + 前端）
- `/test backend` - 仅运行后端测试
- `/test frontend` - 仅运行前端测试
- `/test all` - 运行所有测试（与默认相同）

**注意事项：**

- 后端测试需要数据库连接（使用测试数据库）
- 前端测试可能需要构建步骤
- 确保已安装所有依赖
- 测试环境变量可能需要单独配置

**测试覆盖率：**

- 后端：使用 pytest 和 pytest-cov
- 前端：使用 Vitest（如果配置）

