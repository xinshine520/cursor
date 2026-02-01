# Agent Skills - Cursor 项目

本项目定义了 Cursor Agent 的领域特定技能，用于提升 AI 辅助开发的效率和准确性。

## 项目概览

本项目是一个包含多个子项目的 monorepo：
- **db-query**: 数据库查询工具（支持 PostgreSQL/MySQL）
- **bootcamp-ai/project-alpha**: 票据管理系统
- **example1**: 示例和学习项目

## 核心原则

在应用任何技能之前，必须遵循以下核心原则：

1. **简单性原则**: YAGNI（You Aren't Gonna Need It），只实现明确要求的功能
2. **测试先行**: 所有新功能或 Bug 修复，必须先编写失败的测试
3. **明确性**: 代码的首要目的是让人类易于理解
4. **中文优先**: 所有交流和代码注释使用中文，变量名保持英文

## 技能目录

### Skill: FastAPI 后端开发
**触发词**: `/fastapi`, `/backend`, `/api`

**知识**:
- 使用 Python 3.11+ 和 FastAPI 0.104+
- 异步优先：使用 `async/await` 和 `asyncpg`/`aiomysql` 进行数据库操作
- 使用 Pydantic v2 进行数据验证和序列化
- API 使用 camelCase JSON，Python 代码使用 snake_case（通过 `alias_generator`）
- 使用 `uv` 包管理器：`uv sync`, `uv run`
- 错误处理：使用 `HTTPException`，错误信息用户友好
- 类型提示：所有函数必须有完整的类型注解
- 数据库迁移：使用 SQLite 存储元数据，支持自动迁移

**使用场景**:
- 创建新的 API 端点
- 实现数据库 CRUD 操作
- 编写数据验证模型
- 处理异步数据库操作

**示例命令**:
```bash
# 安装依赖
cd backend && uv sync

# 运行开发服务器
uv run uvicorn src.main:app --reload

# 类型检查
uv run mypy src

# 代码格式化
uv run ruff check src
```

### Skill: React + TypeScript 前端开发
**触发词**: `/react`, `/frontend`, `/tsx`

**知识**:
- React 18+，使用函数组件和 Hooks
- TypeScript 严格模式，所有 props 和状态必须类型化
- 使用 TanStack Query (`@tanstack/react-query`) 进行数据获取和缓存
- 使用 Zustand 进行全局状态管理（禁止 Redux/Context API）
- Tailwind CSS 作为唯一样式方案（禁止 CSS Modules/styled-components/inline style/.css 文件）
- 使用 Axios 进行 HTTP 请求（通过 `src/api/client.ts` 统一管理）
- API base URL 从 `import.meta.env.VITE_API_URL` 读取
- 组件结构：`components/{ui,features}`, `pages`, `hooks`, `stores`, `api`, `types`, `utils`
- 错误处理统一用 apiClient 拦截器，组件层不要 try/catch API 调用
- 使用 pnpm 作为包管理器

**使用场景**:
- 创建新的 React 组件
- 实现数据获取和缓存
- 样式和布局优化
- 实现路由和页面

**示例命令**:
```bash
# 安装依赖
cd frontend && pnpm install

# 启动开发服务器
pnpm dev

# 构建
pnpm build

# 类型检查
pnpm tsc --noEmit

# 代码检查
pnpm lint
```

### Skill: 数据库查询工具开发
**触发词**: `/db-query`, `/sql`, `/database`

**知识**:
- 支持 PostgreSQL 和 MySQL 数据库
- SQL 安全：仅允许 SELECT 查询，自动 LIMIT 1000
- 使用 `sqlglot` 进行 SQL 解析和验证（支持 PostgreSQL 和 MySQL 方言）
- 自然语言转 SQL：使用 OpenAI GPT-4，支持方言特定的 SQL 生成
- 连接管理：URL 加密存储（使用 cryptography），支持多种数据库类型
- Monaco Editor 用于 SQL 编辑，支持语法高亮和自动补全
- 元数据缓存：使用 SQLite 本地存储，支持自动提取和刷新
- 查询结果导出：支持 Excel (xlsx) 和 Word (docx) 格式
- 前端验证：客户端检查 SELECT/WITH-only，防止危险关键字

**使用场景**:
- 添加新的数据库支持
- 实现 SQL 验证逻辑
- 优化 NLQ（自然语言查询）功能
- 实现元数据提取和缓存

**关键文件**:
- `backend/src/services/query_service.py`: SQL 验证和执行
- `backend/src/services/nlq_service.py`: 自然语言转 SQL
- `backend/src/services/metadata_service.py`: 元数据提取
- `frontend/src/components/features/SqlEditor.tsx`: SQL 编辑器
- `frontend/src/components/features/ResultsTable.tsx`: 结果展示

### Skill: 测试和代码质量
**触发词**: `/test`, `/tdd`, `/quality`

**知识**:
- Python: `pytest` + `pytest-asyncio`，优先集成测试
- TypeScript: Playwright 用于 E2E 测试
- TDD 流程：先写测试，再实现功能（Red-Green-Refactor）
- 代码格式化：Python 使用 `ruff`，TypeScript 使用 ESLint
- 类型检查：Python 使用 `mypy`（strict mode），TypeScript 使用 `tsc`
- 测试覆盖率：优先编写集成测试，使用真实依赖（拒绝 Mocks）

**使用场景**:
- 为新功能编写测试
- 修复 bug 前先写失败的测试
- 代码质量检查和重构

**示例命令**:
```bash
# Python 测试
cd backend && uv run pytest

# TypeScript E2E 测试
cd frontend && pnpm test:e2e

# 代码格式化
uv run ruff format src
pnpm lint --fix
```

### Skill: 项目结构导航
**触发词**: `/structure`, `/navigate`, `/explore`

**知识**:
- `db-query/`: 数据库查询工具
  - `backend/src/`: FastAPI 后端代码
    - `api/`: API 路由
    - `services/`: 业务逻辑
    - `models/`: Pydantic 模型
    - `db/`: 数据库相关（SQLite 模式、迁移）
  - `frontend/src/`: React 前端代码
    - `components/ui/`: 通用 UI 组件
    - `components/features/`: 功能组件
    - `pages/`: 页面组件
    - `hooks/`: 自定义 Hooks
    - `stores/`: Zustand 状态管理
    - `api/`: API 客户端
- `bootcamp-ai/src/project-alpha/`: 票据管理系统
- `specs/`: 项目规格文档
- `.cursor/rules/`: Cursor 规则文件
- `.cursor/commands/`: Cursor 命令定义

**使用场景**:
- 查找特定功能的代码位置
- 理解项目架构
- 添加新功能时确定放置位置

### Skill: 数据库操作
**触发词**: `/postgresql`, `/mysql`, `/database`

**知识**:
- PostgreSQL: 使用 `asyncpg`，支持异步操作
- MySQL: 使用 `aiomysql` + `pymysql`，支持异步操作
- 连接 URL 格式：
  - PostgreSQL: `postgresql://user:password@host:port/database`
  - MySQL: `mysql://user:password@host:port/database` 或 `mysql+pymysql://...`
- 元数据提取：
  - PostgreSQL: 查询 `information_schema`
  - MySQL: 查询 `information_schema`（注意字段名大小写）
- SQL 方言：使用 `sqlglot` 的 `dialect` 参数（`"postgres"` 或 `"mysql"`）

**使用场景**:
- 添加新的数据库连接
- 实现数据库特定的功能
- 调试数据库连接问题

## 使用方式

在 Cursor Agent 对话中使用触发词即可激活对应技能，例如：

- "使用 `/fastapi` 技能创建一个用户认证 API"
- "用 `/react` 技能创建一个用户列表组件"
- "使用 `/db-query` 技能添加 MySQL 支持"
- "用 `/test` 技能为新功能编写测试"

## 注意事项

1. **技能优先级**: 当多个技能相关时，优先使用最具体的技能
2. **技能组合**: 可以同时使用多个技能，例如同时使用 `/fastapi` 和 `/test`
3. **技能更新**: 随着项目发展，技能会持续更新和完善
4. **遵循原则**: 所有技能应用都必须遵循核心原则（简单性、测试先行、明确性）

## 相关文件

- `.cursorrules`: 语言偏好和基本规则
- `.cursor/rules/specify-rules.mdc`: 项目开发指南
- `db-query/constitution.md`: db-query 项目的核心原则
- `.cursorignore`: 忽略文件配置
