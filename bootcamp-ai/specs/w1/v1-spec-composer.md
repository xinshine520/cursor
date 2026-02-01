# Project Alpha - Ticket 管理系统需求与设计文档

## 文档信息
- **项目名称**: Project Alpha - Ticket 管理系统
- **文档版本**: v1.0
- **创建日期**: 2025-01-16
- **目标**: 构建一个简单、高效的基于标签分类的 Ticket 管理工具

---

## 1. 项目概述

### 1.1 项目简介
Project Alpha 是一个轻量级的 Ticket 管理系统，帮助用户通过标签对工作任务进行分类、追踪和管理。系统采用现代化技术栈，提供流畅的用户体验。

### 1.2 核心特点
- **简单易用**: 无需复杂的用户权限管理，默认单用户模式
- **灵活分类**: 通过多标签系统实现灵活的 Ticket 分类
- **高效检索**: 支持快速搜索和筛选功能
- **状态追踪**: 清晰的 Ticket 生命周期管理

### 1.3 技术选型

| 技术层 | 技术栈 | 版本 | 说明 |
|--------|--------|------|------|
| 数据库 | PostgreSQL | 18.x | 关系型数据库 |
| 后端框架 | FastAPI | 0.123.x | 高性能 Python 异步框架 |
| 编程语言 | Python | 3.12+ | 后端开发语言 |
| 前端框架 | React | 19.x | 声明式 UI 框架 |
| 构建工具 | Vite | 7.x | 快速的前端构建工具 |
| UI 框架 | Tailwind CSS | 4.x | 原子化 CSS 框架 |
| 组件库 | Shadcn/ui | Latest | 高质量 React 组件库 |
| 类型系统 | TypeScript | 5.x | 静态类型检查 |

---

## 2. 功能需求详述

### 2.1 Ticket 管理功能

#### 2.1.1 创建 Ticket

**功能描述**
用户可以创建新的 Ticket 来记录需要处理的任务或问题。

**输入字段**

| 字段名 | 类型 | 必填 | 长度限制 | 默认值 | 说明 |
|--------|------|------|----------|--------|------|
| title | 字符串 | ✅ | 1-200 字符 | - | Ticket 标题 |
| description | 文本 | ❌ | 最多 10,000 字符 | null | 详细描述 |
| priority | 枚举 | ❌ | low/medium/high | medium | 优先级 |
| status | 枚举 | 自动 | open/completed | open | 状态（创建时自动为 open） |
| label_ids | UUID数组 | ❌ | - | [] | 关联的标签 ID 列表 |

**业务规则**
- 标题不能为空或纯空格
- 创建时自动记录创建时间戳
- 新创建的 Ticket 状态默认为 `open`（待处理）
- 可以在创建时关联 0 个或多个标签

**交互流程**
1. 用户点击"新建 Ticket"按钮
2. 弹出创建表单对话框
3. 用户填写必填字段（标题）和可选字段
4. 用户选择要关联的标签（可选）
5. 点击"创建"按钮提交
6. 系统验证数据后保存
7. 显示成功提示并刷新列表

#### 2.1.2 编辑 Ticket

**功能描述**
用户可以修改已创建的 Ticket 的任何信息。

**可编辑字段**
- 标题（title）
- 描述（description）
- 优先级（priority）
- 标签关联（label_ids）

**业务规则**
- 编辑时自动更新 `updated_at` 时间戳
- 状态（status）通过专门的"完成"/"取消完成"操作修改，不在编辑表单中
- 标题仍需满足非空约束

**交互流程**
1. 用户点击 Ticket 卡片的编辑按钮
2. 弹出编辑表单对话框，预填充当前数据
3. 用户修改需要变更的字段
4. 点击"保存"按钮提交
5. 系统验证并更新数据
6. 显示成功提示并更新显示

#### 2.1.3 删除 Ticket

**功能描述**
用户可以永久删除不需要的 Ticket。

**业务规则**
- 删除操作不可逆
- 删除 Ticket 时，自动解除与所有标签的关联关系
- 标签本身不受影响（不会被删除）

**安全机制**
- 必须二次确认：弹出确认对话框
- 确认对话框中显示 Ticket 标题
- 提示"此操作不可撤销"

**交互流程**
1. 用户点击 Ticket 卡片的删除按钮
2. 弹出确认对话框："确定要删除 '{标题}' 吗？此操作不可撤销。"
3. 用户点击"确定删除"
4. 系统删除数据
5. 显示成功提示并从列表中移除

#### 2.1.4 完成 Ticket

**功能描述**
用户可以将 Ticket 标记为"已完成"状态，表示该任务已处理完毕。

**状态变更**
- `status`: `open` → `completed`
- 记录完成时间：`completed_at` = 当前时间戳

**视觉反馈**
- 已完成的 Ticket 显示样式：
  - 背景色变为浅灰色
  - 标题添加删除线
  - 显示绿色的完成图标（✓）
  - 显示完成时间

**业务规则**
- 只有 `open` 状态的 Ticket 可以执行"完成"操作
- 完成后的 Ticket 仍然可见，可以查看、编辑和删除
- 完成操作可以被撤销（通过"取消完成"）

**交互流程**
1. 用户点击 Ticket 卡片左侧的复选框或"标记完成"按钮
2. Ticket 立即变更为完成样式（乐观更新）
3. 后台异步提交完成请求
4. 显示成功提示："已完成 '{标题}'"

#### 2.1.5 取消完成 Ticket

**功能描述**
用户可以将已完成的 Ticket 恢复为待处理状态。

**状态变更**
- `status`: `completed` → `open`
- 清除完成时间：`completed_at` = null

**业务规则**
- 只有 `completed` 状态的 Ticket 可以执行"取消完成"操作
- 恢复后的 Ticket 显示回正常的待处理样式

**交互流程**
1. 用户点击已完成 Ticket 的复选框或"重新打开"按钮
2. Ticket 立即恢复正常样式
3. 后台异步提交请求
4. 显示提示："已重新打开 '{标题}'"

#### 2.1.6 按 Title 查询 Ticket

**功能描述**
用户可以通过输入关键词快速搜索 Ticket。

**搜索特性**
- **匹配方式**: 模糊匹配（包含即匹配）
- **搜索范围**: 仅搜索 Ticket 标题字段
- **大小写**: 不区分大小写
- **语言支持**: 支持中文、英文等多语言
- **实时性**: 输入即搜索（带防抖优化）

**搜索行为**
- 输入框为空：显示所有 Ticket（遵循当前筛选条件）
- 输入关键词：仅显示标题包含该关键词的 Ticket
- 防抖时间：300ms（避免频繁请求）

**交互设计**
- 顶部固定搜索框，带搜索图标 🔍
- 占位符文本："搜索 Ticket 标题..."
- 输入时显示加载状态
- 无结果时显示空状态提示："未找到匹配的 Ticket"

**组合筛选**
搜索可以与以下筛选条件组合：
- 标签筛选
- 状态筛选（全部/待处理/已完成）

### 2.2 标签管理功能

#### 2.2.1 创建标签

**功能描述**
用户可以创建用于分类 Ticket 的标签。

**输入字段**

| 字段名 | 类型 | 必填 | 约束 | 默认值 | 说明 |
|--------|------|------|------|--------|------|
| name | 字符串 | ✅ | 1-50 字符，唯一 | - | 标签名称 |
| color | 字符串 | ❌ | HEX 格式 #RRGGBB | 随机预设色 | 标签颜色 |
| description | 字符串 | ❌ | 最多 200 字符 | null | 标签说明 |

**业务规则**
- 标签名称必须唯一（不区分大小写）
- 如果未指定颜色，系统自动分配预设颜色
- 创建时自动记录创建时间

**交互流程**
1. 用户点击侧边栏底部"+ 新建标签"按钮
2. 弹出创建表单对话框
3. 输入标签名称，选择颜色（可选）
4. 点击"创建"提交
5. 新标签出现在侧边栏标签列表中

#### 2.2.2 编辑标签

**功能描述**
用户可以修改标签的名称、颜色和描述。

**可编辑字段**
- 名称（name）
- 颜色（color）
- 描述（description）

**业务规则**
- 修改后的名称不能与其他标签重复
- 颜色修改后，所有使用该标签的 Ticket 显示同步更新
- 自动更新 `updated_at` 时间戳

**交互流程**
1. 用户在侧边栏标签列表中，鼠标悬停显示操作按钮
2. 点击"编辑"图标
3. 弹出编辑表单对话框
4. 修改字段后点击"保存"
5. 显示成功提示，界面同步更新

#### 2.2.3 删除标签

**功能描述**
用户可以删除不再需要的标签。

**业务规则**
- 删除标签时，自动解除该标签与所有 Ticket 的关联
- 关联的 Ticket 本身不受影响，只是失去该标签
- 删除操作不可逆

**安全机制**
- 二次确认对话框
- 显示关联的 Ticket 数量警告
- 示例："标签 'Bug' 当前关联 12 个 Ticket，删除后这些 Ticket 将失去此标签。确定删除吗？"

**交互流程**
1. 用户点击标签的删除按钮
2. 弹出确认对话框，显示关联 Ticket 数量
3. 用户确认删除
4. 系统删除标签及其所有关联关系
5. 显示成功提示，刷新界面

### 2.3 Ticket 与标签关联功能

#### 2.3.1 为 Ticket 添加标签

**功能描述**
用户可以为 Ticket 关联一个或多个标签进行分类。

**添加方式**
1. **创建时添加**: 在创建 Ticket 表单中选择标签
2. **编辑时添加**: 在编辑 Ticket 表单中添加/移除标签
3. **快速添加**: 在 Ticket 卡片上通过下拉菜单快速添加（可选）

**业务规则**
- 一个 Ticket 可以关联 0 ~ N 个标签
- 同一个标签不能重复关联到同一个 Ticket
- 标签选择支持多选
- 添加标签时自动记录关联时间

**UI 交互**
- 使用多选下拉框或标签选择器
- 已选标签显示为彩色徽章
- 徽章带有 ✕ 按钮可快速移除

#### 2.3.2 从 Ticket 删除标签

**功能描述**
用户可以移除 Ticket 上的某个标签。

**删除方式**
1. 在编辑表单中取消选择标签
2. 点击标签徽章上的 ✕ 按钮
3. 从标签下拉菜单中取消勾选

**业务规则**
- 移除关联不影响标签和 Ticket 本身
- 立即生效，无需二次确认
- 可以移除所有标签（Ticket 变为"无标签"状态）

#### 2.3.3 按标签查看 Ticket 列表

**功能描述**
用户可以通过选择标签来筛选和查看相关的 Ticket。

**筛选模式**

| 模式 | 触发方式 | 行为 |
|------|----------|------|
| 全部 | 点击"全部" | 显示所有 Ticket，不进行标签筛选 |
| 单标签 | 点击某个标签 | 显示包含该标签的所有 Ticket |
| 多标签（AND） | Ctrl/Cmd + 点击多个标签 | 显示同时包含所有选中标签的 Ticket |
| 无标签 | 点击"无标签" | 显示没有任何标签的 Ticket |

**侧边栏标签列表显示**
- 标签名称 + 颜色圆点
- 每个标签旁显示关联的 Ticket 数量
- 选中状态：高亮背景色
- 排序：按创建时间或名称（可配置）

**交互示例**
```
侧边栏：
──────────────
📋 全部 (45)
📋 无标签 (3)
──────────────
🔴 Bug (12)        ← 选中
🟢 Feature (8)
🔵 Enhancement (15)
🟣 Docs (5)
🟡 Question (2)
──────────────
[+ 新建标签]
```

---

## 3. 数据库设计

### 3.1 概念模型（ER 图）

```
┌──────────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│      tickets         │         │  ticket_labels   │         │     labels      │
├──────────────────────┤         ├──────────────────┤         ├─────────────────┤
│ • id (PK)            │────────<│ • ticket_id (FK) │         │ • id (PK)       │
│ • title               │         │ • label_id (FK)  │>────────│ • name (UNIQUE)  │
│ • description         │         │ • created_at     │         │ • color         │
│ • priority            │         └──────────────────┘         │ • description   │
│ • status              │                                      │ • created_at    │
│ • created_at          │              多对多关系               │ • updated_at    │
│ • updated_at          │                                      └─────────────────┘
│ • completed_at        │
└──────────────────────┘

关系说明：
- 一个 Ticket 可以有多个 Label（0..N）
- 一个 Label 可以关联多个 Ticket（0..N）
- 通过中间表 ticket_labels 实现多对多关系
```

### 3.2 逻辑模型（表结构）

#### 3.2.1 tickets 表

**表名**: `tickets`  
**说明**: 存储所有 Ticket 信息

| 字段名 | 数据类型 | 约束 | 默认值 | 索引 | 说明 |
|--------|----------|------|--------|------|------|
| id | UUID | PRIMARY KEY | gen_random_uuid() | PK | 主键，UUID 格式 |
| title | VARCHAR(200) | NOT NULL | - | BTREE | Ticket 标题 |
| description | TEXT | NULLABLE | NULL | - | 详细描述 |
| priority | VARCHAR(10) | NOT NULL, CHECK | 'medium' | BTREE | 优先级：low/medium/high |
| status | VARCHAR(20) | NOT NULL, CHECK | 'open' | BTREE | 状态：open/completed |
| created_at | TIMESTAMPTZ | NOT NULL | CURRENT_TIMESTAMP | BTREE(DESC) | 创建时间 |
| updated_at | TIMESTAMPTZ | NOT NULL | CURRENT_TIMESTAMP | - | 更新时间 |
| completed_at | TIMESTAMPTZ | NULLABLE | NULL | - | 完成时间 |

**建表 SQL**:
```sql
CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    priority VARCHAR(10) NOT NULL DEFAULT 'medium' 
        CHECK (priority IN ('low', 'medium', 'high')),
    status VARCHAR(20) NOT NULL DEFAULT 'open' 
        CHECK (status IN ('open', 'completed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ
);

-- 注释
COMMENT ON TABLE tickets IS 'Ticket 主表';
COMMENT ON COLUMN tickets.id IS '主键 UUID';
COMMENT ON COLUMN tickets.title IS 'Ticket 标题';
COMMENT ON COLUMN tickets.description IS '详细描述';
COMMENT ON COLUMN tickets.priority IS '优先级：low/medium/high';
COMMENT ON COLUMN tickets.status IS '状态：open（待处理）/completed（已完成）';
COMMENT ON COLUMN tickets.completed_at IS '完成时间，仅当 status=completed 时有值';
```

#### 3.2.2 labels 表

**表名**: `labels`  
**说明**: 存储所有标签信息

| 字段名 | 数据类型 | 约束 | 默认值 | 索引 | 说明 |
|--------|----------|------|--------|------|------|
| id | UUID | PRIMARY KEY | gen_random_uuid() | PK | 主键，UUID 格式 |
| name | VARCHAR(50) | NOT NULL, UNIQUE | - | UNIQUE | 标签名称，唯一 |
| color | VARCHAR(7) | NOT NULL | '#6366f1' | - | 标签颜色，HEX 格式 |
| description | VARCHAR(200) | NULLABLE | NULL | - | 标签描述 |
| created_at | TIMESTAMPTZ | NOT NULL | CURRENT_TIMESTAMP | BTREE(DESC) | 创建时间 |
| updated_at | TIMESTAMPTZ | NOT NULL | CURRENT_TIMESTAMP | - | 更新时间 |

**建表 SQL**:
```sql
CREATE TABLE labels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    color VARCHAR(7) NOT NULL DEFAULT '#6366f1',
    description VARCHAR(200),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 注释
COMMENT ON TABLE labels IS '标签表';
COMMENT ON COLUMN labels.name IS '标签名称，唯一约束';
COMMENT ON COLUMN labels.color IS '标签颜色，HEX 格式 #RRGGBB';
```

#### 3.2.3 ticket_labels 表（关联表）

**表名**: `ticket_labels`  
**说明**: Ticket 与 Label 的多对多关联表

| 字段名 | 数据类型 | 约束 | 默认值 | 索引 | 说明 |
|--------|----------|------|--------|------|------|
| ticket_id | UUID | FK, NOT NULL | - | PK, FK | Ticket ID |
| label_id | UUID | FK, NOT NULL | - | PK, FK | Label ID |
| created_at | TIMESTAMPTZ | NOT NULL | CURRENT_TIMESTAMP | - | 关联创建时间 |

**联合主键**: (ticket_id, label_id)  
**外键约束**:
- `ticket_id` → `tickets(id)` ON DELETE CASCADE
- `label_id` → `labels(id)` ON DELETE CASCADE

**建表 SQL**:
```sql
CREATE TABLE ticket_labels (
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    label_id UUID NOT NULL REFERENCES labels(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (ticket_id, label_id)
);

-- 注释
COMMENT ON TABLE ticket_labels IS 'Ticket 与 Label 多对多关联表';
COMMENT ON COLUMN ticket_labels.ticket_id IS '关联的 Ticket ID';
COMMENT ON COLUMN ticket_labels.label_id IS '关联的 Label ID';

-- 外键索引（优化查询性能）
CREATE INDEX idx_ticket_labels_label_id ON ticket_labels(label_id);
CREATE INDEX idx_ticket_labels_ticket_id ON ticket_labels(ticket_id);
```

### 3.3 索引设计

#### 3.3.1 tickets 表索引

```sql
-- 1. 标题模糊搜索索引（LIKE 查询优化）
CREATE INDEX idx_tickets_title_like ON tickets(title varchar_pattern_ops);

-- 2. 状态索引（按状态筛选）
CREATE INDEX idx_tickets_status ON tickets(status);

-- 3. 优先级索引（按优先级筛选）
CREATE INDEX idx_tickets_priority ON tickets(priority);

-- 4. 创建时间索引（排序和范围查询）
CREATE INDEX idx_tickets_created_at ON tickets(created_at DESC);

-- 5. 复合索引：状态 + 创建时间（常见组合查询）
CREATE INDEX idx_tickets_status_created ON tickets(status, created_at DESC);
```

**索引说明**:
- **varchar_pattern_ops**: 优化 LIKE '%keyword%' 查询
- **复合索引**: 覆盖"查询某状态的 Ticket 并按时间排序"场景

#### 3.3.2 labels 表索引

```sql
-- 1. 名称唯一索引（已由 UNIQUE 约束自动创建）

-- 2. 创建时间索引
CREATE INDEX idx_labels_created_at ON labels(created_at DESC);
```

#### 3.3.3 ticket_labels 表索引

```sql
-- 1. 联合主键自动创建索引：(ticket_id, label_id)

-- 2. 反向查询索引（查询某标签下的所有 Ticket）
CREATE INDEX idx_ticket_labels_label_id ON ticket_labels(label_id);
```

### 3.4 触发器和函数

#### 3.4.1 自动更新 updated_at 触发器

```sql
-- 创建触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为 tickets 表创建触发器
CREATE TRIGGER trg_tickets_update_updated_at
    BEFORE UPDATE ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 为 labels 表创建触发器
CREATE TRIGGER trg_labels_update_updated_at
    BEFORE UPDATE ON labels
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

#### 3.4.2 完成 Ticket 时自动设置 completed_at

```sql
CREATE OR REPLACE FUNCTION set_completed_at_on_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- 如果状态变更为 completed，设置完成时间
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        NEW.completed_at = CURRENT_TIMESTAMP;
    END IF;
    
    -- 如果状态从 completed 变更为 open，清除完成时间
    IF NEW.status = 'open' AND OLD.status = 'completed' THEN
        NEW.completed_at = NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_tickets_set_completed_at
    BEFORE UPDATE OF status ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION set_completed_at_on_status_change();
```

### 3.5 初始化数据

```sql
-- 插入预设标签
INSERT INTO labels (name, color, description) VALUES
    ('Bug', '#ef4444', '需要修复的缺陷或错误'),
    ('Feature', '#22c55e', '新功能开发'),
    ('Enhancement', '#3b82f6', '现有功能改进'),
    ('Documentation', '#8b5cf6', '文档相关任务'),
    ('Question', '#f59e0b', '需要讨论或澄清的问题'),
    ('Urgent', '#dc2626', '紧急任务')
ON CONFLICT (name) DO NOTHING;
```

### 3.6 数据库迁移（Alembic）

使用 Alembic 管理数据库版本和迁移：

```bash
# 初始化 Alembic
alembic init alembic

# 创建初始迁移
alembic revision --autogenerate -m "Initial schema"

# 执行迁移
alembic upgrade head
```

---

## 4. 后端 API 设计

### 4.1 API 设计原则

- **RESTful 风格**: 使用标准 HTTP 方法（GET/POST/PUT/DELETE/PATCH）
- **版本控制**: API 路径包含版本号 `/api/v1`
- **统一响应格式**: 成功和错误响应格式一致
- **状态码规范**: 遵循 HTTP 状态码语义
- **分页支持**: 列表接口支持分页
- **错误处理**: 详细的错误信息和错误码

### 4.2 API 基础信息

**Base URL**: `http://localhost:8000/api/v1`

**通用响应头**:
```
Content-Type: application/json
Access-Control-Allow-Origin: *
```

**通用错误响应格式**:
```json
{
  "detail": "错误描述信息",
  "error_code": "ERROR_CODE",
  "field_errors": {
    "field_name": ["错误信息1", "错误信息2"]
  }
}
```

### 4.3 Ticket API

#### 4.3.1 获取 Ticket 列表

```http
GET /api/v1/tickets
```

**查询参数** (Query Parameters):

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| title | string | ❌ | - | 标题搜索关键词（模糊匹配） |
| status | string | ❌ | all | 状态筛选：all / open / completed |
| priority | string | ❌ | - | 优先级筛选：low / medium / high |
| label_ids | string | ❌ | - | 标签 ID 列表，逗号分隔，如 "uuid1,uuid2" |
| no_label | boolean | ❌ | false | 是否仅显示无标签的 Ticket |
| sort_by | string | ❌ | created_at | 排序字段：created_at / updated_at / priority |
| sort_order | string | ❌ | desc | 排序方向：asc / desc |
| page | integer | ❌ | 1 | 页码，从 1 开始 |
| page_size | integer | ❌ | 20 | 每页数量，范围 1-100 |

**请求示例**:
```http
GET /api/v1/tickets?title=登录&status=open&label_ids=uuid1,uuid2&page=1&page_size=20
```

**响应 200 OK**:
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "修复登录页面样式问题",
      "description": "登录按钮在移动端显示异常，需要修复响应式样式",
      "priority": "high",
      "status": "open",
      "labels": [
        {
          "id": "660e8400-e29b-41d4-a716-446655440001",
          "name": "Bug",
          "color": "#ef4444"
        },
        {
          "id": "770e8400-e29b-41d4-a716-446655440002",
          "name": "Urgent",
          "color": "#dc2626"
        }
      ],
      "created_at": "2025-01-15T10:30:00Z",
      "updated_at": "2025-01-15T10:30:00Z",
      "completed_at": null
    }
  ],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total": 156,
    "total_pages": 8,
    "has_next": true,
    "has_prev": false
  }
}
```

#### 4.3.2 获取单个 Ticket 详情

```http
GET /api/v1/tickets/{ticket_id}
```

**路径参数**:
- `ticket_id`: Ticket 的 UUID

**响应 200 OK**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "修复登录页面样式问题",
  "description": "# 问题描述\n登录按钮在移动端显示异常...",
  "priority": "high",
  "status": "open",
  "labels": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "name": "Bug",
      "color": "#ef4444",
      "description": "需要修复的缺陷或错误"
    }
  ],
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-01-15T10:30:00Z",
  "completed_at": null
}
```

**响应 404 Not Found**:
```json
{
  "detail": "Ticket not found"
}
```

#### 4.3.3 创建 Ticket

```http
POST /api/v1/tickets
```

**请求体**:
```json
{
  "title": "新增用户导出功能",
  "description": "支持将用户列表导出为 Excel 和 CSV 格式",
  "priority": "medium",
  "label_ids": [
    "880e8400-e29b-41d4-a716-446655440003",
    "990e8400-e29b-41d4-a716-446655440004"
  ]
}
```

**字段说明**:
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| title | string | ✅ | 标题，1-200 字符 |
| description | string | ❌ | 描述，最多 10000 字符 |
| priority | string | ❌ | 优先级，默认 medium |
| label_ids | array[UUID] | ❌ | 关联的标签 ID 列表 |

**响应 201 Created**:
```json
{
  "id": "aa0e8400-e29b-41d4-a716-446655440100",
  "title": "新增用户导出功能",
  "description": "支持将用户列表导出为 Excel 和 CSV 格式",
  "priority": "medium",
  "status": "open",
  "labels": [
    {
      "id": "880e8400-e29b-41d4-a716-446655440003",
      "name": "Feature",
      "color": "#22c55e"
    }
  ],
  "created_at": "2025-01-16T09:15:00Z",
  "updated_at": "2025-01-16T09:15:00Z",
  "completed_at": null
}
```

**响应 422 Unprocessable Entity** (验证失败):
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

#### 4.3.4 更新 Ticket

```http
PUT /api/v1/tickets/{ticket_id}
```

**路径参数**:
- `ticket_id`: Ticket 的 UUID

**请求体** (全部字段可选):
```json
{
  "title": "更新后的标题",
  "description": "更新后的描述内容",
  "priority": "high",
  "label_ids": [
    "660e8400-e29b-41d4-a716-446655440001"
  ]
}
```

**响应 200 OK**: 返回更新后的完整 Ticket 对象（同获取详情响应）

**响应 404 Not Found**: Ticket 不存在

**响应 422**: 验证失败

#### 4.3.5 删除 Ticket

```http
DELETE /api/v1/tickets/{ticket_id}
```

**路径参数**:
- `ticket_id`: Ticket 的 UUID

**响应 204 No Content**: 删除成功，无响应体

**响应 404 Not Found**: Ticket 不存在

#### 4.3.6 完成 Ticket

```http
PATCH /api/v1/tickets/{ticket_id}/complete
```

**路径参数**:
- `ticket_id`: Ticket 的 UUID

**响应 200 OK**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "completed",
  "completed_at": "2025-01-16T14:20:00Z"
}
```

**响应 400 Bad Request** (已经是完成状态):
```json
{
  "detail": "Ticket is already completed"
}
```

**响应 404 Not Found**: Ticket 不存在

#### 4.3.7 取消完成 Ticket（重新打开）

```http
PATCH /api/v1/tickets/{ticket_id}/reopen
```

**路径参数**:
- `ticket_id`: Ticket 的 UUID

**响应 200 OK**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "open",
  "completed_at": null
}
```

**响应 400 Bad Request** (不是完成状态):
```json
{
  "detail": "Ticket is not completed"
}
```

**响应 404 Not Found**: Ticket 不存在

### 4.4 Label API

#### 4.4.1 获取标签列表

```http
GET /api/v1/labels
```

**查询参数**:

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| with_count | boolean | ❌ | true | 是否返回每个标签的 Ticket 数量 |
| sort_by | string | ❌ | created_at | 排序字段：name / created_at |

**响应 200 OK**:
```json
{
  "data": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "name": "Bug",
      "color": "#ef4444",
      "description": "需要修复的缺陷或错误",
      "ticket_count": 12,
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    },
    {
      "id": "880e8400-e29b-41d4-a716-446655440003",
      "name": "Feature",
      "color": "#22c55e",
      "description": "新功能开发",
      "ticket_count": 8,
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    }
  ],
  "total": 6
}
```

#### 4.4.2 获取单个标签详情

```http
GET /api/v1/labels/{label_id}
```

**响应 200 OK**:
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "name": "Bug",
  "color": "#ef4444",
  "description": "需要修复的缺陷或错误",
  "ticket_count": 12,
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-01T00:00:00Z"
}
```

**响应 404 Not Found**: 标签不存在

#### 4.4.3 创建标签

```http
POST /api/v1/labels
```

**请求体**:
```json
{
  "name": "Refactor",
  "color": "#14b8a6",
  "description": "代码重构任务"
}
```

**字段说明**:
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | ✅ | 标签名称，1-50 字符，唯一 |
| color | string | ❌ | HEX 颜色，默认随机预设色 |
| description | string | ❌ | 描述，最多 200 字符 |

**响应 201 Created**:
```json
{
  "id": "bb0e8400-e29b-41d4-a716-446655440200",
  "name": "Refactor",
  "color": "#14b8a6",
  "description": "代码重构任务",
  "ticket_count": 0,
  "created_at": "2025-01-16T10:00:00Z",
  "updated_at": "2025-01-16T10:00:00Z"
}
```

**响应 409 Conflict** (名称重复):
```json
{
  "detail": "Label with this name already exists"
}
```

**响应 422**: 验证失败

#### 4.4.4 更新标签

```http
PUT /api/v1/labels/{label_id}
```

**请求体**:
```json
{
  "name": "Bug Fix",
  "color": "#dc2626",
  "description": "缺陷修复"
}
```

**响应 200 OK**: 返回更新后的标签对象

**响应 404**: 标签不存在

**响应 409**: 名称与其他标签重复

#### 4.4.5 删除标签

```http
DELETE /api/v1/labels/{label_id}
```

**响应 204 No Content**: 删除成功

**响应 404**: 标签不存在

---

## 5. 前端设计

### 5.1 技术架构

```
┌─────────────────────────────────────────┐
│            应用层 (App Layer)            │
│  React Router, Context, Error Boundary  │
├─────────────────────────────────────────┤
│          UI 组件层 (UI Components)       │
│  Layout, Ticket, Label, Common, Shadcn  │
├─────────────────────────────────────────┤
│       状态管理层 (State Management)      │
│  TanStack Query (React Query)          │
├─────────────────────────────────────────┤
│       服务层 (Service Layer)            │
│        Axios, API Client                │
├─────────────────────────────────────────┤
│      类型层 (Type Layer)                │
│        TypeScript Interfaces            │
└─────────────────────────────────────────┘
```

**核心技术选型说明**:
- **React 19**: 使用最新的 React 特性
- **Vite 7**: 极速的开发服务器和构建工具
- **TanStack Query**: 服务器状态管理，自动缓存、重新验证
- **React Router**: 路由管理
- **Axios**: HTTP 客户端
- **Tailwind CSS 4**: 原子化样式
- **Shadcn/ui**: 无依赖的组件库，基于 Radix UI

### 5.2 页面布局设计

#### 5.2.1 整体布局（线框图）

```
┌──────────────────────────────────────────────────────────────────────────┐
│                               Header (60px)                              │
│  ┌─────────────────┐  ┌──────────────────────────┐  ┌─────────────────┐ │
│  │ 🎫 TicketHub    │  │  🔍 搜索 Ticket...      │  │ [+ 新建 Ticket]  │ │
│  └─────────────────┘  └──────────────────────────┘  └─────────────────┘ │
├──────────┬───────────────────────────────────────────────────────────────┤
│          │                                                               │
│ Sidebar  │                     Main Content Area                         │
│ (260px)  │                                                               │
│          │  ┌──────────────────────────────────────────────────────────┐ │
│          │  │  Filters & Sort                                          │ │
│  筛选与   │  │  [全部] [待处理] [已完成]    排序: [创建时间 ▼]           │ │
│  标签     │  └──────────────────────────────────────────────────────────┘ │
│          │                                                               │
│ ┌──────┐ │  ┌──────────────────────────────────────────────────────────┐ │
│ │ 📋全部│ │  │ Ticket List                                             │ │
│ │  (45)│ │  │                                                          │ │
│ └──────┘ │  │  ┌────────────────────────────────────────────────────┐  │ │
│ ┌──────┐ │  │  │ ☐ 修复登录页面样式问题                              │  │ │
│ │📋无标│ │  │  │   [Bug] [Urgent]     🔴 High     2小时前           │  │ │
│ │签 (3)│ │  │  └────────────────────────────────────────────────────┘  │ │
│ └──────┘ │  │                                                          │ │
│          │  │  ┌────────────────────────────────────────────────────┐  │ │
│ 标签列表  │  │  │ ☑ 完成用户注册功能                         ✓       │  │ │
│ ────────  │  │  │   [Feature]          🟡 Medium   1天前            │  │ │
│          │  │  └────────────────────────────────────────────────────┘  │ │
│ 🔴 Bug   │  │                                                          │ │
│   (12)   │  │  ┌────────────────────────────────────────────────────┐  │ │
│ 🟢Feature│  │  │ ☐ 优化数据库查询性能                                │  │ │
│   (8)    │  │  │   [Enhancement]      🟢 Low      3天前              │  │ │
│ 🔵Enhance│  │  └────────────────────────────────────────────────────┘  │ │
│   (15)   │  │                                                          │ │
│ 🟣 Docs  │  │  ... 更多 Tickets ...                                   │ │
│   (5)    │  │                                                          │ │
│ 🟡Quest. │  │  ┌────────────────────────────────────────────────────┐  │ │
│   (2)    │  │  │          分页: << 1 2 3 ... 8 >>                   │  │ │
│          │  │  └────────────────────────────────────────────────────┘  │ │
│ ┌──────┐ │  └──────────────────────────────────────────────────────────┘ │
│ │+ 新建│ │                                                               │
│ │ 标签 │ │                                                               │
│ └──────┘ │                                                               │
└──────────┴───────────────────────────────────────────────────────────────┘
```

#### 5.2.2 响应式布局

**桌面端 (≥1024px)**:
- 固定侧边栏 (260px)
- 主内容区自适应
- Ticket 卡片单列布局

**平板端 (640px - 1024px)**:
- 可折叠侧边栏
- 主内容区占满剩余空间
- Ticket 卡片单列布局

**移动端 (<640px)**:
- 侧边栏隐藏为抽屉式菜单（点击汉堡菜单展开）
- 主内容区占满屏幕
- 搜索框和新建按钮调整布局

### 5.3 路由设计

| 路径 | 页面组件 | 说明 |
|------|----------|------|
| `/` | HomePage | 首页，显示 Ticket 列表 |
| `/tickets/new` | NewTicketPage | 新建 Ticket 页面（可选，也可用 Dialog） |
| `/tickets/:id` | TicketDetailPage | Ticket 详情页（可选，也可用侧边抽屉） |

**路由配置** (React Router):
```typescript
import { createBrowserRouter } from 'react-router-dom';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'tickets/new',
        element: <NewTicketPage />,
      },
      {
        path: 'tickets/:id',
        element: <TicketDetailPage />,
      },
    ],
  },
]);
```

### 5.4 组件设计

#### 5.4.1 组件目录结构

```
src/
├── components/
│   ├── ui/                      # Shadcn/ui 基础组件
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── textarea.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── badge.tsx
│   │   ├── card.tsx
│   │   ├── checkbox.tsx
│   │   ├── select.tsx
│   │   ├── toast.tsx
│   │   ├── tooltip.tsx
│   │   ├── separator.tsx
│   │   ├── sheet.tsx           # 侧边抽屉
│   │   └── ...
│   │
│   ├── layout/                  # 布局组件
│   │   ├── MainLayout.tsx       # 主布局容器
│   │   ├── Header.tsx           # 顶部导航栏
│   │   ├── Sidebar.tsx          # 左侧边栏
│   │   └── MobileSidebar.tsx   # 移动端抽屉侧边栏
│   │
│   ├── tickets/                 # Ticket 相关组件
│   │   ├── TicketList.tsx       # Ticket 列表容器
│   │   ├── TicketCard.tsx       # Ticket 卡片（列表项）
│   │   ├── TicketDetail.tsx     # Ticket 详情展示
│   │   ├── TicketForm.tsx       # Ticket 创建/编辑表单
│   │   ├── TicketFilters.tsx    # 筛选器（状态/优先级）
│   │   ├── TicketSearch.tsx     # 搜索框
│   │   ├── TicketPagination.tsx # 分页组件
│   │   └── PriorityBadge.tsx    # 优先级徽章
│   │
│   ├── labels/                  # Label 相关组件
│   │   ├── LabelList.tsx        # 标签列表（侧边栏）
│   │   ├── LabelItem.tsx        # 单个标签项
│   │   ├── LabelBadge.tsx       # 标签徽章（带颜色）
│   │   ├── LabelSelector.tsx    # 标签选择器（多选）
│   │   ├── LabelForm.tsx        # 标签创建/编辑表单
│   │   └── LabelColorPicker.tsx # 颜色选择器
│   │
│   └── common/                  # 通用组件
│       ├── ConfirmDialog.tsx    # 确认对话框
│       ├── EmptyState.tsx       # 空状态展示
│       ├── LoadingSpinner.tsx   # 加载动画
│       ├── LoadingOverlay.tsx   # 加载遮罩
│       └── ErrorBoundary.tsx    # 错误边界
```

#### 5.4.2 核心组件设计

**TicketCard 组件**:
```typescript
interface TicketCardProps {
  ticket: Ticket;
  onComplete: (id: string) => void;
  onReopen: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TicketCard({ ticket, ... }: TicketCardProps) {
  return (
    <Card className={cn(
      "hover:shadow-md transition-shadow",
      ticket.status === 'completed' && "bg-gray-50"
    )}>
      <div className="flex items-start gap-3">
        {/* 左侧复选框 */}
        <Checkbox 
          checked={ticket.status === 'completed'}
          onChange={() => ticket.status === 'open' 
            ? onComplete(ticket.id) 
            : onReopen(ticket.id)
          }
        />
        
        {/* 中间内容 */}
        <div className="flex-1">
          <h3 className={cn(
            "font-medium",
            ticket.status === 'completed' && "line-through text-gray-500"
          )}>
            {ticket.title}
          </h3>
          
          {/* 标签列表 */}
          <div className="flex gap-1 mt-2">
            {ticket.labels.map(label => (
              <LabelBadge key={label.id} label={label} />
            ))}
          </div>
        </div>
        
        {/* 右侧元数据 */}
        <div className="flex items-center gap-2">
          <PriorityBadge priority={ticket.priority} />
          <span className="text-sm text-gray-500">
            {formatRelativeTime(ticket.created_at)}
          </span>
          
          {/* 操作按钮 */}
          <DropdownMenu>
            <DropdownMenuTrigger>⋯</DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onEdit(ticket.id)}>
                编辑
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(ticket.id)}>
                删除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  );
}
```

**LabelSelector 组件** (多选标签):
```typescript
interface LabelSelectorProps {
  selectedLabelIds: string[];
  onChange: (labelIds: string[]) => void;
}

export function LabelSelector({ selectedLabelIds, onChange }: LabelSelectorProps) {
  const { data: labels } = useLabels();
  
  return (
    <div>
      <Label>标签</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start">
            {selectedLabelIds.length > 0 
              ? `已选 ${selectedLabelIds.length} 个标签`
              : "选择标签..."
            }
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          {labels?.map(label => (
            <div key={label.id} className="flex items-center gap-2">
              <Checkbox
                checked={selectedLabelIds.includes(label.id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    onChange([...selectedLabelIds, label.id]);
                  } else {
                    onChange(selectedLabelIds.filter(id => id !== label.id));
                  }
                }}
              />
              <LabelBadge label={label} />
            </div>
          ))}
        </PopoverContent>
      </Popover>
      
      {/* 已选标签显示 */}
      <div className="flex flex-wrap gap-1 mt-2">
        {selectedLabelIds.map(id => {
          const label = labels?.find(l => l.id === id);
          return label && (
            <LabelBadge 
              key={id} 
              label={label}
              onRemove={() => onChange(selectedLabelIds.filter(lid => lid !== id))}
            />
          );
        })}
      </div>
    </div>
  );
}
```

### 5.5 状态管理

使用 **TanStack Query (React Query)** 管理服务器状态：

#### 5.5.1 Ticket Hooks

```typescript
// hooks/useTickets.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketApi } from '@/services/ticketApi';

// 获取 Ticket 列表
export function useTickets(filters: TicketFilters) {
  return useQuery({
    queryKey: ['tickets', filters],
    queryFn: () => ticketApi.getList(filters),
    staleTime: 30000, // 30秒内视为新鲜数据
  });
}

// 获取单个 Ticket
export function useTicket(id: string) {
  return useQuery({
    queryKey: ['tickets', id],
    queryFn: () => ticketApi.getById(id),
    enabled: !!id,
  });
}

// 创建 Ticket
export function useCreateTicket() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ticketApi.create,
    onSuccess: () => {
      // 刷新列表和标签计数
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['labels'] });
    },
  });
}

// 更新 Ticket
export function useUpdateTicket() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTicketInput }) =>
      ticketApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['tickets', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['labels'] });
    },
  });
}

// 删除 Ticket
export function useDeleteTicket() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ticketApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['labels'] });
    },
  });
}

// 完成 Ticket（乐观更新）
export function useCompleteTicket() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ticketApi.complete,
    // 乐观更新
    onMutate: async (ticketId) => {
      await queryClient.cancelQueries({ queryKey: ['tickets'] });
      
      const previousTickets = queryClient.getQueryData(['tickets']);
      
      // 更新缓存
      queryClient.setQueriesData(['tickets'], (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((ticket: Ticket) =>
            ticket.id === ticketId
              ? { ...ticket, status: 'completed', completed_at: new Date().toISOString() }
              : ticket
          ),
        };
      });
      
      return { previousTickets };
    },
    onError: (err, ticketId, context) => {
      // 回滚
      if (context?.previousTickets) {
        queryClient.setQueryData(['tickets'], context.previousTickets);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
}

// 取消完成 Ticket
export function useReopenTicket() {
  // 类似 useCompleteTicket 的实现
  // ...
}
```

#### 5.5.2 Label Hooks

```typescript
// hooks/useLabels.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { labelApi } from '@/services/labelApi';

export function useLabels() {
  return useQuery({
    queryKey: ['labels'],
    queryFn: () => labelApi.getList({ with_count: true }),
    staleTime: 60000, // 标签变化较少，1分钟内视为新鲜
  });
}

export function useCreateLabel() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: labelApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labels'] });
    },
  });
}

// ... 其他 Label mutations
```

### 5.6 UI/UX 细节设计

#### 5.6.1 优先级视觉设计

| 优先级 | 颜色 | 图标 | Tailwind 类 |
|--------|------|------|-------------|
| high | 🟠 橙色 | ↑ | `text-orange-600 bg-orange-100` |
| medium | 🟡 黄色 | — | `text-yellow-600 bg-yellow-100` |
| low | 🟢 绿色 | ↓ | `text-green-600 bg-green-100` |

#### 5.6.2 状态视觉设计

| 状态 | 复选框 | 标题样式 | 卡片背景 |
|------|--------|----------|----------|
| open | ☐ 空心 | 正常 | 白色 `bg-white` |
| completed | ☑ 实心绿勾 | 删除线 + 灰色 | 浅灰 `bg-gray-50` |

#### 5.6.3 交互动画

- **Ticket 完成**: 复选框勾选动画 + 淡入淡出背景色变化
- **标签筛选**: 侧边栏标签项高亮动画
- **Hover 状态**: 卡片阴影提升 `hover:shadow-md`
- **加载状态**: 骨架屏（Skeleton）或 Spinner

#### 5.6.4 响应式断点

```typescript
// tailwind.config.ts
export default {
  theme: {
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
  },
};
```

**布局断点**:
- `< 640px`: 移动端，侧边栏隐藏为抽屉
- `640px - 1024px`: 平板端，侧边栏可折叠
- `≥ 1024px`: 桌面端，固定侧边栏

---

## 6. 项目结构

### 6.1 后端项目结构

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                  # FastAPI 应用入口、CORS、中间件
│   ├── config.py                # 配置管理（环境变量、数据库 URL）
│   ├── database.py              # 数据库连接、Session 工厂
│   │
│   ├── models/                  # SQLAlchemy ORM 模型
│   │   ├── __init__.py
│   │   ├── base.py              # Base 类
│   │   ├── ticket.py            # Ticket 模型
│   │   ├── label.py             # Label 模型
│   │   └── ticket_label.py      # 关联表模型
│   │
│   ├── schemas/                 # Pydantic 模型（请求/响应 DTO）
│   │   ├── __init__.py
│   │   ├── ticket.py            # Ticket 相关 schemas
│   │   ├── label.py             # Label 相关 schemas
│   │   └── common.py            # 通用 schemas（分页、响应包装）
│   │
│   ├── routers/                 # API 路由
│   │   ├── __init__.py
│   │   ├── tickets.py           # Ticket 路由
│   │   └── labels.py            # Label 路由
│   │
│   ├── services/                # 业务逻辑层
│   │   ├── __init__.py
│   │   ├── ticket_service.py    # Ticket 业务逻辑
│   │   └── label_service.py     # Label 业务逻辑
│   │
│   └── utils/                   # 工具函数
│       ├── __init__.py
│       ├── exceptions.py        # 自定义异常
│       ├── dependencies.py      # 依赖注入
│       └── validators.py        # 验证器
│
├── alembic/                     # 数据库迁移
│   ├── versions/
│   │   └── 001_initial_schema.py
│   ├── env.py
│   └── script.py.mako
│
├── tests/                       # 测试
│   ├── __init__.py
│   ├── conftest.py              # Pytest 配置和 fixtures
│   ├── test_tickets.py
│   └── test_labels.py
│
├── .env                         # 环境变量（不提交到 Git）
├── .env.example                 # 环境变量示例
├── .gitignore
├── alembic.ini                  # Alembic 配置
├── requirements.txt             # Python 依赖
├── pyproject.toml               # Python 项目配置（可选）
└── README.md
```

### 6.2 前端项目结构

```
frontend/
├── src/
│   ├── main.tsx                 # 应用入口
│   ├── App.tsx                  # 根组件、路由配置
│   ├── vite-env.d.ts            # Vite 类型声明
│   │
│   ├── components/              # 组件（详见前面）
│   │   ├── ui/                  # Shadcn/ui 组件
│   │   ├── layout/              # 布局组件
│   │   ├── tickets/             # Ticket 相关组件
│   │   ├── labels/               # Label 相关组件
│   │   └── common/              # 通用组件
│   │
│   ├── pages/                   # 页面组件
│   │   ├── HomePage.tsx
│   │   ├── NewTicketPage.tsx
│   │   └── TicketDetailPage.tsx
│   │
│   ├── hooks/                   # 自定义 Hooks
│   │   ├── useTickets.ts
│   │   ├── useLabels.ts
│   │   ├── useDebounce.ts
│   │   └── useLocalStorage.ts
│   │
│   ├── services/                # API 服务
│   │   ├── api.ts               # Axios 实例配置、拦截器
│   │   ├── ticketApi.ts         # Ticket API 客户端
│   │   └── labelApi.ts          # Label API 客户端
│   │
│   ├── types/                   # TypeScript 类型定义
│   │   ├── ticket.ts
│   │   ├── label.ts
│   │   └── api.ts
│   │
│   ├── lib/                     # 工具函数
│   │   ├── utils.ts             # cn() 等工具
│   │   ├── constants.ts         # 常量定义
│   │   ├── format.ts            # 格式化函数（时间、日期）
│   │   └── colors.ts            # 预设颜色
│   │
│   └── styles/
│       └── globals.css          # 全局样式、Tailwind 导入
│
├── public/
│   └── favicon.ico
│
├── index.html                   # HTML 模板
├── package.json                 # NPM 依赖和脚本
├── tsconfig.json                # TypeScript 配置
├── tsconfig.node.json           # Node 环境 TS 配置
├── vite.config.ts               # Vite 配置
├── tailwind.config.ts           # Tailwind 配置
├── postcss.config.js            # PostCSS 配置
├── components.json              # Shadcn/ui 配置
├── .env                         # 环境变量
├── .env.example
├── .gitignore
├── .eslintrc.json               # ESLint 配置
├── .prettierrc                  # Prettier 配置
└── README.md
```

---

## 7. 开发规范

### 7.1 代码规范

#### 7.1.1 后端规范（Python）

- **格式化**: 使用 `black` + `isort`
- **Lint**: 使用 `flake8` 或 `ruff`
- **类型检查**: 使用 `mypy`
- **命名约定**:
  - 函数/变量: `snake_case`
  - 类: `PascalCase`
  - 常量: `UPPER_SNAKE_CASE`

**示例配置** (pyproject.toml):
```toml
[tool.black]
line-length = 100

[tool.isort]
profile = "black"

[tool.mypy]
python_version = "3.12"
strict = true
```

#### 7.1.2 前端规范（TypeScript）

- **格式化**: 使用 `Prettier`
- **Lint**: 使用 `ESLint`
- **类型检查**: `TypeScript` 严格模式
- **命名约定**:
  - 组件: `PascalCase`
  - 函数/变量: `camelCase`
  - 常量: `UPPER_SNAKE_CASE`
  - 类型/接口: `PascalCase`

**示例配置** (.eslintrc.json):
```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "prettier"
  ],
  "rules": {
    "react/react-in-jsx-scope": "off"
  }
}
```

### 7.2 Git 工作流

#### 7.2.1 分支策略

- `main`: 主分支，保持稳定
- `develop`: 开发分支
- `feature/*`: 功能分支
- `bugfix/*`: Bug 修复分支

#### 7.2.2 提交规范（Conventional Commits）

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type 类型**:
- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 重构
- `test`: 测试
- `chore`: 构建/工具配置

**示例**:
```
feat(ticket): add search functionality

- Implement title search with debounce
- Add search input in header
- Update API to support title filter

Closes #123
```

---

## 8. 部署方案

### 8.1 开发环境

#### 8.1.1 后端启动

```bash
cd backend

# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，设置 DATABASE_URL

# 运行数据库迁移
alembic upgrade head

# 启动开发服务器
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### 8.1.2 前端启动

```bash
cd frontend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env，设置 VITE_API_BASE_URL=http://localhost:8000/api/v1

# 启动开发服务器
npm run dev
```

访问 http://localhost:5173

### 8.2 生产环境（简单部署）

#### 8.2.1 本地部署

使用本地 Postgres 数据库
- 数据库名称：tickethub
- 用户名称：postgres
- 用户密码：123456

---

## 9. 测试策略

### 9.1 后端测试

#### 9.1.1 单元测试（Pytest）

```python
# tests/test_tickets.py
import pytest
from app.services.ticket_service import TicketService

def test_create_ticket(db_session):
    service = TicketService(db_session)
    ticket = service.create(
        title="Test Ticket",
        priority="high"
    )
    assert ticket.title == "Test Ticket"
    assert ticket.status == "open"
```

#### 9.1.2 API 测试（FastAPI TestClient）

```python
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_get_tickets():
    response = client.get("/api/v1/tickets")
    assert response.status_code == 200
    assert "data" in response.json()
```

### 9.2 前端测试

#### 9.2.1 单元测试（Vitest + React Testing Library）

```typescript
// TicketCard.test.tsx
import { render, screen } from '@testing-library/react';
import { TicketCard } from './TicketCard';

test('renders ticket title', () => {
  const ticket = {
    id: '1',
    title: 'Test Ticket',
    status: 'open',
    // ...
  };
  
  render(<TicketCard ticket={ticket} />);
  expect(screen.getByText('Test Ticket')).toBeInTheDocument();
});
```

#### 9.2.2 E2E 测试（Playwright）

```typescript
// e2e/tickets.spec.ts
import { test, expect } from '@playwright/test';

test('create a new ticket', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await page.click('text=新建 Ticket');
  await page.fill('input[name="title"]', 'New Ticket');
  await page.click('button:has-text("创建")');
  await expect(page.locator('text=New Ticket')).toBeVisible();
});
```

---

## 10. 附录

### 10.1 环境变量配置

#### 10.1.1 后端环境变量

```bash
# backend/.env.example
DATABASE_URL=postgresql://postgres:123456@localhost:5432/tickethub
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# 可选配置
DEBUG=True
LOG_LEVEL=INFO
```

#### 10.1.2 前端环境变量

```bash
# frontend/.env.example
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

### 10.2 预设颜色定义

```typescript
// frontend/src/lib/colors.ts
export const PRESET_COLORS = [
  { name: '红色', value: '#ef4444' },
  { name: '深红', value: '#dc2626' },
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

### 10.3 TypeScript 类型定义

```typescript
// frontend/src/types/ticket.ts
export type TicketPriority = 'low' | 'medium' | 'high';
export type TicketStatus = 'open' | 'completed';

export interface Ticket {
  id: string;
  title: string;
  description: string | null;
  priority: TicketPriority;
  status: TicketStatus;
  labels: Label[];
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface CreateTicketInput {
  title: string;
  description?: string;
  priority?: TicketPriority;
  label_ids?: string[];
}

export interface UpdateTicketInput {
  title?: string;
  description?: string;
  priority?: TicketPriority;
  label_ids?: string[];
}

export interface TicketFilters {
  title?: string;
  status?: 'all' | TicketStatus;
  priority?: TicketPriority;
  label_ids?: string[];
  no_label?: boolean;
  sort_by?: 'created_at' | 'updated_at' | 'priority';
  sort_order?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
}

// frontend/src/types/label.ts
export interface Label {
  id: string;
  name: string;
  color: string;
  description: string | null;
  ticket_count?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateLabelInput {
  name: string;
  color?: string;
  description?: string;
}

export interface UpdateLabelInput {
  name?: string;
  color?: string;
  description?: string;
}
```

---

## 11. 开发计划与里程碑

### 第一阶段：项目初始化（Day 1）
- [ ] 创建项目仓库，初始化 Git
- [ ] 配置后端项目结构，安装 FastAPI、SQLAlchemy、Alembic
- [ ] 配置前端项目，安装 React、Vite、Tailwind、Shadcn
- [ ] 设置 PostgreSQL 数据库
- [ ] 配置开发环境和工具链

### 第二阶段：数据库与后端核心 API（Day 2-3）
- [ ] 编写数据库模型和迁移脚本
- [ ] 实现 Ticket CRUD API
- [ ] 实现 Ticket 完成/取消完成 API
- [ ] 实现 Label CRUD API
- [ ] 实现搜索和筛选逻辑
- [ ] 编写 API 单元测试

### 第三阶段：前端核心功能（Day 4-5）
- [ ] 实现主布局（Header + Sidebar + Content）
- [ ] 实现 Ticket 列表和卡片组件
- [ ] 实现 Ticket 创建/编辑表单
- [ ] 实现 Ticket 完成/取消完成交互
- [ ] 实现标签筛选功能（侧边栏）
- [ ] 集成 TanStack Query 状态管理

### 第四阶段：搜索与标签管理（Day 6）
- [ ] 实现搜索功能（防抖、实时过滤）
- [ ] 实现标签创建/编辑/删除功能
- [ ] 实现标签选择器（多选）
- [ ] 实现标签与 Ticket 的关联管理

### 第五阶段：UI 优化与响应式（Day 7）
- [ ] 响应式布局适配（移动端/平板/桌面）
- [ ] 加载状态和错误处理
- [ ] 动画和过渡效果
- [ ] 空状态和边界情况处理
- [ ] 无障碍性（Accessibility）优化

### 第六阶段：测试与部署（Day 8）
- [ ] 前端单元测试和 E2E 测试
- [ ] 后端 API 集成测试
- [ ] 性能优化和代码审查
- [ ] 编写部署文档
- [ ] Docker 容器化（可选）

---

## 12. 风险与挑战

### 12.1 技术风险

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| PostgreSQL 18.x 兼容性问题 | 中 | 使用稳定的驱动版本，充分测试 |
| Vite 7 / React 19 新特性不稳定 | 中 | 关注官方文档，避免使用实验性功能 |
| Tailwind 4 配置复杂 | 低 | 参考官方迁移指南，使用默认配置 |

### 12.2 业务风险

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 需求理解偏差 | 高 | 与用户频繁沟通，快速迭代原型 |
| 性能问题（大数据量） | 中 | 数据库索引优化，分页加载，虚拟列表 |

---

## 13. 参考资料

### 13.1 官方文档
- [FastAPI 文档](https://fastapi.tiangolo.com/)
- [React 19 文档](https://react.dev/)
- [Vite 7 文档](https://vitejs.dev/)
- [Tailwind CSS 4 文档](https://tailwindcss.com/)
- [Shadcn/ui 文档](https://ui.shadcn.com/)
- [PostgreSQL 18 文档](https://www.postgresql.org/docs/18/)
- [TanStack Query 文档](https://tanstack.com/query/latest)

### 13.2 技术选型参考
- [SQLAlchemy 2.0 文档](https://docs.sqlalchemy.org/en/20/)
- [Alembic 文档](https://alembic.sqlalchemy.org/)
- [Pydantic 文档](https://docs.pydantic.dev/)
- [Axios 文档](https://axios-http.com/)
- [React Router 文档](https://reactrouter.com/)

---

**文档结束**

本需求和设计文档涵盖了 Project Alpha Ticket 管理系统的全面设计，包括功能需求、数据库设计、API 设计、前端设计、项目结构、开发规范、部署方案等，为项目开发提供完整指导。

