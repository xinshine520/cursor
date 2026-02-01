# Project Alpha - 标签分类与 Ticket 管理工具

## 1. 项目概述

### 1.1 项目背景
Project Alpha 是一个简单高效的标签分类和 Ticket 管理工具，帮助用户通过标签对 Ticket 进行分类、管理和追踪。

### 1.2 技术栈
| 层级 | 技术选型 | 版本要求 |
|------|----------|----------|
| 数据库 | PostgreSQL | 18.x (2025最新稳定版) |
| 后端 | FastAPI + Python | FastAPI 0.123.x / Python 3.12 |
| 前端 | TypeScript + Vite + React | Vite 7.x / React 19.x |
| UI框架 | Tailwind CSS + Shadcn/ui | Tailwind 4.1 |

### 1.3 项目特点
- 无需用户权限系统，默认单用户模式
- 轻量级设计，专注核心功能
- 现代化前端界面

---

## 2. 功能需求

### 2.1 标签管理

#### 2.1.1 创建标签
- **描述**: 用户可以创建新的标签
- **输入字段**:
  - `name`: 标签名称 (必填，最大50字符，唯一)
  - `color`: 标签颜色 (可选，默认为系统预设颜色，HEX格式)
  - `description`: 标签描述 (可选，最大200字符)
- **业务规则**:
  - 标签名称不能重复
  - 创建时自动记录创建时间

#### 2.1.2 编辑标签
- **描述**: 用户可以修改已存在标签的信息
- **可编辑字段**: name, color, description
- **业务规则**:
  - 修改后的标签名称不能与其他标签重复
  - 自动更新修改时间

#### 2.1.3 删除标签
- **描述**: 用户可以删除标签
- **业务规则**:
  - 删除标签时，自动解除该标签与所有 Ticket 的关联
  - 需要二次确认

#### 2.1.4 完成/取消完成标签
- **描述**: 用户可以标记标签为"已完成"状态或恢复为"进行中"状态
- **业务规则**:
  - 已完成的标签在列表中显示特殊样式（如灰色/删除线）
  - 可随时切换状态

#### 2.1.5 查询标签
- **描述**: 用户可以按条件搜索标签
- **搜索条件**:
  - `title`: 按标签名称模糊搜索
  - `status`: 按状态筛选 (全部/进行中/已完成)
- **排序**: 默认按创建时间倒序

### 2.2 Ticket 管理

#### 2.2.1 添加 Ticket 到标签
- **描述**: 用户可以在指定标签下创建新的 Ticket
- **输入字段**:
  - `title`: Ticket 标题 (必填，最大100字符)
  - `content`: Ticket 内容 (可选，最大2000字符)
  - `priority`: 优先级 (可选，low/medium/high，默认 medium)
- **业务规则**:
  - 一个 Ticket 可以关联多个标签
  - 创建时自动记录创建时间

#### 2.2.2 删除 Ticket
- **描述**: 用户可以删除 Ticket
- **业务规则**:
  - 删除 Ticket 时自动解除与所有标签的关联
  - 需要二次确认

#### 2.2.3 按标签查看 Ticket 列表
- **描述**: 用户选择某个标签后，显示该标签下的所有 Ticket
- **显示信息**: 标题、优先级、创建时间
- **排序**: 默认按创建时间倒序

---

## 3. 数据库设计

### 3.1 ER 图

```
┌─────────────┐       ┌──────────────────┐       ┌─────────────┐
│   labels    │       │  label_tickets   │       │   tickets   │
├─────────────┤       ├──────────────────┤       ├─────────────┤
│ id (PK)     │──────<│ label_id (FK)    │>──────│ id (PK)     │
│ name        │       │ ticket_id (FK)   │       │ title       │
│ color       │       │ created_at       │       │ content     │
│ description │       └──────────────────┘       │ priority    │
│ status      │                                  │ created_at  │
│ created_at  │                                  │ updated_at  │
│ updated_at  │                                  └─────────────┘
└─────────────┘
```

### 3.2 表结构

#### 3.2.1 labels 表 (标签表)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | 主键 |
| name | VARCHAR(50) | NOT NULL, UNIQUE | 标签名称 |
| color | VARCHAR(7) | DEFAULT '#6366f1' | 标签颜色(HEX) |
| description | VARCHAR(200) | | 标签描述 |
| status | VARCHAR(20) | DEFAULT 'active' | 状态: active/completed |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 更新时间 |

#### 3.2.2 tickets 表 (Ticket表)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | 主键 |
| title | VARCHAR(100) | NOT NULL | 标题 |
| content | TEXT | | 内容 |
| priority | VARCHAR(10) | DEFAULT 'medium' | 优先级: low/medium/high |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 更新时间 |

#### 3.2.3 label_tickets 表 (关联表)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| label_id | UUID | FOREIGN KEY REFERENCES labels(id) ON DELETE CASCADE | 标签ID |
| ticket_id | UUID | FOREIGN KEY REFERENCES tickets(id) ON DELETE CASCADE | Ticket ID |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 关联时间 |
| | | PRIMARY KEY (label_id, ticket_id) | 联合主键 |

### 3.3 索引设计

```sql
-- labels 表索引
CREATE INDEX idx_labels_name ON labels(name);
CREATE INDEX idx_labels_status ON labels(status);
CREATE INDEX idx_labels_created_at ON labels(created_at DESC);

-- tickets 表索引
CREATE INDEX idx_tickets_title ON tickets(title);
CREATE INDEX idx_tickets_created_at ON tickets(created_at DESC);

-- label_tickets 表索引
CREATE INDEX idx_label_tickets_label_id ON label_tickets(label_id);
CREATE INDEX idx_label_tickets_ticket_id ON label_tickets(ticket_id);
```

---

## 4. API 设计

### 4.1 标签相关 API

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/labels | 获取标签列表 |
| GET | /api/labels/{id} | 获取单个标签详情 |
| POST | /api/labels | 创建标签 |
| PUT | /api/labels/{id} | 更新标签 |
| DELETE | /api/labels/{id} | 删除标签 |
| PATCH | /api/labels/{id}/toggle-status | 切换标签完成状态 |

#### 4.1.1 获取标签列表
```
GET /api/labels?title={title}&status={status}
```

**查询参数**:
- `title` (可选): 按名称模糊搜索
- `status` (可选): 按状态筛选 (active/completed)

**响应示例**:
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Bug修复",
      "color": "#ef4444",
      "description": "需要修复的Bug",
      "status": "active",
      "ticket_count": 5,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 1
}
```

#### 4.1.2 创建标签
```
POST /api/labels
```

**请求体**:
```json
{
  "name": "新功能",
  "color": "#22c55e",
  "description": "新功能开发任务"
}
```

#### 4.1.3 切换标签状态
```
PATCH /api/labels/{id}/toggle-status
```

**响应示例**:
```json
{
  "id": "uuid",
  "status": "completed"
}
```

### 4.2 Ticket 相关 API

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/tickets | 获取 Ticket 列表 |
| GET | /api/tickets/{id} | 获取单个 Ticket 详情 |
| POST | /api/tickets | 创建 Ticket |
| PUT | /api/tickets/{id} | 更新 Ticket |
| DELETE | /api/tickets/{id} | 删除 Ticket |
| GET | /api/labels/{label_id}/tickets | 获取标签下的 Ticket 列表 |
| POST | /api/tickets/{id}/labels | 为 Ticket 添加标签 |
| DELETE | /api/tickets/{id}/labels/{label_id} | 移除 Ticket 的标签 |

#### 4.2.1 获取标签下的 Ticket 列表
```
GET /api/labels/{label_id}/tickets
```

**响应示例**:
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "修复登录页面样式问题",
      "content": "登录按钮在移动端显示异常",
      "priority": "high",
      "labels": [
        {"id": "uuid", "name": "Bug修复", "color": "#ef4444"}
      ],
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 1
}
```

#### 4.2.2 创建 Ticket
```
POST /api/tickets
```

**请求体**:
```json
{
  "title": "新增用户导出功能",
  "content": "支持导出用户列表为Excel格式",
  "priority": "medium",
  "label_ids": ["uuid1", "uuid2"]
}
```

---

## 5. 前端页面设计

### 5.1 页面结构

```
┌────────────────────────────────────────────────────────────┐
│                        Header                              │
│  Logo                                    [搜索框]          │
├────────────────────────────────────────────────────────────┤
│          │                                                 │
│  侧边栏   │              主内容区                           │
│          │                                                 │
│ [标签列表]│  ┌─────────────────────────────────────────┐   │
│          │  │  标签详情 / Ticket 列表                   │   │
│ ● 全部    │  │                                         │   │
│ ● Bug修复 │  │  [Ticket卡片] [Ticket卡片] [Ticket卡片]  │   │
│ ● 新功能  │  │                                         │   │
│ ○ 已完成  │  │                                         │   │
│          │  └─────────────────────────────────────────┘   │
│          │                                                 │
│ [+新建标签]│                                                │
└────────────────────────────────────────────────────────────┘
```

### 5.2 页面列表

| 页面 | 路由 | 描述 |
|------|------|------|
| 首页 | / | 显示所有标签和 Ticket 概览 |
| 标签详情 | /labels/{id} | 显示单个标签下的所有 Ticket |

### 5.3 组件设计

#### 5.3.1 核心组件
- `LabelList`: 标签列表组件（侧边栏）
- `LabelCard`: 标签卡片组件
- `LabelForm`: 标签创建/编辑表单
- `TicketList`: Ticket 列表组件
- `TicketCard`: Ticket 卡片组件
- `TicketForm`: Ticket 创建/编辑表单
- `SearchBar`: 搜索栏组件
- `ConfirmDialog`: 确认对话框组件

#### 5.3.2 UI 组件 (Shadcn/ui)
- Button, Input, Textarea
- Card, Dialog, DropdownMenu
- Badge, Tooltip
- Select, Checkbox
- Toast (通知提示)

### 5.4 交互设计

#### 5.4.1 标签操作
- 点击标签名称 → 查看该标签下的 Ticket 列表
- 点击编辑图标 → 打开编辑弹窗
- 点击删除图标 → 显示确认对话框
- 点击完成图标 → 切换完成状态

#### 5.4.2 Ticket 操作
- 点击 Ticket 卡片 → 展开详情
- 点击编辑 → 打开编辑弹窗
- 点击删除 → 显示确认对话框
- 拖拽标签 → 为 Ticket 添加/移除标签

---

## 6. 项目结构

### 6.1 后端结构
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI 应用入口
│   ├── config.py            # 配置管理
│   ├── database.py          # 数据库连接
│   ├── models/              # SQLAlchemy 模型
│   │   ├── __init__.py
│   │   ├── label.py
│   │   └── ticket.py
│   ├── schemas/             # Pydantic 模型
│   │   ├── __init__.py
│   │   ├── label.py
│   │   └── ticket.py
│   ├── routers/             # API 路由
│   │   ├── __init__.py
│   │   ├── labels.py
│   │   └── tickets.py
│   └── services/            # 业务逻辑
│       ├── __init__.py
│       ├── label_service.py
│       └── ticket_service.py
├── alembic/                 # 数据库迁移
├── requirements.txt
└── README.md
```

### 6.2 前端结构
```
frontend/
├── src/
│   ├── main.tsx             # 应用入口
│   ├── App.tsx              # 根组件
│   ├── components/          # 组件
│   │   ├── ui/              # Shadcn UI 组件
│   │   ├── labels/          # 标签相关组件
│   │   └── tickets/         # Ticket 相关组件
│   ├── hooks/               # 自定义 Hooks
│   ├── lib/                 # 工具函数
│   ├── services/            # API 服务
│   ├── types/               # TypeScript 类型
│   └── styles/              # 样式文件
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 7. 非功能需求

### 7.1 性能要求
- 页面首次加载时间 < 2秒
- API 响应时间 < 500ms
- 支持至少 1000 个标签和 10000 个 Ticket

### 7.2 兼容性
- 支持 Chrome、Firefox、Safari、Edge 最新版本
- 响应式设计，支持桌面端和移动端

### 7.3 可维护性
- 代码符合 ESLint/Prettier 规范
- 关键功能有单元测试覆盖
- API 有 OpenAPI 文档

---

## 8. 开发计划

### 第一阶段：基础搭建 (Day 1-2)
- [ ] 初始化后端项目，配置 FastAPI
- [ ] 初始化前端项目，配置 Vite + Tailwind + Shadcn
- [ ] 设计并创建数据库表
- [ ] 实现数据库连接和基础模型

### 第二阶段：标签功能 (Day 3-4)
- [ ] 实现标签 CRUD API
- [ ] 实现标签列表前端页面
- [ ] 实现标签创建/编辑/删除功能
- [ ] 实现标签状态切换功能

### 第三阶段：Ticket 功能 (Day 5-6)
- [ ] 实现 Ticket CRUD API
- [ ] 实现 Ticket 列表前端页面
- [ ] 实现 Ticket 与标签的关联功能
- [ ] 实现按标签查看 Ticket 功能

### 第四阶段：搜索与优化 (Day 7)
- [ ] 实现搜索功能
- [ ] UI 优化和响应式适配
- [ ] 测试和 Bug 修复

---

## 9. 附录

### 9.1 预设颜色列表
```javascript
const PRESET_COLORS = [
  '#ef4444', // 红色
  '#f97316', // 橙色
  '#eab308', // 黄色
  '#22c55e', // 绿色
  '#14b8a6', // 青色
  '#3b82f6', // 蓝色
  '#6366f1', // 靛蓝
  '#a855f7', // 紫色
  '#ec4899', // 粉色
  '#6b7280', // 灰色
];
```

### 9.2 状态枚举
```typescript
enum LabelStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed'
}

enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}
```

