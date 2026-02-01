# Ticket 管理工具 - 需求与设计文档 v1.0

## 项目概述

### 项目名称
Ticket Management System (TMS)

### 项目描述
一个基于标签分类的简单 ticket 管理工具，支持创建、编辑、删除、完成 ticket，以及通过标签进行分类和检索功能。

### 技术栈
- **后端**: FastAPI 0.123.x + PostgreSQL 18.x
- **前端**: React 19.x + TypeScript + Vite 7.x + Tailwind CSS 4.x + Shadcn UI
- **数据库**: PostgreSQL 18.x

## 功能需求

### 1. Ticket 核心功能

#### 1.1 Ticket 管理
- **创建 Ticket**: 支持输入标题、描述、初始标签
- **编辑 Ticket**: 修改标题、描述、标签
- **删除 Ticket**: 删除 ticket 及相关标签关联
- **完成/取消完成**: 标记 ticket 状态为完成或未完成
- **查看 Ticket 详情**: 显示 ticket 完整信息

#### 1.2 Ticket 数据结构
- **ID**: 唯一标识符
- **标题**: 必填，最大长度 200 字符
- **描述**: 可选，最大长度 2000 字符
- **状态**: 完成/未完成
- **创建时间**: 自动生成
- **更新时间**: 自动更新
- **标签**: 多对多关联

### 2. 标签系统

#### 2.1 标签管理
- **添加标签**: 为 ticket 添加新标签或现有标签
- **删除标签**: 移除 ticket 的特定标签
- **标签建议**: 基于现有标签提供自动补全

#### 2.2 标签数据结构
- **ID**: 唯一标识符
- **名称**: 必填，最大长度 50 字符，全局唯一
- **颜色**: 标签显示颜色（预定义颜色集）
- **创建时间**: 自动生成

### 3. 查询与筛选

#### 3.1 Ticket 查询
- **按标题搜索**: 支持模糊搜索，实时返回结果
- **按标签筛选**: 单标签或多标签筛选（AND/OR 逻辑）
- **按状态筛选**: 筛选已完成/未完成 ticket
- **组合查询**: 支持多条件组合查询

#### 3.2 排序功能
- **按创建时间排序**: 升序/降序
- **按更新时间排序**: 升序/降序
- **按标题排序**: 字母顺序

## 系统设计

### 1. 数据库设计

#### 1.1 表结构

**tickets 表**
```sql
CREATE TABLE tickets (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status BOOLEAN DEFAULT FALSE, -- FALSE: 未完成, TRUE: 已完成
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**tags 表**
```sql
CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    color VARCHAR(7) DEFAULT '#3B82F6', -- 十六进制颜色值
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**ticket_tags 表（多对多关联）**
```sql
CREATE TABLE ticket_tags (
    ticket_id INTEGER REFERENCES tickets(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (ticket_id, tag_id)
);
```

#### 1.2 索引设计
```sql
-- 提高查询性能
CREATE INDEX idx_tickets_title ON tickets USING gin(to_tsvector('chinese', title));
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_created_at ON tickets(created_at);
CREATE INDEX idx_tags_name ON tags(name);
```

### 2. API 设计

#### 2.1 Ticket API

**获取 Ticket 列表**
```
GET /api/tickets
Query Parameters:
- search: string (标题搜索)
- tags: string[] (标签ID数组)
- status: boolean (状态筛选)
- sort: string (排序字段: created_at, updated_at, title)
- order: string (排序方向: asc, desc)
- page: int (页码，默认1)
- limit: int (每页数量，默认20)
```

**创建 Ticket**
```
POST /api/tickets
Body:
{
  "title": "string",
  "description": "string",
  "tag_ids": number[] // 可选
}
```

**获取 Ticket 详情**
```
GET /api/tickets/{id}
```

**更新 Ticket**
```
PUT /api/tickets/{id}
Body:
{
  "title": "string",
  "description": "string",
  "status": boolean,
  "tag_ids": number[] // 可选，会替换现有标签
}
```

**删除 Ticket**
```
DELETE /api/tickets/{id}
```

#### 2.2 Tag API

**获取标签列表**
```
GET /api/tags
Query Parameters:
- search: string (标签名称搜索)
```

**获取标签详情**
```
GET /api/tags/{id}
```

**创建标签**
```
POST /api/tags
Body:
{
  "name": "string",
  "color": "string" // 可选，默认颜色
}
```

**更新标签**
```
PUT /api/tags/{id}
Body:
{
  "name": "string",
  "color": "string"
}
```

**删除标签**
```
DELETE /api/tags/{id}
```

### 3. 前端设计

#### 3.1 页面结构

**主页 (/)**
- 顶部搜索栏
- 侧边标签过滤器
- 主要 ticket 列表区域
- 创建 ticket 按钮

**标签管理页面 (/tags)**
- 标签列表
- 添加/编辑标签功能

#### 3.2 组件设计

**核心组件**
- `TicketList`: ticket 列表组件
- `TicketCard`: ticket 卡片组件
- `TicketForm`: 创建/编辑 ticket 表单
- `TagSelector`: 标签选择器组件
- `TagList`: 标签列表组件
- `SearchBar`: 搜索栏组件
- `FilterSidebar`: 筛选侧边栏

#### 3.3 状态管理

使用 React Context + useReducer 管理全局状态：
- `TicketContext`: ticket 列表和详情状态
- `TagContext`: 标签列表状态
- `FilterContext`: 搜索和筛选条件状态

#### 3.4 UI 设计原则

**设计风格**
- 简洁现代的界面设计
- 响应式布局，支持移动端
- 使用 Tailwind CSS 实现快速样式开发
- Shadcn UI 提供基础组件

**颜色方案**
- 主色调：蓝色系 (#3B82F6)
- 完成状态：绿色 (#10B981)
- 标签颜色：预定义12种颜色

## 项目结构

```
ticket-management/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── ticket.py
│   │   │   └── tag.py
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── ticket.py
│   │   │   └── tag.py
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── v1/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── tickets.py
│   │   │   │   └── tags.py
│   │   │   └── deps.py
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── config.py
│   │   │   └── database.py
│   │   └── crud/
│   │       ├── __init__.py
│   │       ├── ticket.py
│   │       └── tag.py
│   ├── requirements.txt
│   └── alembic/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/         # Shadcn UI 组件
│   │   │   ├── TicketList.tsx
│   │   │   ├── TicketCard.tsx
│   │   │   ├── TicketForm.tsx
│   │   │   ├── TagSelector.tsx
│   │   │   └── ...
│   │   ├── pages/
│   │   │   ├── HomePage.tsx
│   │   │   └── TagsPage.tsx
│   │   ├── contexts/
│   │   │   ├── TicketContext.tsx
│   │   │   └── TagContext.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── main.tsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── docker-compose.yml
├── README.md
└── docs/
```

## 部署方案

### 1. 开发环境

#### 1.1 本地部署

使用本地 Postgres 数据库
- 数据库名称：tickethubclaude
- 用户名称：postgres
- 用户密码：123456

## 开发计划

### Phase 1: 后端基础功能 (1周)
- 数据库设计和初始化
- FastAPI 项目搭建
- Ticket CRUD API 实现
- Tag CRUD API 实现
- API 文档生成

### Phase 2: 前端基础界面 (1周)
- React 项目搭建
- 基础组件开发
- Ticket 列表和表单页面
- 标签管理页面

### Phase 3: 高级功能 (1周)
- 搜索和筛选功能
- 响应式设计
- 性能优化
- 错误处理

### Phase 4: 测试和部署 (3天)
- 单元测试
- 集成测试
- 部署配置
- 文档完善

## 技术考虑

### 1. 性能优化
- 数据库查询优化
- 前端虚拟滚动（大量数据时）
- 图片和资源压缩
- CDN 部署

### 2. 安全性
- SQL 注入防护
- XSS 防护
- 输入验证和清理
- HTTPS 部署

### 3. 可扩展性
- API 版本控制
- 模块化设计
- 数据库索引优化
- 缓存策略

## 验收标准

1. **功能完整性**: 所有需求功能正常工作
2. **用户体验**: 界面友好，操作流畅
3. **性能**: 页面加载时间 < 2秒，API 响应时间 < 500ms
4. **兼容性**: 支持现代浏览器（Chrome、Firefox、Safari、Edge）
5. **代码质量**: 代码整洁，有适当的注释和文档
6. **测试覆盖**: 核心功能有测试覆盖