# Ticket 管理工具 - 详细实现计划 v1.0

## 项目基本信息

**项目名称**: Ticket Management System (TMS)
**技术栈**: FastAPI 0.123.x + PostgreSQL 18.x + React 19.x + TypeScript + Vite 7.x + Tailwind CSS 4.x + Shadcn UI
**开发周期**: 约3.5周
**数据库**: 本地 PostgreSQL (数据库名: tickethubclaude, 用户: postgres, 密码: 123456)

## 阶段一：环境搭建与后端基础 (第1周)

### Day 1-2: 项目�与环境配置

#### 1.1 项目结构创建
```bash
# 在 src 目录下创建主项目目录
mkdir ticket-management
cd ticket-management

# 创建后端目录结构
mkdir -p backend/app/{models,schemas,api/v1,core,crud}
mkdir -p backend/alembic/versions

# 创建前端目录结构
mkdir -p frontend/src/{components/ui,pages,contexts,services,types}
```

#### 1.2 后端环境配置
**任务清单**:
- [ ] 创建 Python 虚拟环境
- [ ] 安装 FastAPI 0.123.x 及相关依赖
- [ ] 配置 requirements.txt
- [ ] 创建 .env 配置文件
- [ ] 设置本地 PostgreSQL 数据库连接

**具体依赖包**:
```
fastapi==0.123.*
uvicorn[standard]
sqlalchemy>=2.0.0
alembic>=1.13.0
psycopg2-binary>=2.9.0
pydantic>=2.0.0
python-dotenv>=1.0.0
```

#### 1.3 数据库初始化
**任务清单**:
- [ ] 创建本地数据库 `tickethubclaude`
- [ ] 创建数据库表结构
- [ ] 设置索引优化
- [ ] 初始化基础数据（预定义标签颜色）

**SQL 初始化脚本**:
```sql
-- 创建数据库（如需要）
CREATE DATABASE tickethubclaude;

-- 连接到数据库后创建表
CREATE TABLE tickets (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    color VARCHAR(7) DEFAULT '#3B82F6',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ticket_tags (
    ticket_id INTEGER REFERENCES tickets(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (ticket_id, tag_id)
);

-- 创建索引
CREATE INDEX idx_tickets_title ON tickets USING gin(to_tsvector('chinese', title));
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_created_at ON tickets(created_at);
CREATE INDEX idx_tags_name ON tags(name);

-- 插入一些示例标签
INSERT INTO tags (name, color) VALUES
('重要', '#EF4444'),
('紧急', '#F59E0B'),
('工作', '#3B82F6'),
('个人', '#8B5CF6'),
('学习', '#10B981'),
('待办', '#6B7280');
```

### Day 3-4: 后端核心模型与数据库连接

#### 2.1 SQLAlchemy 模型创建
**任务清单**:
- [ ] 创建 `models/ticket.py` - Ticket 模型
- [ ] 创建 `models/tag.py` - Tag 模型
- [ ] 设置数据库连接配置 `core/database.py`
- [ ] 配置 Alembic 数据库迁移

**文件结构**:
```
backend/app/
├── models/
│   ├── __init__.py
│   ├── base.py          # 基础模型类
│   ├── ticket.py        # Ticket 模型
│   └── tag.py          # Tag 模型
├── core/
│   ├── __init__.py
│   ├── config.py       # 配置管理
│   └── database.py     # 数据库连接
└── alembic/
    ├── versions/       # 迁移版本文件
    └── alembic.ini     # Alembic 配置
```

#### 2.2 Pydantic Schemas 创建
**任务清单**:
- [ ] 创建 `schemas/ticket.py` - Ticket 数据验证模式
- [ ] 创建 `schemas/tag.py` - Tag 数据验证模式
- [ ] 设置请求/响应模型
- [ ] 配置数据序列化

**Schema 设计**:
```python
# schemas/ticket.py
class TicketBase(BaseModel):
    title: str = Field(..., max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    status: bool = False

class TicketCreate(TicketBase):
    tag_ids: Optional[List[int]] = []

class TicketUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    status: Optional[bool] = None
    tag_ids: Optional[List[int]] = None

class TicketResponse(TicketBase):
    id: int
    created_at: datetime
    updated_at: datetime
    tags: List['TagResponse']
```

### Day 5-7: CRUD 操作与 API 路由

#### 3.1 CRUD 操作实现
**任务清单**:
- [ ] 创建 `crud/ticket.py` - Ticket CRUD 操作
- [ ] 创建 `crud/tag.py` - Tag CRUD 操作
- [ ] 实现复杂查询（搜索、筛选、分页）
- [ ] 添加错误处理和数据验证

**CRUD 功能清单**:
```python
# crud/ticket.py
class TicketCRUD:
    - create_ticket()              # 创建 ticket
    - get_ticket()                 # 获取单个 ticket
    - get_tickets()                # 获取 ticket 列表（支持搜索筛选）
    - update_ticket()              # 更新 ticket
    - delete_ticket()              # 删除 ticket
    - search_tickets()             # 搜索 tickets
    - get_tickets_by_tags()        # 按标签获取 tickets
    - update_ticket_status()       # 更新 ticket 状态

# crud/tag.py
class TagCRUD:
    - create_tag()                 # 创建标签
    - get_tag()                    # 获取单个标签
    - get_tags()                   # 获取标签列表
    - update_tag()                 # 更新标签
    - delete_tag()                 # 删除标签
    - search_tags()                # 搜索标签
```

#### 3.2 API 路由实现
**任务清单**:
- [ ] 创建 `api/v1/tickets.py` - Ticket API 路由
- [ ] 创建 `api/v1/tags.py` - Tag API 路由
- [ ] 创建 `deps.py` - 依赖注入（数据库会话等）
- [ ] 集成路由到主应用 `main.py`

**API 端点清单**:
```python
# api/v1/tickets.py
GET    /api/v1/tickets           # 获取 ticket 列表
POST   /api/v1/tickets           # 创建 ticket
GET    /api/v1/tickets/{id}      # 获取 ticket 详情
PUT    /api/v1/tickets/{id}      # 更新 ticket
DELETE /api/v1/tickets/{id}      # 删除 ticket
PATCH  /api/v1/tickets/{id}/status # 更新 ticket 状态

# api/v1/tags.py
GET    /api/v1/tags              # 获取标签列表
POST   /api/v1/tags              # 创建标签
GET    /api/v1/tags/{id}         # 获取标签详情
PUT    /api/v1/tags/{id}         # 更新标签
DELETE /api/v1/tags/{id}         # 删除标签
```

## 阶段二：前端基础开发 (第2周)

### Day 8-9: React 项目搭建与基础配置

#### 4.1 前端项目初始化
**任务清单**:
- [ ] 创建 Vite + React 19.x + TypeScript 项目
- [ ] 安装并配置 Tailwind CSS 4.x
- [ ] 安装并配置 Shadcn UI 组件库
- [ ] 配置开发环境和构建脚本
- [ ] 设置代码规范（ESLint, Prettier）

**依赖包清单**:
```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^6.8.0",
    "axios": "^1.6.0",
    "@tanstack/react-query": "^5.0.0",
    "lucide-react": "^0.394.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.66",
    "@types/react-dom": "^18.2.22",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.2.2",
    "vite": "^5.2.0",
    "tailwindcss": "^4.0.0-alpha",
    "autoprefixer": "^10.4.14",
    "postcss": "^8.4.24",
    "eslint": "^8.57.0",
    "prettier": "^3.0.0"
  }
}
```

#### 4.2 项目结构搭建
**任务清单**:
- [ ] 创建组件目录结构
- [ ] 设置路由配置
- [ ] 创建 API 服务层
- [ ] 配置全局状态管理

**文件结构**:
```
frontend/src/
├── components/
│   ├── ui/              # Shadcn UI 组件
│   ├── TicketList.tsx   # Ticket 列表组件
│   ├── TicketCard.tsx   # Ticket 卡片组件
│   ├── TicketForm.tsx   # Ticket 表单组件
│   ├── TagSelector.tsx  # 标签选择器
│   ├── SearchBar.tsx    # 搜索栏
│   └── FilterSidebar.tsx # 筛选侧边栏
├── pages/
│   ├── HomePage.tsx     # 主页
│   ├── TagsPage.tsx     # 标签管理页
│   └── TicketDetailPage.tsx # Ticket 详情页
├── contexts/
│   ├── TicketContext.tsx
│   ├── TagContext.tsx
│   └── FilterContext.tsx
├── services/
│   └── api.ts           # API 客户端
├── types/
│   └── index.ts         # TypeScript 类型定义
└── App.tsx              # 主应用组件
```

### Day 10-12: 基础组件开发

#### 5.1 Shadcn UI 组件集成
**任务清单**:
- [ ] 安装配置 Shadcn UI
- [ ] 创建基础 UI 组件（Button, Input, Card, Badge 等）
- [ ] 设置主题和颜色方案
- [ ] 创建自定义组件样式

**需要安装的 Shadcn 组件**:
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add card
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add form
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add sidebar
npx shadcn-ui@latest add scroll-area
```

#### 5.2 核心 Ticket 组件开发
**任务清单**:
- [ ] 开发 `TicketCard` 组件 - 显示单个 ticket
- [ ] 开发 `TicketList` 组件 - 显示 ticket 列表
- [ ] 开发 `TicketForm` 组件 - 创建/编辑 ticket 表单
- [ ] 实现 ticket 状态切换功能

**组件功能要求**:
```typescript
// TicketCard 组件功能
- 显示 ticket 标题、描述、状态
- 显示关联的标签
- 支持快速切换完成状态
- 支持点击编辑和删除操作

// TicketList 组件功能
- 分页显示 ticket 列表
- 支持排序（创建时间、更新时间、标题）
- 显示 loading 状态
- 空状态处理

// TicketForm 组件功能
- 创建和编辑 ticket
- 标题和描述输入验证
- 标签选择器集成
- 表单提交处理
```

#### 5.3 标签系统组件
**任务清单**:
- [ ] 开发 `TagSelector` 组件 - 标签选择器
- [ ] 开发 `TagList` 组件 - 标签列表显示
- [ ] 实现标签创建和编辑功能
- [ ] 设置标签颜色选择器

**组件功能要求**:
```typescript
// TagSelector 组件功能
- 搜索现有标签
- 多选标签支持
- 创建新标签功能
- 标签颜色显示

// TagList 组件功能
- 显示所有标签
- 支持编辑和删除
- 显示每个标签的 ticket 数量
- 颜色管理
```

### Day 13-14: 页面集成与状态管理

#### 6.1 页面组件开发
**任务清单**:
- [ ] 开发 `HomePage` - 主页面集成
- [ ] 开发 `TagsPage` - 标签管理页面
- [ ] 开发 `TicketDetailPage` - Ticket 详情页面
- [ ] 实现路由导航

**页面功能要求**:
```typescript
// HomePage 功能
- 顶部搜索栏
- 侧边标签筛选器
- 主要 ticket 列表区域
- 创建 ticket 悬浮按钮

// TagsPage 功能
- 标签列表展示
- 标签创建表单
- 标签编辑功能
- 标签使用统计

// TicketDetailPage 功能
- Ticket 完整信息展示
- 关联标签管理
- 状态切换操作
- 返回列表功能
```

#### 6.2 状态管理实现
**任务清单**:
- [ ] 创建 `TicketContext` - tickets 全局状态
- [ ] 创建 `TagContext` - tags 全局状态
- [ ] 创建 `FilterContext` - 筛选条件状态
- [ ] 集成 React Query 进行数据获取

**状态管理设计**:
```typescript
// TicketContext
interface TicketState {
  tickets: Ticket[]
  currentTicket: Ticket | null
  loading: boolean
  error: string | null
}

// TagContext
interface TagState {
  tags: Tag[]
  selectedTags: number[]
  loading: boolean
  error: string | null
}

// FilterContext
interface FilterState {
  searchQuery: string
  statusFilter: 'all' | 'completed' | 'pending'
  sortBy: 'created_at' | 'updated_at' | 'title'
  sortOrder: 'asc' | 'desc'
  currentPage: number
}
```

## 阶段三：高级功能与优化 (第3周)

### Day 15-17: 搜索与筛选功能

#### 7.1 后端搜索功能优化
**任务清单**:
- [ ] 优化数据库搜索查询
- [ ] 实现全文搜索功能
- [ ] 添加搜索结果高亮
- [ ] 实现复合筛选逻辑

**搜索功能实现**:
```python
# 搜索功能要求
- 支持中文分词搜索
- 搜索结果按相关性排序
- 支持标签组合筛选（AND/OR 逻辑）
- 搜索性能优化（索引使用）
```

#### 7.2 前端搜索界面
**任务清单**:
- [ ] 实现实时搜索功能
- [ ] 开发高级筛选界面
- [ ] 添加搜索历史记录
- [ ] 实现筛选条件保存

**搜索界面功能**:
```typescript
// SearchBar 组件
- 实时搜索建议
- 搜索历史显示
- 清除搜索功能
- 键盘快捷键支持

// FilterSidebar 组件
- 标签多选筛选
- 状态筛选器
- 排序选项
- 筛选条件重置
```

### Day 18-19: 响应式设计

#### 8.1 移动端适配
**任务清单**:
- [ ] 设计移动端布局
- [ ] 实现触摸友好的交互
- [ ] 优化移动端性能
- [ ] 添加移动端特有的功能

**响应式设计要求**:
```css
/* 断点设计 */
- 手机: < 640px
- 平板: 640px - 1024px
- 桌面: > 1024px

/* 移动端优化 */
- 侧边栏变为抽屉式
- 卡片列表改为单列
- 触摸优化的按钮尺寸
- 手势操作支持
```

#### 8.2 UI/UX 优化
**任务清单**:
- [ ] 添加动画和过渡效果
- [ ] 优化加载状态显示
- [ ] 添加空状态插画
- [ ] 实现暗黑模式支持

**用户体验优化**:
```typescript
// 动画效果
- 页面切换动画
- 组件加载动画
- 状态变化过渡
- 手势反馈

// 暗黑模式
- 自动检测系统主题
- 手动切换主题
- 颜色对比度优化
- 平滑过渡效果
```

### Day 20-21: 性能优化与错误处理

#### 9.1 性能优化
**任务清单**:
- [ ] 实现虚拟滚动（大量数据时）
- [ ] 添加图片懒加载
- [ ] 优化 API 调用（防抖、缓存）
- [ ] 实现 Code Splitting

**性能优化策略**:
```typescript
// 前端优化
- React.memo 优化组件渲染
- useMemo 优化计算结果
- useCallback 优化函数引用
- 虚拟滚动处理大数据

// 后端优化
- 数据库查询优化
- 添加适当缓存
- API 响应压缩
- 分页查询优化
```

#### 9.2 错误处理
**任务清单**:
- [ ] 实现全局错误边界
- [ ] 添加 API 错误处理
- [ ] 创建友好的错误提示
- [ ] 实现错误日志记录

**错误处理策略**:
```typescript
// 前端错误处理
- React Error Boundary
- API 请求错误处理
- 网络错误重试机制
- 用户友好的错误提示

// 后端错误处理
- 统一错误响应格式
- 数据库错误处理
- 输入验证错误
- 日志记录系统
```

## 阶段四：测试与部署 (最后3天)

### Day 22-23: 测试

#### 10.1 后端测试
**任务清单**:
- [ ] 编写单元测试（pytest）
- [ ] 编写 API 集成测试
- [ ] 数据库操作测试
- [ ] 性能测试

**测试覆盖内容**:
```python
# 单元测试
- CRUD 操作功能测试
- 数据验证测试
- 业务逻辑测试
- 错误处理测试

# 集成测试
- API 端点测试
- 数据库连接测试
- 复杂查询测试
- 并发操作测试
```

#### 10.2 前端测试
**任务清单**:
- [ ] 组件单元测试（Jest + React Testing Library）
- [ ] 用户交互测试
- [ ] 端到端测试（Playwright）
- [ ] 性能测试

**测试覆盖内容**:
```typescript
// 组件测试
- 组件渲染测试
- 用户交互测试
- 状态管理测试
- 错误边界测试

// E2E 测试
- 完整用户流程测试
- 跨浏览器兼容性测试
- 响应式设计测试
- 性能基准测试
```

### Day 24: 部署配置

#### 11.1 本地部署

#### 11.2 文档完善
**任务清单**:
- [ ] 编写用户使用文档
- [ ] 创建开发者文档
- [ ] 添加 API 文档
- [ ] 编写部署指南

**文档结构**:
```
docs/
├── README.md              # 项目总览
├── user-guide.md          # 用户使用指南
├── developer-guide.md     # 开发者文档
├── api-documentation.md   # API 文档
├── deployment.md          # 部署指南
└── troubleshooting.md     # 故障排除
```

## 技术实现细节

### 数据库优化策略

1. **索引优化**:
   - 为常用查询字段创建索引
   - 使用复合索引优化多字段查询
   - 定期分析和优化查询性能

2. **查询优化**:
   - 使用 JOIN 替代多次查询
   - 实现查询结果缓存
   - 优化分页查询

### 前端架构设计

1. **组件设计原则**:
   - 单一职责原则
   - 可复用性设计
   - Props 类型安全

2. **状态管理策略**:
   - 本地状态与全局状态分离
   - 使用 React Query 管理服务器状态
   - Context API 管理应用状态

### 安全考虑

1. **输入验证**:
   - 前端表单验证
   - 后端数据验证
   - SQL 注入防护

2. **错误处理**:
   - 统一错误响应格式
   - 敏感信息过滤
   - 错误日志记录

## 质量保证

### 代码质量
- TypeScript 严格模式
- ESLint 代码规范检查
- Prettier 代码格式化
- 代码审查流程

### 性能指标
- 页面加载时间 < 2秒
- API 响应时间 < 500ms
- 首次内容绘制 (FCP) < 1秒
- 最大内容绘制 (LCP) < 2.5秒

### 测试覆盖率
- 单元测试覆盖率 > 80%
- 集成测试覆盖主要业务流程
- E2E 测试覆盖关键用户场景

## 风险评估与应对

### 技术风险
1. **数据库性能**: 大量数据时的查询性能
   - 应对: 索引优化、查询优化、分页处理

2. **前端性能**: 大量 ticket 列表的渲染性能
   - 应对: 虚拟滚动、懒加载、代码分割

3. **跨浏览器兼容性**: 不同浏览器的兼容性问题
   - 应对: 使用现代 CSS 和 JavaScript，提供 Polyfill

### 进度风险
1. **功能复杂度**: 某些功能可能比预期复杂
   - 应对: 采用 MVP 方式，优先实现核心功能

2. **技术学习曲线**: 新技术栈的学习时间
   - 应对: 提前技术调研，准备学习资料

## 交付物清单

### 代码交付
- [ ] 完整的后端 API 代码
- [ ] 完整的前端应用代码
- [ ] 数据库初始化脚本
- [ ] 部署配置文件

### 文档交付
- [ ] 需求与设计文档
- [ ] API 接口文档
- [ ] 用户使用手册
- [ ] 部署运维文档

### 测试交付
- [ ] 单元测试代码
- [ ] 集成测试代码
- [ ] E2E 测试代码
- [ ] 测试报告

这个详细的实现计划涵盖了从项目初始化到最终部署的完整流程，每个阶段都有明确的任务清单和验收标准，确保项目能够按计划高质量完成。