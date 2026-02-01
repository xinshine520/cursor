# Project Alpha v2 - 标签分类与 Ticket 管理工具

## 1. 项目概述

### 1.1 项目背景
Project Alpha 是一个简单高效的 Ticket 管理工具，支持通过标签对 Ticket 进行分类、筛选和追踪。用户可以创建 Ticket、管理其生命周期状态，并通过标签系统进行灵活分类。

### 1.2 技术栈
| 层级 | 技术选型 | 版本要求 |
|------|----------|----------|
| 数据库 | PostgreSQL | 18.x |
| 后端 | FastAPI + Python | FastAPI 0.123.x / Python 3.12+ |
| 前端 | TypeScript + Vite + React | Vite 7.x / React 19.x |
| UI框架 | Tailwind CSS + Shadcn/ui | Tailwind 4.x |

### 1.3 项目特点
- 无需用户权限系统，默认单用户模式
- 轻量级设计，专注核心功能
- 以 Ticket 为核心，标签为辅助分类
- 现代化前端界面，响应式设计

---

## 2. 功能需求

### 2.1 Ticket 管理（核心功能）

#### 2.1.1 创建 Ticket
- **描述**: 用户可以创建新的 Ticket
- **输入字段**:
  | 字段 | 类型 | 必填 | 约束 | 说明 |
  |------|------|------|------|------|
  | title | string | ✅ | 1-100字符 | Ticket 标题 |
  | description | string | ❌ | 最大5000字符 | Ticket 详细描述，支持 Markdown |
  | priority | enum | ❌ | low/medium/high/urgent | 优先级，默认 medium |
  | label_ids | UUID[] | ❌ | 有效的标签ID | 关联的标签列表 |
- **业务规则**:
  - 创建时自动设置状态为 `open`（待处理）
  - 创建时自动记录创建时间
  - 可同时关联 0~N 个标签

#### 2.1.2 编辑 Ticket
- **描述**: 用户可以修改已存在 Ticket 的信息
- **可编辑字段**: title, description, priority, label_ids
- **业务规则**:
  - 自动更新修改时间
  - 可随时修改标签关联

#### 2.1.3 删除 Ticket
- **描述**: 用户可以永久删除 Ticket
- **业务规则**:
  - 删除 Ticket 时自动解除与所有标签的关联
  - 需要二次确认弹窗
  - 删除操作不可恢复

#### 2.1.4 完成 Ticket
- **描述**: 用户可以将 Ticket 标记为"已完成"状态
- **业务规则**:
  - 状态从 `open` 变更为 `completed`
  - 自动记录完成时间 `completed_at`
  - 已完成的 Ticket 在列表中显示特殊样式（如灰色背景、删除线、完成图标）

#### 2.1.5 取消完成 Ticket
- **描述**: 用户可以将已完成的 Ticket 恢复为待处理状态
- **业务规则**:
  - 状态从 `completed` 变更为 `open`
  - 清除完成时间 `completed_at`
  - 恢复正常显示样式

#### 2.1.6 按 Title 查询 Ticket
- **描述**: 用户可以通过标题关键词搜索 Ticket
- **搜索特性**:
  - 支持模糊匹配（包含即可）
  - 不区分大小写
  - 支持中文搜索
  - 实时搜索（防抖 300ms）
- **筛选组合**:
  - 可与标签筛选组合使用
  - 可与状态筛选组合使用

### 2.2 标签管理

#### 2.2.1 创建标签
- **描述**: 用户可以创建用于分类 Ticket 的标签
- **输入字段**:
  | 字段 | 类型 | 必填 | 约束 | 说明 |
  |------|------|------|------|------|
  | name | string | ✅ | 1-30字符，唯一 | 标签名称 |
  | color | string | ❌ | HEX格式 #RRGGBB | 标签颜色，默认随机预设色 |
- **业务规则**:
  - 标签名称不能重复（唯一约束）
  - 创建时自动记录创建时间

#### 2.2.2 编辑标签
- **描述**: 用户可以修改标签的名称和颜色
- **可编辑字段**: name, color
- **业务规则**:
  - 修改后的名称不能与其他标签重复
  - 修改颜色后，所有关联 Ticket 的标签显示同步更新

#### 2.2.3 删除标签
- **描述**: 用户可以删除标签
- **业务规则**:
  - 删除标签时，自动解除该标签与所有 Ticket 的关联
  - Ticket 本身不受影响，只是失去该标签
  - 需要二次确认

### 2.3 标签与 Ticket 关联

#### 2.3.1 为 Ticket 添加标签
- **描述**: 用户可以为 Ticket 添加一个或多个标签
- **交互方式**:
  - 在 Ticket 详情/编辑页面选择标签
  - 支持多选
  - 显示已选标签的彩色徽章
- **业务规则**:
  - 同一标签不能重复添加到同一 Ticket
  - 一个 Ticket 可以有多个标签
  - 一个标签可以关联多个 Ticket

#### 2.3.2 移除 Ticket 的标签
- **描述**: 用户可以移除 Ticket 上的某个标签
- **交互方式**:
  - 点击标签徽章上的关闭按钮
  - 在编辑页面取消选择
- **业务规则**:
  - 移除关联不影响标签和 Ticket 本身

### 2.4 按标签查看 Ticket 列表

#### 2.4.1 标签筛选
- **描述**: 用户可以按标签筛选 Ticket 列表
- **筛选模式**:
  - 单标签筛选：显示包含该标签的所有 Ticket
  - 多标签筛选（AND）：显示同时包含所有选中标签的 Ticket
  - "全部"选项：显示所有 Ticket（不筛选）
  - "无标签"选项：显示没有任何标签的 Ticket
- **显示信息**:
  - 每个标签旁显示关联的 Ticket 数量
  - 筛选结果支持分页

---

## 3. 数据库设计

### 3.1 ER 图

```
┌──────────────────────┐       ┌──────────────────┐       ┌────────────────┐
│       tickets        │       │  ticket_labels   │       │     labels     │
├──────────────────────┤       ├──────────────────┤       ├────────────────┤
│ id (PK)              │──────<│ ticket_id (FK)   │       │ id (PK)        │
│ title                │       │ label_id (FK)    │>──────│ name           │
│ description          │       │ created_at       │       │ color          │
│ priority             │       └──────────────────┘       │ created_at     │
│ status               │                                  │ updated_at     │
│ created_at           │                                  └────────────────┘
│ updated_at           │
│ completed_at         │
└──────────────────────┘
```

### 3.2 表结构

#### 3.2.1 tickets 表（Ticket 表）

| 字段名 | 类型 | 约束 | 默认值 | 说明 |
|--------|------|------|--------|------|
| id | UUID | PRIMARY KEY | gen_random_uuid() | 主键 |
| title | VARCHAR(100) | NOT NULL | - | Ticket 标题 |
| description | TEXT | NULLABLE | NULL | 详细描述 |
| priority | VARCHAR(10) | NOT NULL | 'medium' | 优先级: low/medium/high/urgent |
| status | VARCHAR(20) | NOT NULL | 'open' | 状态: open/completed |
| created_at | TIMESTAMPTZ | NOT NULL | CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMPTZ | NOT NULL | CURRENT_TIMESTAMP | 更新时间 |
| completed_at | TIMESTAMPTZ | NULLABLE | NULL | 完成时间 |

```sql
CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(100) NOT NULL,
    description TEXT,
    priority VARCHAR(10) NOT NULL DEFAULT 'medium' 
        CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(20) NOT NULL DEFAULT 'open' 
        CHECK (status IN ('open', 'completed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ
);

-- 触发器：自动更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tickets_updated_at 
    BEFORE UPDATE ON tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### 3.2.2 labels 表（标签表）

| 字段名 | 类型 | 约束 | 默认值 | 说明 |
|--------|------|------|--------|------|
| id | UUID | PRIMARY KEY | gen_random_uuid() | 主键 |
| name | VARCHAR(30) | NOT NULL, UNIQUE | - | 标签名称 |
| color | VARCHAR(7) | NOT NULL | '#6366f1' | 标签颜色(HEX) |
| created_at | TIMESTAMPTZ | NOT NULL | CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMPTZ | NOT NULL | CURRENT_TIMESTAMP | 更新时间 |

```sql
CREATE TABLE labels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(30) NOT NULL UNIQUE,
    color VARCHAR(7) NOT NULL DEFAULT '#6366f1',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_labels_updated_at 
    BEFORE UPDATE ON labels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### 3.2.3 ticket_labels 表（关联表）

| 字段名 | 类型 | 约束 | 默认值 | 说明 |
|--------|------|------|--------|------|
| ticket_id | UUID | FK → tickets(id) ON DELETE CASCADE | - | Ticket ID |
| label_id | UUID | FK → labels(id) ON DELETE CASCADE | - | 标签 ID |
| created_at | TIMESTAMPTZ | NOT NULL | CURRENT_TIMESTAMP | 关联创建时间 |
| - | - | PRIMARY KEY (ticket_id, label_id) | - | 联合主键 |

```sql
CREATE TABLE ticket_labels (
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    label_id UUID NOT NULL REFERENCES labels(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (ticket_id, label_id)
);
```

### 3.3 索引设计

```sql
-- tickets 表索引
CREATE INDEX idx_tickets_title ON tickets USING gin(to_tsvector('simple', title));  -- 全文搜索
CREATE INDEX idx_tickets_title_like ON tickets(title varchar_pattern_ops);          -- LIKE 搜索
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_priority ON tickets(priority);
CREATE INDEX idx_tickets_created_at ON tickets(created_at DESC);
CREATE INDEX idx_tickets_status_created ON tickets(status, created_at DESC);        -- 复合索引

-- labels 表索引
CREATE INDEX idx_labels_name ON labels(name);
CREATE INDEX idx_labels_created_at ON labels(created_at DESC);

-- ticket_labels 表索引（联合主键已自动创建索引）
CREATE INDEX idx_ticket_labels_label_id ON ticket_labels(label_id);
```

### 3.4 初始化数据

```sql
-- 预设标签
INSERT INTO labels (name, color) VALUES
    ('Bug', '#ef4444'),
    ('Feature', '#22c55e'),
    ('Enhancement', '#3b82f6'),
    ('Documentation', '#8b5cf6'),
    ('Question', '#f59e0b'),
    ('Urgent', '#dc2626');
```

---

## 4. API 设计

### 4.1 API 概览

**基础路径**: `/api/v1`

| 模块 | 方法 | 路径 | 描述 |
|------|------|------|------|
| **Ticket** | GET | /tickets | 获取 Ticket 列表（支持筛选、搜索、分页） |
| | GET | /tickets/{id} | 获取单个 Ticket 详情 |
| | POST | /tickets | 创建 Ticket |
| | PUT | /tickets/{id} | 更新 Ticket |
| | DELETE | /tickets/{id} | 删除 Ticket |
| | PATCH | /tickets/{id}/complete | 完成 Ticket |
| | PATCH | /tickets/{id}/reopen | 取消完成 Ticket |
| **Label** | GET | /labels | 获取标签列表 |
| | GET | /labels/{id} | 获取单个标签详情 |
| | POST | /labels | 创建标签 |
| | PUT | /labels/{id} | 更新标签 |
| | DELETE | /labels/{id} | 删除标签 |

### 4.2 Ticket API 详细设计

#### 4.2.1 获取 Ticket 列表

```
GET /api/v1/tickets
```

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| title | string | ❌ | 按标题模糊搜索 |
| status | string | ❌ | 按状态筛选: open / completed / all（默认 all） |
| priority | string | ❌ | 按优先级筛选: low / medium / high / urgent |
| label_ids | string | ❌ | 按标签筛选，多个用逗号分隔 |
| no_label | boolean | ❌ | 筛选无标签的 Ticket |
| sort_by | string | ❌ | 排序字段: created_at / updated_at / priority（默认 created_at） |
| sort_order | string | ❌ | 排序方向: asc / desc（默认 desc） |
| page | integer | ❌ | 页码，从 1 开始（默认 1） |
| page_size | integer | ❌ | 每页数量，1-100（默认 20） |

**响应 200**:
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "修复登录页面样式问题",
      "description": "登录按钮在移动端显示异常...",
      "priority": "high",
      "status": "open",
      "labels": [
        { "id": "uuid", "name": "Bug", "color": "#ef4444" },
        { "id": "uuid", "name": "Urgent", "color": "#dc2626" }
      ],
      "created_at": "2025-01-01T10:00:00Z",
      "updated_at": "2025-01-01T10:00:00Z",
      "completed_at": null
    }
  ],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total": 150,
    "total_pages": 8
  }
}
```

#### 4.2.2 获取 Ticket 详情

```
GET /api/v1/tickets/{id}
```

**响应 200**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "修复登录页面样式问题",
  "description": "# 问题描述\n登录按钮在移动端显示异常...",
  "priority": "high",
  "status": "open",
  "labels": [
    { "id": "uuid", "name": "Bug", "color": "#ef4444" }
  ],
  "created_at": "2025-01-01T10:00:00Z",
  "updated_at": "2025-01-01T10:00:00Z",
  "completed_at": null
}
```

**响应 404**:
```json
{
  "detail": "Ticket not found"
}
```

#### 4.2.3 创建 Ticket

```
POST /api/v1/tickets
```

**请求体**:
```json
{
  "title": "新增用户导出功能",
  "description": "支持导出用户列表为 Excel 格式",
  "priority": "medium",
  "label_ids": ["uuid1", "uuid2"]
}
```

**响应 201**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "新增用户导出功能",
  "description": "支持导出用户列表为 Excel 格式",
  "priority": "medium",
  "status": "open",
  "labels": [
    { "id": "uuid1", "name": "Feature", "color": "#22c55e" }
  ],
  "created_at": "2025-01-01T10:00:00Z",
  "updated_at": "2025-01-01T10:00:00Z",
  "completed_at": null
}
```

**响应 422** (验证失败):
```json
{
  "detail": [
    {
      "loc": ["body", "title"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

#### 4.2.4 更新 Ticket

```
PUT /api/v1/tickets/{id}
```

**请求体**:
```json
{
  "title": "更新后的标题",
  "description": "更新后的描述",
  "priority": "high",
  "label_ids": ["uuid1"]
}
```

**响应 200**: 返回更新后的完整 Ticket 对象

#### 4.2.5 删除 Ticket

```
DELETE /api/v1/tickets/{id}
```

**响应 204**: 无内容

**响应 404**: Ticket 不存在

#### 4.2.6 完成 Ticket

```
PATCH /api/v1/tickets/{id}/complete
```

**响应 200**:
```json
{
  "id": "uuid",
  "status": "completed",
  "completed_at": "2025-01-02T15:30:00Z"
}
```

**响应 400** (已完成):
```json
{
  "detail": "Ticket is already completed"
}
```

#### 4.2.7 取消完成 Ticket

```
PATCH /api/v1/tickets/{id}/reopen
```

**响应 200**:
```json
{
  "id": "uuid",
  "status": "open",
  "completed_at": null
}
```

**响应 400** (未完成):
```json
{
  "detail": "Ticket is not completed"
}
```

### 4.3 Label API 详细设计

#### 4.3.1 获取标签列表

```
GET /api/v1/labels
```

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| with_count | boolean | ❌ | 是否返回每个标签的 Ticket 数量（默认 true） |

**响应 200**:
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Bug",
      "color": "#ef4444",
      "ticket_count": 12,
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    }
  ],
  "total": 6
}
```

#### 4.3.2 创建标签

```
POST /api/v1/labels
```

**请求体**:
```json
{
  "name": "Refactor",
  "color": "#14b8a6"
}
```

**响应 201**: 返回创建的标签对象

**响应 409** (名称重复):
```json
{
  "detail": "Label with this name already exists"
}
```

#### 4.3.3 更新标签

```
PUT /api/v1/labels/{id}
```

**请求体**:
```json
{
  "name": "Bug Fix",
  "color": "#dc2626"
}
```

**响应 200**: 返回更新后的标签对象

#### 4.3.4 删除标签

```
DELETE /api/v1/labels/{id}
```

**响应 204**: 无内容

---

## 5. 前端设计

### 5.1 页面结构

```
┌─────────────────────────────────────────────────────────────────────┐
│                            Header                                   │
│  🎫 TicketHub          [🔍 搜索 Ticket...]        [+ 新建 Ticket]   │
├─────────────────────────────────────────────────────────────────────┤
│              │                                                      │
│   Sidebar    │                   Main Content                       │
│   (240px)    │                                                      │
│              │  ┌────────────────────────────────────────────────┐  │
│  筛选        │  │  状态筛选: [全部] [待处理] [已完成]              │  │
│  ──────────  │  │  排序: [创建时间 ▼]                             │  │
│              │  ├────────────────────────────────────────────────┤  │
│  📁 全部 (45)│  │                                                │  │
│  📁 无标签(3)│  │  ┌──────────────────────────────────────────┐  │  │
│              │  │  │ ☐ 修复登录页面样式问题                    │  │  │
│  标签        │  │  │   [Bug] [Urgent]      🔴 High   2小时前   │  │  │
│  ──────────  │  │  └──────────────────────────────────────────┘  │  │
│  🔴 Bug (12) │  │                                                │  │
│  🟢 Feature  │  │  ┌──────────────────────────────────────────┐  │  │
│     (8)      │  │  │ ☑ 完成用户注册功能                 ✓     │  │  │
│  🔵 Enhance  │  │  │   [Feature]           🟡 Medium  1天前    │  │  │
│     (15)     │  │  └──────────────────────────────────────────┘  │  │
│  🟣 Docs (5) │  │                                                │  │
│  🟡 Question │  │  ... 更多 Tickets ...                          │  │
│     (2)      │  │                                                │  │
│              │  │  ┌──────────────────────────────────────────┐  │  │
│  [+ 新建标签]│  │  │           << 1 2 3 ... 8 >>              │  │  │
│              │  │  └──────────────────────────────────────────┘  │  │
└──────────────┴──┴────────────────────────────────────────────────┴──┘
```

### 5.2 页面路由

| 路由 | 页面 | 描述 |
|------|------|------|
| `/` | 首页 | Ticket 列表，默认显示全部 |
| `/tickets/new` | 新建 Ticket | 创建新 Ticket 的表单页面 |
| `/tickets/:id` | Ticket 详情 | 查看和编辑 Ticket 详情 |
| `/labels` | 标签管理 | 管理所有标签（可选独立页面或侧边栏内联） |

### 5.3 组件设计

#### 5.3.1 布局组件
```
components/
├── layout/
│   ├── Header.tsx           # 顶部导航栏
│   ├── Sidebar.tsx          # 侧边栏（标签筛选）
│   ├── MainLayout.tsx       # 主布局容器
│   └── PageContainer.tsx    # 页面内容容器
```

#### 5.3.2 Ticket 组件
```
components/
├── tickets/
│   ├── TicketList.tsx       # Ticket 列表
│   ├── TicketCard.tsx       # Ticket 卡片（列表项）
│   ├── TicketDetail.tsx     # Ticket 详情面板
│   ├── TicketForm.tsx       # Ticket 创建/编辑表单
│   ├── TicketFilters.tsx    # 状态/优先级筛选器
│   ├── TicketSearch.tsx     # 搜索框
│   └── TicketPagination.tsx # 分页组件
```

#### 5.3.3 Label 组件
```
components/
├── labels/
│   ├── LabelList.tsx        # 标签列表（侧边栏）
│   ├── LabelBadge.tsx       # 标签徽章
│   ├── LabelSelector.tsx    # 标签选择器（多选）
│   ├── LabelForm.tsx        # 标签创建/编辑表单
│   └── LabelColorPicker.tsx # 颜色选择器
```

#### 5.3.4 通用组件
```
components/
├── ui/                      # Shadcn/ui 组件
│   ├── button.tsx
│   ├── input.tsx
│   ├── textarea.tsx
│   ├── dialog.tsx
│   ├── dropdown-menu.tsx
│   ├── badge.tsx
│   ├── card.tsx
│   ├── checkbox.tsx
│   ├── select.tsx
│   ├── toast.tsx
│   └── ...
├── common/
│   ├── ConfirmDialog.tsx    # 确认对话框
│   ├── EmptyState.tsx       # 空状态展示
│   ├── LoadingSpinner.tsx   # 加载动画
│   └── ErrorBoundary.tsx    # 错误边界
```

### 5.4 状态管理

使用 React Query (TanStack Query) 管理服务器状态：

```typescript
// hooks/useTickets.ts
export function useTickets(filters: TicketFilters) {
  return useQuery({
    queryKey: ['tickets', filters],
    queryFn: () => ticketApi.getList(filters),
  });
}

export function useCreateTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ticketApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['labels'] }); // 更新标签计数
    },
  });
}

export function useCompleteTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ticketApi.complete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
}
```

### 5.5 交互设计

#### 5.5.1 Ticket 操作交互

| 操作 | 触发方式 | 反馈 |
|------|----------|------|
| 查看详情 | 点击 Ticket 卡片 | 打开详情侧边抽屉或跳转详情页 |
| 完成 Ticket | 点击复选框 | ✓ 动画 + 卡片样式变化 + Toast 提示 |
| 取消完成 | 点击已选复选框 | 恢复样式 + Toast 提示 |
| 编辑 | 点击编辑按钮或详情页编辑 | 打开编辑表单 Dialog |
| 删除 | 点击删除按钮 | 确认 Dialog → Toast 提示 |
| 搜索 | 输入关键词 | 300ms 防抖 → 实时过滤列表 |

#### 5.5.2 标签操作交互

| 操作 | 触发方式 | 反馈 |
|------|----------|------|
| 按标签筛选 | 点击侧边栏标签 | 高亮选中标签 + 列表刷新 |
| 多标签筛选 | Ctrl/Cmd + 点击 | 多个标签高亮 + 列表刷新 |
| 创建标签 | 点击"+ 新建标签" | 打开表单 Dialog |
| 编辑标签 | 右键菜单或 hover 显示编辑按钮 | 打开编辑 Dialog |
| 删除标签 | 右键菜单 | 确认 Dialog（显示关联 Ticket 数量警告） |

### 5.6 UI/UX 细节

#### 5.6.1 优先级视觉
| 优先级 | 颜色 | 图标 |
|--------|------|------|
| urgent | 🔴 红色 (#dc2626) | 火焰图标 🔥 |
| high | 🟠 橙色 (#f97316) | 向上箭头 ↑ |
| medium | 🟡 黄色 (#eab308) | 横线 — |
| low | 🟢 绿色 (#22c55e) | 向下箭头 ↓ |

#### 5.6.2 状态视觉
| 状态 | 样式 |
|------|------|
| open | 正常显示，左侧空心复选框 |
| completed | 灰色背景、标题删除线、左侧实心勾选框、完成时间显示 |

#### 5.6.3 响应式断点
| 断点 | 宽度 | 布局调整 |
|------|------|----------|
| mobile | < 640px | 侧边栏隐藏为抽屉菜单，单列布局 |
| tablet | 640px - 1024px | 侧边栏收窄，Ticket 卡片自适应 |
| desktop | > 1024px | 完整侧边栏 + 主内容区 |

---

## 6. 项目结构

### 6.1 后端结构

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI 应用入口，CORS 配置
│   ├── config.py               # 配置管理（环境变量）
│   ├── database.py             # 数据库连接、Session 管理
│   │
│   ├── models/                 # SQLAlchemy ORM 模型
│   │   ├── __init__.py
│   │   ├── ticket.py           # Ticket 模型
│   │   ├── label.py            # Label 模型
│   │   └── ticket_label.py     # 关联表模型
│   │
│   ├── schemas/                # Pydantic 模型（请求/响应）
│   │   ├── __init__.py
│   │   ├── ticket.py           # Ticket DTO
│   │   ├── label.py            # Label DTO
│   │   └── common.py           # 通用模型（分页等）
│   │
│   ├── routers/                # API 路由
│   │   ├── __init__.py
│   │   ├── tickets.py          # Ticket 路由
│   │   └── labels.py           # Label 路由
│   │
│   ├── services/               # 业务逻辑层
│   │   ├── __init__.py
│   │   ├── ticket_service.py   # Ticket 业务逻辑
│   │   └── label_service.py    # Label 业务逻辑
│   │
│   └── utils/                  # 工具函数
│       ├── __init__.py
│       └── exceptions.py       # 自定义异常
│
├── alembic/                    # 数据库迁移
│   ├── versions/
│   └── env.py
├── alembic.ini
├── requirements.txt
├── .env.example
└── README.md
```

### 6.2 前端结构

```
frontend/
├── src/
│   ├── main.tsx                # 应用入口
│   ├── App.tsx                 # 根组件、路由配置
│   ├── vite-env.d.ts
│   │
│   ├── components/             # 组件
│   │   ├── ui/                 # Shadcn UI 组件
│   │   ├── layout/             # 布局组件
│   │   ├── tickets/            # Ticket 相关组件
│   │   ├── labels/             # Label 相关组件
│   │   └── common/             # 通用组件
│   │
│   ├── pages/                  # 页面组件
│   │   ├── HomePage.tsx
│   │   ├── TicketDetailPage.tsx
│   │   └── NewTicketPage.tsx
│   │
│   ├── hooks/                  # 自定义 Hooks
│   │   ├── useTickets.ts
│   │   ├── useLabels.ts
│   │   └── useDebounce.ts
│   │
│   ├── services/               # API 服务
│   │   ├── api.ts              # Axios 实例配置
│   │   ├── ticketApi.ts
│   │   └── labelApi.ts
│   │
│   ├── types/                  # TypeScript 类型定义
│   │   ├── ticket.ts
│   │   ├── label.ts
│   │   └── api.ts
│   │
│   ├── lib/                    # 工具函数
│   │   ├── utils.ts            # cn() 等工具
│   │   └── constants.ts        # 常量定义
│   │
│   └── styles/
│       └── globals.css         # 全局样式、Tailwind 导入
│
├── public/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
├── components.json             # Shadcn 配置
└── README.md
```

---

## 7. 非功能需求

### 7.1 性能要求
| 指标 | 要求 |
|------|------|
| 首页加载时间 | < 2 秒 (LCP) |
| API 响应时间 | < 300ms (P95) |
| 搜索响应 | < 500ms |
| 数据容量 | 支持 10,000+ Tickets，1,000+ Labels |

### 7.2 可用性
- 乐观更新：完成/取消完成操作立即反馈，后台异步同步
- 离线提示：网络断开时显示提示
- 错误恢复：API 失败时显示重试按钮

### 7.3 兼容性
- 浏览器：Chrome 90+、Firefox 90+、Safari 15+、Edge 90+
- 响应式：支持 320px - 2560px 屏幕宽度

### 7.4 可维护性
- 代码规范：ESLint + Prettier
- 类型安全：TypeScript 严格模式
- API 文档：FastAPI 自动生成 OpenAPI (Swagger)
- 提交规范：Conventional Commits

---

## 8. 开发计划

### 第一阶段：项目初始化 (Day 1)
- [ ] 初始化后端项目，配置 FastAPI + PostgreSQL
- [ ] 初始化前端项目，配置 Vite + React + Tailwind + Shadcn
- [ ] 设计并创建数据库表（使用 Alembic 迁移）
- [ ] 配置开发环境（Docker Compose 可选）

### 第二阶段：后端核心功能 (Day 2-3)
- [ ] 实现 Ticket CRUD API
- [ ] 实现 Ticket 完成/取消完成 API
- [ ] 实现 Label CRUD API
- [ ] 实现 Ticket 搜索和筛选 API
- [ ] 编写 API 测试

### 第三阶段：前端核心功能 (Day 4-5)
- [ ] 实现主布局（Header + Sidebar + Content）
- [ ] 实现 Ticket 列表页面
- [ ] 实现 Ticket 创建/编辑表单
- [ ] 实现 Ticket 完成/取消完成交互
- [ ] 实现标签筛选功能

### 第四阶段：搜索与完善 (Day 6)
- [ ] 实现 Ticket 搜索功能
- [ ] 实现标签管理功能
- [ ] 响应式适配
- [ ] 加载状态和错误处理

### 第五阶段：优化与测试 (Day 7)
- [ ] UI/UX 优化和动画
- [ ] 性能优化
- [ ] 端到端测试
- [ ] 文档完善

---

## 9. 附录

### 9.1 预设颜色

```typescript
export const PRESET_COLORS = [
  { name: '红色', value: '#ef4444' },
  { name: '橙色', value: '#f97316' },
  { name: '琥珀', value: '#f59e0b' },
  { name: '黄色', value: '#eab308' },
  { name: '青柠', value: '#84cc16' },
  { name: '绿色', value: '#22c55e' },
  { name: '翠绿', value: '#10b981' },
  { name: '青色', value: '#14b8a6' },
  { name: '天蓝', value: '#06b6d4' },
  { name: '蓝色', value: '#3b82f6' },
  { name: '靛蓝', value: '#6366f1' },
  { name: '紫色', value: '#8b5cf6' },
  { name: '紫红', value: '#a855f7' },
  { name: '粉色', value: '#ec4899' },
  { name: '玫红', value: '#f43f5e' },
  { name: '灰色', value: '#6b7280' },
] as const;
```

### 9.2 类型定义

```typescript
// types/ticket.ts
export interface Ticket {
  id: string;
  title: string;
  description: string | null;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'completed';
  labels: Label[];
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface CreateTicketInput {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  label_ids?: string[];
}

export interface UpdateTicketInput {
  title?: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  label_ids?: string[];
}

export interface TicketFilters {
  title?: string;
  status?: 'open' | 'completed' | 'all';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  label_ids?: string[];
  no_label?: boolean;
  sort_by?: 'created_at' | 'updated_at' | 'priority';
  sort_order?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
}

// types/label.ts
export interface Label {
  id: string;
  name: string;
  color: string;
  ticket_count?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateLabelInput {
  name: string;
  color?: string;
}

export interface UpdateLabelInput {
  name?: string;
  color?: string;
}
```

### 9.3 环境变量

```bash
# backend/.env.example
DATABASE_URL=postgresql://user:password@localhost:5432/tickethub
CORS_ORIGINS=http://localhost:5173

# frontend/.env.example
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

### 9.4 常用命令

```bash
# 后端
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000

# 前端
cd frontend
npm install
npm run dev
```

