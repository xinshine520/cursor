# Project Alpha - Ticket 管理系统实现计划

## 文档信息
- **项目名称**: Project Alpha - Ticket 管理系统
- **计划版本**: v1.0
- **创建日期**: 2025-12-04
- **基于文档**: v1-spec-sonnet.md
- **预计工期**: 8 个工作日

---

## 1. 项目概述

### 1.1 实现目标
基于需求和设计文档，完整实现一个功能完整、代码质量高、用户体验优秀的 Ticket 管理系统。

### 1.2 技术栈确认
- **数据库**: PostgreSQL 18.x
- **后端**: FastAPI 0.123.x + Python 3.12+ + SQLAlchemy + Alembic
- **前端**: React 19.x + Vite 7.x + TypeScript 5.x + Tailwind CSS 4.x + Shadcn/ui

### 1.3 核心功能清单
- ✅ Ticket CRUD（创建、读取、更新、删除）
- ✅ Ticket 状态管理（完成/取消完成）
- ✅ Label CRUD
- ✅ Ticket 与 Label 关联管理
- ✅ 按 Title 搜索 Ticket（模糊匹配、防抖）
- ✅ 按 Label 筛选 Ticket
- ✅ 按状态/优先级筛选
- ✅ 分页功能
- ✅ 响应式 UI

---

## 2. 实现阶段规划

### 🔷 Phase 1: 项目初始化与环境搭建（Day 1）

#### 2.1.1 目标
- 完成项目基础架构搭建
- 配置开发环境和工具链
- 确保前后端能正常通信

#### 2.1.2 后端初始化任务

**任务 1.1: 创建后端项目结构**
```bash
# 创建目录
mkdir -p ./src/project-alpha/backend/{app/{models,schemas,routers,services,utils},alembic/versions,tests}
cd ./src/project-alpha/backend

# 使用 uv 初始化 Python 项目
uv init --python 3.12
```

**任务 1.2: 配置依赖并安装**

创建 `backend/pyproject.toml`:
```toml
[project]
name = "tickethub"
version = "0.1.0"
description = "Ticket 管理系统后端"
requires-python = ">=3.12"
dependencies = [
    "fastapi==0.123.0",
    "uvicorn[standard]==0.30.0",
    "sqlalchemy==2.0.35",
    "psycopg2-binary==2.9.10",
    "alembic==1.13.3",
    "pydantic==2.9.2",
    "pydantic-settings==2.5.2",
    "python-dotenv==1.0.1",
]

[project.optional-dependencies]
dev = [
    "black==24.10.0",
    "isort==5.13.2",
    "flake8==7.1.1",
    "mypy==1.13.0",
    "pytest==8.3.3",
    "pytest-asyncio==0.24.0",
    "httpx==0.27.2",
]

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"
```

```bash
# 安装依赖
uv sync
uv sync --extra dev
```

**任务 1.3: 配置数据库连接**

创建 `backend/env.example`:
```env
DATABASE_URL=postgresql://postgres:123456@localhost:5432/tickethub
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
DEBUG=True
LOG_LEVEL=INFO
```

创建 `backend/app/config.py`:
```python
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    DATABASE_URL: str
    CORS_ORIGINS: str
    DEBUG: bool = True
    LOG_LEVEL: str = "INFO"
    
    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
    
    class Config:
        env_file = ".env"

settings = Settings()
```

**任务 1.4: 配置 FastAPI 应用入口**

创建 `backend/app/main.py`:
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings

app = FastAPI(
    title="Ticket Hub API",
    version="1.0.0",
    description="Ticket 管理系统 API"
)

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Ticket Hub API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
```

**任务 1.5: 配置数据库连接**

创建 `backend/app/database.py`:
```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

**任务 1.6: 初始化 Alembic**
```bash
# 使用 uv 运行 alembic 初始化
uv run alembic init alembic
```

修改 `backend/alembic.ini`:
```ini
sqlalchemy.url = postgresql://postgres:123456@localhost:5432/tickethub
```

修改 `backend/alembic/env.py`:
```python
from app.database import Base
from app.models import *  # 导入所有模型
target_metadata = Base.metadata
```

**任务 1.7: 启动后端验证**
```bash
# 确保已安装依赖
uv sync

# 启动开发服务器
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
访问 http://localhost:8000/docs 验证 Swagger 文档

#### 2.1.3 前端初始化任务

**任务 1.8: 创建 Vite + React + TypeScript 项目**
```bash
cd ./src/project-alpha
npm create vite@latest frontend -- --template react-ts
cd frontend
```

**任务 1.9: 安装前端依赖**
```bash
# 核心依赖
npm install react-router-dom @tanstack/react-query axios

# UI 库
npm install tailwindcss@next postcss autoprefixer
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-checkbox @radix-ui/react-select

# 工具库
npm install clsx tailwind-merge date-fns

# 开发依赖
npm install -D @types/node
npm install -D eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser
npm install -D prettier eslint-config-prettier
```

**任务 1.10: 初始化 Shadcn/ui**
```bash
npx shadcn@latest init
```

配置选项:
- Style: Default
- Base color: Slate
- CSS variables: Yes

**任务 1.11: 配置 Tailwind CSS**

`frontend/tailwind.config.ts`:
```typescript
import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config
```

**任务 1.12: 配置环境变量**

创建 `frontend/.env.example`:
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

**任务 1.13: 创建基础目录结构**
```bash
mkdir -p src/{components/{ui,layout,tickets,labels,common},pages,hooks,services,types,lib,styles}
```

**任务 1.14: 配置 Axios 实例**

创建 `frontend/src/services/api.ts`:
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.detail || error.message;
    console.error('API Error:', message);
    return Promise.reject(error);
  }
);

export default api;
```

**任务 1.15: 启动前端验证**
```bash
npm run dev
```
访问 http://localhost:5173 验证页面

#### 2.1.4 验收标准
- ✅ 后端能正常启动，Swagger 文档可访问
- ✅ 前端能正常启动，页面可访问
- ✅ 数据库连接成功
- ✅ CORS 配置正确，前端可调用后端健康检查接口

---

### 🔷 Phase 2: 数据库设计与模型实现（Day 2）

#### 2.2.1 目标
- 实现所有数据库模型
- 创建数据库迁移脚本
- 配置触发器和索引

#### 2.2.2 数据库模型实现

**任务 2.1: 创建 Base 模型**

`backend/app/models/base.py`:
```python
from sqlalchemy import Column, DateTime, func
from app.database import Base

class TimestampMixin:
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
```

**任务 2.2: 创建 Ticket 模型**

`backend/app/models/ticket.py`:
```python
from sqlalchemy import Column, String, Text, Enum, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
import enum

from app.models.base import TimestampMixin
from app.database import Base

class TicketPriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class TicketStatus(str, enum.Enum):
    OPEN = "open"
    COMPLETED = "completed"

class Ticket(Base, TimestampMixin):
    __tablename__ = "tickets"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(200), nullable=False, index=True)
    description = Column(Text, nullable=True)
    priority = Column(Enum(TicketPriority), nullable=False, default=TicketPriority.MEDIUM, index=True)
    status = Column(Enum(TicketStatus), nullable=False, default=TicketStatus.OPEN, index=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    # 关系
    labels = relationship("Label", secondary="ticket_labels", back_populates="tickets")
```

**任务 2.3: 创建 Label 模型**

`backend/app/models/label.py`:
```python
from sqlalchemy import Column, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from app.models.base import TimestampMixin
from app.database import Base

class Label(Base, TimestampMixin):
    __tablename__ = "labels"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(50), nullable=False, unique=True, index=True)
    color = Column(String(7), nullable=False, default="#6366f1")
    description = Column(String(200), nullable=True)
    
    # 关系
    tickets = relationship("Ticket", secondary="ticket_labels", back_populates="labels")
```

**任务 2.4: 创建关联表模型**

`backend/app/models/ticket_label.py`:
```python
from sqlalchemy import Column, ForeignKey, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base

class TicketLabel(Base):
    __tablename__ = "ticket_labels"
    
    ticket_id = Column(UUID(as_uuid=True), ForeignKey("tickets.id", ondelete="CASCADE"), primary_key=True)
    label_id = Column(UUID(as_uuid=True), ForeignKey("labels.id", ondelete="CASCADE"), primary_key=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
```

**任务 2.5: 创建 models __init__.py**

`backend/app/models/__init__.py`:
```python
from app.models.ticket import Ticket, TicketPriority, TicketStatus
from app.models.label import Label
from app.models.ticket_label import TicketLabel

__all__ = ["Ticket", "Label", "TicketLabel", "TicketPriority", "TicketStatus"]
```

#### 2.2.3 数据库迁移

**任务 2.6: 生成迁移脚本**
```bash
uv run alembic revision --autogenerate -m "Initial schema: tickets, labels, ticket_labels"
```

**任务 2.7: 手动编辑迁移脚本添加索引和触发器**

编辑生成的迁移文件 `alembic/versions/xxx_initial_schema.py`，添加:

```python
from alembic import op
import sqlalchemy as sa

def upgrade():
    # ... 自动生成的表创建代码 ...
    
    # 添加全文搜索索引
    op.execute("""
        CREATE INDEX idx_tickets_title_gin ON tickets 
        USING gin(to_tsvector('simple', title));
    """)
    
    # 添加模糊搜索索引
    op.execute("""
        CREATE INDEX idx_tickets_title_like ON tickets(title varchar_pattern_ops);
    """)
    
    # 创建 updated_at 触发器函数
    op.execute("""
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = CURRENT_TIMESTAMP;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    """)
    
    # 为 tickets 表创建触发器
    op.execute("""
        CREATE TRIGGER trg_tickets_update_updated_at
        BEFORE UPDATE ON tickets
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    """)
    
    # 为 labels 表创建触发器
    op.execute("""
        CREATE TRIGGER trg_labels_update_updated_at
        BEFORE UPDATE ON labels
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    """)
    
    # 创建 completed_at 触发器函数
    op.execute("""
        CREATE OR REPLACE FUNCTION set_completed_at_on_status_change()
        RETURNS TRIGGER AS $$
        BEGIN
            IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
                NEW.completed_at = CURRENT_TIMESTAMP;
            END IF;
            
            IF NEW.status = 'open' AND OLD.status = 'completed' THEN
                NEW.completed_at = NULL;
            END IF;
            
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    """)
    
    # 为 tickets 表创建状态触发器
    op.execute("""
        CREATE TRIGGER trg_tickets_set_completed_at
        BEFORE UPDATE OF status ON tickets
        FOR EACH ROW
        EXECUTE FUNCTION set_completed_at_on_status_change();
    """)
    
    # 插入预设标签
    op.execute("""
        INSERT INTO labels (id, name, color, description) VALUES
        (gen_random_uuid(), 'Bug', '#ef4444', '需要修复的缺陷或错误'),
        (gen_random_uuid(), 'Feature', '#22c55e', '新功能开发'),
        (gen_random_uuid(), 'Enhancement', '#3b82f6', '现有功能改进'),
        (gen_random_uuid(), 'Documentation', '#8b5cf6', '文档相关任务'),
        (gen_random_uuid(), 'Question', '#f59e0b', '需要讨论或澄清的问题'),
        (gen_random_uuid(), 'Urgent', '#dc2626', '紧急任务')
        ON CONFLICT (name) DO NOTHING;
    """)

def downgrade():
    # 清理逆序操作
    op.execute("DROP TRIGGER IF EXISTS trg_tickets_set_completed_at ON tickets;")
    op.execute("DROP TRIGGER IF EXISTS trg_tickets_update_updated_at ON tickets;")
    op.execute("DROP TRIGGER IF EXISTS trg_labels_update_updated_at ON labels;")
    op.execute("DROP FUNCTION IF EXISTS set_completed_at_on_status_change();")
    op.execute("DROP FUNCTION IF EXISTS update_updated_at_column();")
    # ... 表删除操作 ...
```

**任务 2.8: 执行迁移**
```bash
uv run alembic upgrade head
```

**任务 2.9: 验证数据库结构**
```bash
# 连接数据库
psql -U postgres -d tickethub

# 查看表结构
\dt
\d tickets
\d labels
\d ticket_labels

# 查看预设标签
SELECT * FROM labels;
```

#### 2.2.4 验收标准
- ✅ 所有表创建成功
- ✅ 索引创建成功
- ✅ 触发器创建成功
- ✅ 预设标签插入成功
- ✅ 外键约束正确

---

### 🔷 Phase 3: 后端 Pydantic Schemas（Day 2）

#### 2.3.1 目标
- 定义所有 API 请求/响应的 Pydantic 模型

#### 2.3.2 Schema 实现

**任务 3.1: 创建通用 Schemas**

`backend/app/schemas/common.py`:
```python
from pydantic import BaseModel
from typing import Generic, TypeVar, List

DataT = TypeVar("DataT")

class PaginationParams(BaseModel):
    page: int = 1
    page_size: int = 20
    
class PaginationMeta(BaseModel):
    page: int
    page_size: int
    total: int
    total_pages: int
    has_next: bool
    has_prev: bool

class PaginatedResponse(BaseModel, Generic[DataT]):
    data: List[DataT]
    pagination: PaginationMeta
```

**任务 3.2: 创建 Label Schemas**

`backend/app/schemas/label.py`:
```python
from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID
from typing import Optional

# 创建标签
class LabelCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    color: str = Field(default="#6366f1", pattern=r"^#[0-9A-Fa-f]{6}$")
    description: Optional[str] = Field(None, max_length=200)

# 更新标签
class LabelUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=50)
    color: Optional[str] = Field(None, pattern=r"^#[0-9A-Fa-f]{6}$")
    description: Optional[str] = Field(None, max_length=200)

# 标签响应（基础）
class LabelBase(BaseModel):
    id: UUID
    name: str
    color: str
    description: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# 标签响应（带 Ticket 数量）
class LabelWithCount(LabelBase):
    ticket_count: int = 0
```

**任务 3.3: 创建 Ticket Schemas**

`backend/app/schemas/ticket.py`:
```python
from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID
from typing import Optional, List
from app.models.ticket import TicketPriority, TicketStatus
from app.schemas.label import LabelBase

# 创建 Ticket
class TicketCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=10000)
    priority: TicketPriority = TicketPriority.MEDIUM
    label_ids: List[UUID] = Field(default_factory=list)

# 更新 Ticket
class TicketUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=10000)
    priority: Optional[TicketPriority] = None
    label_ids: Optional[List[UUID]] = None

# Ticket 响应
class TicketResponse(BaseModel):
    id: UUID
    title: str
    description: Optional[str] = None
    priority: TicketPriority
    status: TicketStatus
    labels: List[LabelBase]
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Ticket 状态更新响应
class TicketStatusResponse(BaseModel):
    id: UUID
    status: TicketStatus
    completed_at: Optional[datetime] = None
```

#### 2.3.3 验收标准
- ✅ 所有 Schema 定义完整
- ✅ 字段验证规则正确
- ✅ 类型注解完整

---

### 🔷 Phase 4: 后端 Service 层（Day 3）

#### 2.4.1 目标
- 实现业务逻辑层
- 处理数据库 CRUD 操作

#### 2.4.2 Service 实现

**任务 4.1: 创建 Label Service**

`backend/app/services/label_service.py`:
```python
from sqlalchemy.orm import Session
from sqlalchemy import func, select
from typing import List, Optional
from uuid import UUID

from app.models.label import Label
from app.models.ticket_label import TicketLabel
from app.schemas.label import LabelCreate, LabelUpdate
from fastapi import HTTPException, status

class LabelService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_all(self, with_count: bool = True, sort_by: str = "created_at") -> List[Label]:
        query = self.db.query(Label)
        
        if with_count:
            query = query.outerjoin(TicketLabel).group_by(Label.id)
            query = query.add_columns(func.count(TicketLabel.ticket_id).label("ticket_count"))
        
        if sort_by == "name":
            query = query.order_by(Label.name)
        else:
            query = query.order_by(Label.created_at.desc())
        
        return query.all()
    
    def get_by_id(self, label_id: UUID) -> Optional[Label]:
        return self.db.query(Label).filter(Label.id == label_id).first()
    
    def create(self, label_data: LabelCreate) -> Label:
        # 检查名称唯一性
        existing = self.db.query(Label).filter(
            func.lower(Label.name) == label_data.name.lower()
        ).first()
        
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Label with this name already exists"
            )
        
        label = Label(**label_data.dict())
        self.db.add(label)
        self.db.commit()
        self.db.refresh(label)
        return label
    
    def update(self, label_id: UUID, label_data: LabelUpdate) -> Label:
        label = self.get_by_id(label_id)
        if not label:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Label not found"
            )
        
        # 检查名称唯一性（排除自己）
        if label_data.name:
            existing = self.db.query(Label).filter(
                func.lower(Label.name) == label_data.name.lower(),
                Label.id != label_id
            ).first()
            
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Label with this name already exists"
                )
        
        # 更新字段
        for field, value in label_data.dict(exclude_unset=True).items():
            setattr(label, field, value)
        
        self.db.commit()
        self.db.refresh(label)
        return label
    
    def delete(self, label_id: UUID) -> None:
        label = self.get_by_id(label_id)
        if not label:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Label not found"
            )
        
        self.db.delete(label)
        self.db.commit()
    
    def get_ticket_count(self, label_id: UUID) -> int:
        return self.db.query(TicketLabel).filter(
            TicketLabel.label_id == label_id
        ).count()
```

**任务 4.2: 创建 Ticket Service**

`backend/app/services/ticket_service.py`:
```python
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, or_, and_
from typing import List, Optional
from uuid import UUID
from datetime import datetime

from app.models.ticket import Ticket, TicketStatus
from app.models.label import Label
from app.models.ticket_label import TicketLabel
from app.schemas.ticket import TicketCreate, TicketUpdate
from fastapi import HTTPException, status

class TicketService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_list(
        self,
        title: Optional[str] = None,
        status_filter: Optional[str] = "all",
        priority: Optional[str] = None,
        label_ids: Optional[List[UUID]] = None,
        no_label: bool = False,
        sort_by: str = "created_at",
        sort_order: str = "desc",
        page: int = 1,
        page_size: int = 20
    ):
        query = self.db.query(Ticket).options(joinedload(Ticket.labels))
        
        # 标题搜索
        if title:
            query = query.filter(Ticket.title.ilike(f"%{title}%"))
        
        # 状态筛选
        if status_filter and status_filter != "all":
            query = query.filter(Ticket.status == status_filter)
        
        # 优先级筛选
        if priority:
            query = query.filter(Ticket.priority == priority)
        
        # 标签筛选
        if label_ids:
            for label_id in label_ids:
                query = query.join(TicketLabel).filter(TicketLabel.label_id == label_id)
        
        # 无标签筛选
        if no_label:
            query = query.outerjoin(TicketLabel).filter(TicketLabel.label_id.is_(None))
        
        # 排序
        if sort_by == "priority":
            order_col = Ticket.priority
        elif sort_by == "updated_at":
            order_col = Ticket.updated_at
        else:
            order_col = Ticket.created_at
        
        if sort_order == "asc":
            query = query.order_by(order_col.asc())
        else:
            query = query.order_by(order_col.desc())
        
        # 总数
        total = query.count()
        
        # 分页
        offset = (page - 1) * page_size
        tickets = query.offset(offset).limit(page_size).all()
        
        # 分页元信息
        total_pages = (total + page_size - 1) // page_size
        pagination = {
            "page": page,
            "page_size": page_size,
            "total": total,
            "total_pages": total_pages,
            "has_next": page < total_pages,
            "has_prev": page > 1
        }
        
        return tickets, pagination
    
    def get_by_id(self, ticket_id: UUID) -> Optional[Ticket]:
        return self.db.query(Ticket).options(
            joinedload(Ticket.labels)
        ).filter(Ticket.id == ticket_id).first()
    
    def create(self, ticket_data: TicketCreate) -> Ticket:
        # 提取 label_ids
        label_ids = ticket_data.label_ids
        ticket_dict = ticket_data.dict(exclude={"label_ids"})
        
        # 创建 Ticket
        ticket = Ticket(**ticket_dict)
        self.db.add(ticket)
        self.db.flush()
        
        # 关联标签
        if label_ids:
            labels = self.db.query(Label).filter(Label.id.in_(label_ids)).all()
            ticket.labels = labels
        
        self.db.commit()
        self.db.refresh(ticket)
        return ticket
    
    def update(self, ticket_id: UUID, ticket_data: TicketUpdate) -> Ticket:
        ticket = self.get_by_id(ticket_id)
        if not ticket:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Ticket not found"
            )
        
        # 提取 label_ids
        label_ids = ticket_data.label_ids
        update_dict = ticket_data.dict(exclude={"label_ids"}, exclude_unset=True)
        
        # 更新字段
        for field, value in update_dict.items():
            setattr(ticket, field, value)
        
        # 更新标签关联
        if label_ids is not None:
            labels = self.db.query(Label).filter(Label.id.in_(label_ids)).all()
            ticket.labels = labels
        
        self.db.commit()
        self.db.refresh(ticket)
        return ticket
    
    def delete(self, ticket_id: UUID) -> None:
        ticket = self.get_by_id(ticket_id)
        if not ticket:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Ticket not found"
            )
        
        self.db.delete(ticket)
        self.db.commit()
    
    def complete(self, ticket_id: UUID) -> Ticket:
        ticket = self.get_by_id(ticket_id)
        if not ticket:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Ticket not found"
            )
        
        if ticket.status == TicketStatus.COMPLETED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ticket is already completed"
            )
        
        ticket.status = TicketStatus.COMPLETED
        # completed_at 由触发器自动设置
        
        self.db.commit()
        self.db.refresh(ticket)
        return ticket
    
    def reopen(self, ticket_id: UUID) -> Ticket:
        ticket = self.get_by_id(ticket_id)
        if not ticket:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Ticket not found"
            )
        
        if ticket.status == TicketStatus.OPEN:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ticket is not completed"
            )
        
        ticket.status = TicketStatus.OPEN
        # completed_at 由触发器自动清除
        
        self.db.commit()
        self.db.refresh(ticket)
        return ticket
```

#### 2.4.3 验收标准
- ✅ Service 方法实现完整
- ✅ 错误处理完善
- ✅ 业务逻辑正确

---

### 🔷 Phase 5: 后端 API 路由（Day 3）

#### 2.5.1 目标
- 实现所有 RESTful API 端点
- 连接 Service 层

#### 2.5.2 Router 实现

**任务 5.1: 创建依赖注入工具**

`backend/app/utils/dependencies.py`:
```python
from fastapi import Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.ticket_service import TicketService
from app.services.label_service import LabelService

def get_ticket_service(db: Session = Depends(get_db)) -> TicketService:
    return TicketService(db)

def get_label_service(db: Session = Depends(get_db)) -> LabelService:
    return LabelService(db)
```

**任务 5.2: 创建 Label Router**

`backend/app/routers/labels.py`:
```python
from fastapi import APIRouter, Depends, status
from typing import List
from uuid import UUID

from app.schemas.label import LabelCreate, LabelUpdate, LabelBase, LabelWithCount
from app.services.label_service import LabelService
from app.utils.dependencies import get_label_service

router = APIRouter(prefix="/labels", tags=["Labels"])

@router.get("/", response_model=dict)
async def get_labels(
    with_count: bool = True,
    sort_by: str = "created_at",
    service: LabelService = Depends(get_label_service)
):
    labels = service.get_all(with_count=with_count, sort_by=sort_by)
    
    if with_count:
        data = [
            {
                **LabelBase.from_orm(label).dict(),
                "ticket_count": ticket_count
            }
            for label, ticket_count in labels
        ]
    else:
        data = [LabelBase.from_orm(label).dict() for label in labels]
    
    return {"data": data, "total": len(data)}

@router.get("/{label_id}", response_model=LabelWithCount)
async def get_label(
    label_id: UUID,
    service: LabelService = Depends(get_label_service)
):
    label = service.get_by_id(label_id)
    if not label:
        raise HTTPException(status_code=404, detail="Label not found")
    
    ticket_count = service.get_ticket_count(label_id)
    return {**LabelBase.from_orm(label).dict(), "ticket_count": ticket_count}

@router.post("/", response_model=LabelWithCount, status_code=status.HTTP_201_CREATED)
async def create_label(
    label_data: LabelCreate,
    service: LabelService = Depends(get_label_service)
):
    label = service.create(label_data)
    return {**LabelBase.from_orm(label).dict(), "ticket_count": 0}

@router.put("/{label_id}", response_model=LabelWithCount)
async def update_label(
    label_id: UUID,
    label_data: LabelUpdate,
    service: LabelService = Depends(get_label_service)
):
    label = service.update(label_id, label_data)
    ticket_count = service.get_ticket_count(label_id)
    return {**LabelBase.from_orm(label).dict(), "ticket_count": ticket_count}

@router.delete("/{label_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_label(
    label_id: UUID,
    service: LabelService = Depends(get_label_service)
):
    service.delete(label_id)
    return None
```

**任务 5.3: 创建 Ticket Router**

`backend/app/routers/tickets.py`:
```python
from fastapi import APIRouter, Depends, Query, status
from typing import List, Optional
from uuid import UUID

from app.schemas.ticket import TicketCreate, TicketUpdate, TicketResponse, TicketStatusResponse
from app.schemas.common import PaginatedResponse, PaginationMeta
from app.services.ticket_service import TicketService
from app.utils.dependencies import get_ticket_service

router = APIRouter(prefix="/tickets", tags=["Tickets"])

@router.get("/", response_model=PaginatedResponse[TicketResponse])
async def get_tickets(
    title: Optional[str] = None,
    status: Optional[str] = "all",
    priority: Optional[str] = None,
    label_ids: Optional[str] = None,
    no_label: bool = False,
    sort_by: str = "created_at",
    sort_order: str = "desc",
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    service: TicketService = Depends(get_ticket_service)
):
    # 解析 label_ids
    label_id_list = []
    if label_ids:
        label_id_list = [UUID(id.strip()) for id in label_ids.split(",")]
    
    tickets, pagination = service.get_list(
        title=title,
        status_filter=status,
        priority=priority,
        label_ids=label_id_list,
        no_label=no_label,
        sort_by=sort_by,
        sort_order=sort_order,
        page=page,
        page_size=page_size
    )
    
    return {
        "data": [TicketResponse.from_orm(ticket) for ticket in tickets],
        "pagination": pagination
    }

@router.get("/{ticket_id}", response_model=TicketResponse)
async def get_ticket(
    ticket_id: UUID,
    service: TicketService = Depends(get_ticket_service)
):
    ticket = service.get_by_id(ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket

@router.post("/", response_model=TicketResponse, status_code=status.HTTP_201_CREATED)
async def create_ticket(
    ticket_data: TicketCreate,
    service: TicketService = Depends(get_ticket_service)
):
    ticket = service.create(ticket_data)
    return ticket

@router.put("/{ticket_id}", response_model=TicketResponse)
async def update_ticket(
    ticket_id: UUID,
    ticket_data: TicketUpdate,
    service: TicketService = Depends(get_ticket_service)
):
    ticket = service.update(ticket_id, ticket_data)
    return ticket

@router.delete("/{ticket_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_ticket(
    ticket_id: UUID,
    service: TicketService = Depends(get_ticket_service)
):
    service.delete(ticket_id)
    return None

@router.patch("/{ticket_id}/complete", response_model=TicketStatusResponse)
async def complete_ticket(
    ticket_id: UUID,
    service: TicketService = Depends(get_ticket_service)
):
    ticket = service.complete(ticket_id)
    return {
        "id": ticket.id,
        "status": ticket.status,
        "completed_at": ticket.completed_at
    }

@router.patch("/{ticket_id}/reopen", response_model=TicketStatusResponse)
async def reopen_ticket(
    ticket_id: UUID,
    service: TicketService = Depends(get_ticket_service)
):
    ticket = service.reopen(ticket_id)
    return {
        "id": ticket.id,
        "status": ticket.status,
        "completed_at": ticket.completed_at
    }
```

**任务 5.4: 注册路由到主应用**

修改 `backend/app/main.py`:
```python
from app.routers import tickets, labels

app.include_router(tickets.router, prefix="/api/v1")
app.include_router(labels.router, prefix="/api/v1")
```

#### 2.5.3 API 测试

**任务 5.5: 使用 Swagger UI 测试所有端点**
访问 http://localhost:8000/docs，测试:
- ✅ GET /api/v1/labels
- ✅ POST /api/v1/labels
- ✅ PUT /api/v1/labels/{id}
- ✅ DELETE /api/v1/labels/{id}
- ✅ GET /api/v1/tickets
- ✅ POST /api/v1/tickets
- ✅ PUT /api/v1/tickets/{id}
- ✅ DELETE /api/v1/tickets/{id}
- ✅ PATCH /api/v1/tickets/{id}/complete
- ✅ PATCH /api/v1/tickets/{id}/reopen

#### 2.5.4 验收标准
- ✅ 所有 API 端点正常工作
- ✅ 请求验证正确
- ✅ 错误响应格式统一
- ✅ Swagger 文档完整

---

### 🔷 Phase 6: 前端类型定义与 API 服务（Day 4）

#### 2.6.1 目标
- 定义 TypeScript 类型
- 实现 API 客户端

#### 2.6.2 类型定义

**任务 6.1: 定义 Ticket 类型**

`frontend/src/types/ticket.ts`:
```typescript
export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';
export type TicketStatus = 'open' | 'completed';

export interface Label {
  id: string;
  name: string;
  color: string;
  description?: string | null;
}

export interface Ticket {
  id: string;
  title: string;
  description?: string | null;
  priority: TicketPriority;
  status: TicketStatus;
  labels: Label[];
  created_at: string;
  updated_at: string;
  completed_at?: string | null;
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

export interface PaginationMeta {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface PaginatedTicketsResponse {
  data: Ticket[];
  pagination: PaginationMeta;
}
```

**任务 6.2: 定义 Label 类型**

`frontend/src/types/label.ts`:
```typescript
export interface Label {
  id: string;
  name: string;
  color: string;
  description?: string | null;
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

export interface LabelsResponse {
  data: Label[];
  total: number;
}
```

#### 2.6.3 API 客户端

**任务 6.3: 实现 Ticket API**

`frontend/src/services/ticketApi.ts`:
```typescript
import api from './api';
import type {
  Ticket,
  CreateTicketInput,
  UpdateTicketInput,
  TicketFilters,
  PaginatedTicketsResponse,
} from '@/types/ticket';

export const ticketApi = {
  // 获取列表
  getList: async (filters: TicketFilters = {}): Promise<PaginatedTicketsResponse> => {
    const params = new URLSearchParams();
    
    if (filters.title) params.append('title', filters.title);
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.label_ids?.length) params.append('label_ids', filters.label_ids.join(','));
    if (filters.no_label) params.append('no_label', 'true');
    if (filters.sort_by) params.append('sort_by', filters.sort_by);
    if (filters.sort_order) params.append('sort_order', filters.sort_order);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.page_size) params.append('page_size', filters.page_size.toString());
    
    return api.get(`/tickets?${params.toString()}`);
  },

  // 获取单个
  getById: async (id: string): Promise<Ticket> => {
    return api.get(`/tickets/${id}`);
  },

  // 创建
  create: async (data: CreateTicketInput): Promise<Ticket> => {
    return api.post('/tickets', data);
  },

  // 更新
  update: async (id: string, data: UpdateTicketInput): Promise<Ticket> => {
    return api.put(`/tickets/${id}`, data);
  },

  // 删除
  delete: async (id: string): Promise<void> => {
    return api.delete(`/tickets/${id}`);
  },

  // 完成
  complete: async (id: string): Promise<Ticket> => {
    return api.patch(`/tickets/${id}/complete`);
  },

  // 重新打开
  reopen: async (id: string): Promise<Ticket> => {
    return api.patch(`/tickets/${id}/reopen`);
  },
};
```

**任务 6.4: 实现 Label API**

`frontend/src/services/labelApi.ts`:
```typescript
import api from './api';
import type {
  Label,
  CreateLabelInput,
  UpdateLabelInput,
  LabelsResponse,
} from '@/types/label';

export const labelApi = {
  // 获取列表
  getList: async (params: { with_count?: boolean; sort_by?: string } = {}): Promise<LabelsResponse> => {
    const searchParams = new URLSearchParams();
    if (params.with_count !== undefined) searchParams.append('with_count', params.with_count.toString());
    if (params.sort_by) searchParams.append('sort_by', params.sort_by);
    
    return api.get(`/labels?${searchParams.toString()}`);
  },

  // 获取单个
  getById: async (id: string): Promise<Label> => {
    return api.get(`/labels/${id}`);
  },

  // 创建
  create: async (data: CreateLabelInput): Promise<Label> => {
    return api.post('/labels', data);
  },

  // 更新
  update: async (id: string, data: UpdateLabelInput): Promise<Label> => {
    return api.put(`/labels/${id}`, data);
  },

  // 删除
  delete: async (id: string): Promise<void> => {
    return api.delete(`/labels/${id}`);
  },
};
```

#### 2.6.4 验收标准
- ✅ 类型定义完整准确
- ✅ API 客户端方法实现完整
- ✅ 类型推断正确

---

### 🔷 Phase 7: 前端 Hooks 与状态管理（Day 4-5）

#### 2.7.1 目标
- 实现 TanStack Query Hooks
- 配置乐观更新

#### 2.7.2 Hooks 实现

**任务 7.1: 配置 React Query Provider**

`frontend/src/main.tsx`:
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './styles/globals.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000, // 30秒
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
```

**任务 7.2: 实现 Ticket Hooks**

`frontend/src/hooks/useTickets.ts`:
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketApi } from '@/services/ticketApi';
import type { TicketFilters, CreateTicketInput, UpdateTicketInput } from '@/types/ticket';
import { toast } from '@/components/ui/use-toast';

// 获取列表
export function useTickets(filters: TicketFilters = {}) {
  return useQuery({
    queryKey: ['tickets', filters],
    queryFn: () => ticketApi.getList(filters),
    staleTime: 30000,
  });
}

// 获取单个
export function useTicket(id: string) {
  return useQuery({
    queryKey: ['tickets', id],
    queryFn: () => ticketApi.getById(id),
    enabled: !!id,
  });
}

// 创建
export function useCreateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ticketApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['labels'] });
      toast({
        title: '创建成功',
        description: 'Ticket 已创建',
      });
    },
    onError: (error: any) => {
      toast({
        title: '创建失败',
        description: error.response?.data?.detail || '发生错误',
        variant: 'destructive',
      });
    },
  });
}

// 更新
export function useUpdateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTicketInput }) =>
      ticketApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['tickets', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['labels'] });
      toast({
        title: '更新成功',
        description: 'Ticket 已更新',
      });
    },
    onError: (error: any) => {
      toast({
        title: '更新失败',
        description: error.response?.data?.detail || '发生错误',
        variant: 'destructive',
      });
    },
  });
}

// 删除
export function useDeleteTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ticketApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['labels'] });
      toast({
        title: '删除成功',
        description: 'Ticket 已删除',
      });
    },
    onError: (error: any) => {
      toast({
        title: '删除失败',
        description: error.response?.data?.detail || '发生错误',
        variant: 'destructive',
      });
    },
  });
}

// 完成（乐观更新）
export function useCompleteTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ticketApi.complete,
    onMutate: async (ticketId) => {
      await queryClient.cancelQueries({ queryKey: ['tickets'] });
      const previousTickets = queryClient.getQueryData(['tickets']);
      
      queryClient.setQueriesData({ queryKey: ['tickets'] }, (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((ticket: any) =>
            ticket.id === ticketId
              ? { ...ticket, status: 'completed', completed_at: new Date().toISOString() }
              : ticket
          ),
        };
      });

      return { previousTickets };
    },
    onError: (err, ticketId, context) => {
      if (context?.previousTickets) {
        queryClient.setQueryData(['tickets'], context.previousTickets);
      }
      toast({
        title: '操作失败',
        description: '无法完成 Ticket',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
}

// 重新打开
export function useReopenTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ticketApi.reopen,
    onMutate: async (ticketId) => {
      await queryClient.cancelQueries({ queryKey: ['tickets'] });
      const previousTickets = queryClient.getQueryData(['tickets']);

      queryClient.setQueriesData({ queryKey: ['tickets'] }, (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((ticket: any) =>
            ticket.id === ticketId
              ? { ...ticket, status: 'open', completed_at: null }
              : ticket
          ),
        };
      });

      return { previousTickets };
    },
    onError: (err, ticketId, context) => {
      if (context?.previousTickets) {
        queryClient.setQueryData(['tickets'], context.previousTickets);
      }
      toast({
        title: '操作失败',
        description: '无法重新打开 Ticket',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
}
```

**任务 7.3: 实现 Label Hooks**

`frontend/src/hooks/useLabels.ts`:
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { labelApi } from '@/services/labelApi';
import type { CreateLabelInput, UpdateLabelInput } from '@/types/label';
import { toast } from '@/components/ui/use-toast';

// 获取列表
export function useLabels() {
  return useQuery({
    queryKey: ['labels'],
    queryFn: () => labelApi.getList({ with_count: true }),
    staleTime: 60000, // 标签变化较少，1分钟
  });
}

// 创建
export function useCreateLabel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: labelApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labels'] });
      toast({
        title: '创建成功',
        description: '标签已创建',
      });
    },
    onError: (error: any) => {
      toast({
        title: '创建失败',
        description: error.response?.data?.detail || '发生错误',
        variant: 'destructive',
      });
    },
  });
}

// 更新
export function useUpdateLabel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLabelInput }) =>
      labelApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labels'] });
      toast({
        title: '更新成功',
        description: '标签已更新',
      });
    },
    onError: (error: any) => {
      toast({
        title: '更新失败',
        description: error.response?.data?.detail || '发生错误',
        variant: 'destructive',
      });
    },
  });
}

// 删除
export function useDeleteLabel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: labelApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labels'] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast({
        title: '删除成功',
        description: '标签已删除',
      });
    },
    onError: (error: any) => {
      toast({
        title: '删除失败',
        description: error.response?.data?.detail || '发生错误',
        variant: 'destructive',
      });
    },
  });
}
```

**任务 7.4: 实现工具 Hooks**

`frontend/src/hooks/useDebounce.ts`:
```typescript
import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

#### 2.7.3 验收标准
- ✅ Hooks 实现完整
- ✅ 乐观更新正常工作
- ✅ 错误处理完善
- ✅ Toast 提示正确显示

---

### 🔷 Phase 8: 前端 UI 组件实现（Day 5-6）

#### 2.8.1 目标
- 实现所有核心 UI 组件
- 完成页面布局

#### 2.8.2 布局组件

**任务 8.1: 安装必要的 Shadcn 组件**
```bash
npx shadcn@latest add button card checkbox dialog dropdown-menu input textarea badge select toast separator
```

**任务 8.2: 实现 Header 组件**

`frontend/src/components/layout/Header.tsx`:
```typescript
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface HeaderProps {
  onCreateTicket: () => void;
}

export function Header({ onCreateTicket }: HeaderProps) {
  return (
    <header className="border-b bg-white">
      <div className="flex h-16 items-center px-6">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎫</span>
          <h1 className="text-xl font-semibold">TicketHub</h1>
        </div>
        
        <div className="ml-auto">
          <Button onClick={onCreateTicket}>
            <Plus className="mr-2 h-4 w-4" />
            新建 Ticket
          </Button>
        </div>
      </div>
    </header>
  );
}
```

**任务 8.3: 实现 Sidebar 组件**

`frontend/src/components/layout/Sidebar.tsx`:
```typescript
import { useLabels } from '@/hooks/useLabels';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  selectedLabelIds: string[];
  onLabelSelect: (labelId: string | null) => void;
  onCreateLabel: () => void;
}

export function Sidebar({
  selectedLabelIds,
  onLabelSelect,
  onCreateLabel,
}: SidebarProps) {
  const { data: labelsData } = useLabels();
  const labels = labelsData?.data || [];

  return (
    <aside className="w-64 border-r bg-gray-50 p-4">
      <div className="space-y-2">
        <button
          className={cn(
            "w-full text-left px-3 py-2 rounded-md hover:bg-gray-200 transition",
            selectedLabelIds.length === 0 && "bg-gray-200"
          )}
          onClick={() => onLabelSelect(null)}
        >
          📋 全部 ({labels.reduce((sum, l) => sum + (l.ticket_count || 0), 0)})
        </button>

        <div className="pt-4">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">标签</h3>
          {labels.map((label) => (
            <button
              key={label.id}
              className={cn(
                "w-full text-left px-3 py-2 rounded-md hover:bg-gray-200 transition flex items-center gap-2",
                selectedLabelIds.includes(label.id) && "bg-gray-200"
              )}
              onClick={() => onLabelSelect(label.id)}
            >
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: label.color }}
              />
              <span className="flex-1">{label.name}</span>
              <span className="text-sm text-gray-500">
                ({label.ticket_count || 0})
              </span>
            </button>
          ))}
        </div>

        <Button
          variant="outline"
          className="w-full mt-4"
          onClick={onCreateLabel}
        >
          <Plus className="mr-2 h-4 w-4" />
          新建标签
        </Button>
      </div>
    </aside>
  );
}
```

**任务 8.4: 实现 MainLayout 组件**

`frontend/src/components/layout/MainLayout.tsx`:
```typescript
import { ReactNode } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface MainLayoutProps {
  children: ReactNode;
  selectedLabelIds: string[];
  onLabelSelect: (labelId: string | null) => void;
  onCreateTicket: () => void;
  onCreateLabel: () => void;
}

export function MainLayout({
  children,
  selectedLabelIds,
  onLabelSelect,
  onCreateTicket,
  onCreateLabel,
}: MainLayoutProps) {
  return (
    <div className="flex flex-col h-screen">
      <Header onCreateTicket={onCreateTicket} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          selectedLabelIds={selectedLabelIds}
          onLabelSelect={onLabelSelect}
          onCreateLabel={onCreateLabel}
        />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
```

#### 2.8.3 Ticket 组件

**任务 8.5: 实现 TicketCard 组件**

`frontend/src/components/tickets/TicketCard.tsx`:
```typescript
import { Ticket } from '@/types/ticket';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface TicketCardProps {
  ticket: Ticket;
  onComplete: (id: string) => void;
  onReopen: (id: string) => void;
  onEdit: (ticket: Ticket) => void;
  onDelete: (ticket: Ticket) => void;
}

const priorityConfig = {
  critical: { label: 'Critical', color: 'text-red-600 bg-red-100', icon: '🔥' },
  high: { label: 'High', color: 'text-orange-600 bg-orange-100', icon: '↑' },
  medium: { label: 'Medium', color: 'text-yellow-600 bg-yellow-100', icon: '—' },
  low: { label: 'Low', color: 'text-green-600 bg-green-100', icon: '↓' },
};

export function TicketCard({
  ticket,
  onComplete,
  onReopen,
  onEdit,
  onDelete,
}: TicketCardProps) {
  const isCompleted = ticket.status === 'completed';
  const priority = priorityConfig[ticket.priority];

  return (
    <Card
      className={cn(
        "p-4 hover:shadow-md transition-shadow",
        isCompleted && "bg-gray-50"
      )}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={isCompleted}
          onCheckedChange={() => isCompleted ? onReopen(ticket.id) : onComplete(ticket.id)}
          className="mt-1"
        />

        <div className="flex-1 min-w-0">
          <h3
            className={cn(
              "font-medium text-lg mb-2",
              isCompleted && "line-through text-gray-500"
            )}
          >
            {ticket.title}
          </h3>

          {ticket.description && (
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
              {ticket.description}
            </p>
          )}

          <div className="flex flex-wrap gap-1 mt-2">
            {ticket.labels.map((label) => (
              <Badge
                key={label.id}
                style={{ backgroundColor: label.color, color: 'white' }}
                className="text-xs"
              >
                {label.name}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge className={priority.color}>
            {priority.icon} {priority.label}
          </Badge>

          <span className="text-sm text-gray-500">
            {formatDistanceToNow(new Date(ticket.created_at), {
              addSuffix: true,
              locale: zhCN,
            })}
          </span>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onEdit(ticket)}>
                <Pencil className="mr-2 h-4 w-4" />
                编辑
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(ticket)}>
                <Trash2 className="mr-2 h-4 w-4" />
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

**任务 8.6: 实现 TicketForm 组件**

`frontend/src/components/tickets/TicketForm.tsx`:
```typescript
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreateTicketInput, UpdateTicketInput, Ticket } from '@/types/ticket';
import { useLabels } from '@/hooks/useLabels';
import { Checkbox } from '@/components/ui/checkbox';

interface TicketFormProps {
  ticket?: Ticket;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTicketInput | UpdateTicketInput) => void;
}

export function TicketForm({ ticket, open, onClose, onSubmit }: TicketFormProps) {
  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: ticket
      ? {
          title: ticket.title,
          description: ticket.description || '',
          priority: ticket.priority,
          label_ids: ticket.labels.map(l => l.id),
        }
      : {
          title: '',
          description: '',
          priority: 'medium',
          label_ids: [],
        },
  });

  const { data: labelsData } = useLabels();
  const labels = labelsData?.data || [];
  const selectedLabelIds = watch('label_ids') || [];

  const onFormSubmit = (data: any) => {
    onSubmit(data);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{ticket ? '编辑 Ticket' : '新建 Ticket'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">标题 *</label>
            <Input {...register('title', { required: true })} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">描述</label>
            <Textarea {...register('description')} rows={4} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">优先级</label>
            <Select
              defaultValue={watch('priority')}
              onValueChange={(value) => setValue('priority', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">标签</label>
            <div className="space-y-2">
              {labels.map((label) => (
                <div key={label.id} className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedLabelIds.includes(label.id)}
                    onCheckedChange={(checked) => {
                      const newIds = checked
                        ? [...selectedLabelIds, label.id]
                        : selectedLabelIds.filter(id => id !== label.id);
                      setValue('label_ids', newIds);
                    }}
                  />
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: label.color }}
                  />
                  <span>{label.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button type="submit">
              {ticket ? '保存' : '创建'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

**任务 8.7: 实现 TicketSearch 组件**

`frontend/src/components/tickets/TicketSearch.tsx`:
```typescript
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface TicketSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function TicketSearch({ value, onChange }: TicketSearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        type="text"
        placeholder="搜索 Ticket 标题..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10"
      />
    </div>
  );
}
```

#### 2.8.4 验收标准
- ✅ 所有组件正确渲染
- ✅ 样式符合设计规范
- ✅ 交互流畅

---

### 🔷 Phase 9: 前端页面整合与功能联调（Day 6-7）

#### 2.9.1 目标
- 整合所有组件
- 实现完整的用户流程

#### 2.9.2 主页面实现

**任务 9.1: 实现 HomePage**

`frontend/src/pages/HomePage.tsx`:
```typescript
import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { TicketCard } from '@/components/tickets/TicketCard';
import { TicketForm } from '@/components/tickets/TicketForm';
import { TicketSearch } from '@/components/tickets/TicketSearch';
import { useTickets, useCreateTicket, useUpdateTicket, useDeleteTicket, useCompleteTicket, useReopenTicket } from '@/hooks/useTickets';
import { useDebounce } from '@/hooks/useDebounce';
import { Ticket } from '@/types/ticket';

export function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([]);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 300);

  const { data: ticketsData, isLoading } = useTickets({
    title: debouncedSearch,
    label_ids: selectedLabelIds,
  });

  const createMutation = useCreateTicket();
  const updateMutation = useUpdateTicket();
  const deleteMutation = useDeleteTicket();
  const completeMutation = useCompleteTicket();
  const reopenMutation = useReopenTicket();

  const handleLabelSelect = (labelId: string | null) => {
    if (labelId === null) {
      setSelectedLabelIds([]);
    } else {
      setSelectedLabelIds([labelId]);
    }
  };

  const handleCreateTicket = (data: any) => {
    createMutation.mutate(data);
  };

  const handleUpdateTicket = (data: any) => {
    if (editingTicket) {
      updateMutation.mutate({ id: editingTicket.id, data });
    }
  };

  const handleDeleteTicket = (ticket: Ticket) => {
    if (confirm(`确定要删除 "${ticket.title}" 吗？此操作不可撤销。`)) {
      deleteMutation.mutate(ticket.id);
    }
  };

  return (
    <MainLayout
      selectedLabelIds={selectedLabelIds}
      onLabelSelect={handleLabelSelect}
      onCreateTicket={() => setIsCreateFormOpen(true)}
      onCreateLabel={() => {}}
    >
      <div className="space-y-4">
        <TicketSearch value={searchQuery} onChange={setSearchQuery} />

        {isLoading ? (
          <div>加载中...</div>
        ) : (
          <div className="space-y-3">
            {ticketsData?.data.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onComplete={completeMutation.mutate}
                onReopen={reopenMutation.mutate}
                onEdit={setEditingTicket}
                onDelete={handleDeleteTicket}
              />
            ))}
          </div>
        )}
      </div>

      <TicketForm
        open={isCreateFormOpen}
        onClose={() => setIsCreateFormOpen(false)}
        onSubmit={handleCreateTicket}
      />

      <TicketForm
        ticket={editingTicket || undefined}
        open={!!editingTicket}
        onClose={() => setEditingTicket(null)}
        onSubmit={handleUpdateTicket}
      />
    </MainLayout>
  );
}
```

**任务 9.2: 配置 App 路由**

`frontend/src/App.tsx`:
```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { Toaster } from './components/ui/toaster';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
```

#### 2.9.3 功能测试

**任务 9.3: 端到端功能测试**
- ✅ 创建 Ticket
- ✅ 编辑 Ticket
- ✅ 删除 Ticket
- ✅ 完成/取消完成 Ticket
- ✅ 搜索 Ticket
- ✅ 按标签筛选
- ✅ 查看 Ticket 列表
- ✅ 标签管理

#### 2.9.4 验收标准
- ✅ 所有功能正常工作
- ✅ 用户体验流畅
- ✅ 无明显 Bug

---

### 🔷 Phase 10: UI 优化与响应式（Day 7）

#### 2.10.1 目标
- 优化 UI 细节
- 实现响应式布局
- 添加加载状态和空状态

#### 2.10.2 优化任务

**任务 10.1: 添加骨架屏加载状态**
**任务 10.2: 添加空状态提示**
**任务 10.3: 优化移动端布局**
**任务 10.4: 添加动画和过渡效果**

#### 2.10.3 验收标准
- ✅ 响应式布局在各设备正常显示
- ✅ 加载状态友好
- ✅ 空状态提示清晰
- ✅ 动画流畅自然

---

### 🔷 Phase 11: 测试与 Bug 修复（Day 8）

#### 2.11.1 目标
- 全面测试所有功能
- 修复发现的 Bug

#### 2.11.2 测试清单

**功能测试**:
- [ ] Ticket CRUD 完整流程
- [ ] Label CRUD 完整流程
- [ ] 搜索功能准确性
- [ ] 筛选功能准确性
- [ ] 分页功能正常
- [ ] 状态切换正常
- [ ] 标签关联正常

**边界测试**:
- [ ] 长标题处理
- [ ] 空数据处理
- [ ] 网络错误处理
- [ ] 并发操作处理

**性能测试**:
- [ ] 大量数据渲染性能
- [ ] 搜索防抖效果
- [ ] 乐观更新响应速度

#### 2.11.3 验收标准
- ✅ 所有功能测试通过
- ✅ 边界情况处理正确
- ✅ 性能满足要求
- ✅ 无严重 Bug

---

## 3. 技术要点与最佳实践

### 3.1 后端最佳实践

#### 数据库
- ✅ 使用 UUID 作为主键
- ✅ 合理使用索引优化查询
- ✅ 使用触发器自动管理时间戳
- ✅ 级联删除保持数据一致性

#### API 设计
- ✅ RESTful 风格统一
- ✅ 分页参数标准化
- ✅ 错误响应格式统一
- ✅ 使用 Pydantic 验证输入

#### 代码组织
- ✅ 分层架构：Router → Service → Model
- ✅ 依赖注入管理数据库会话
- ✅ 异常统一处理

### 3.2 前端最佳实践

#### 状态管理
- ✅ 使用 TanStack Query 管理服务器状态
- ✅ 乐观更新提升用户体验
- ✅ 自动缓存和失效策略

#### 组件设计
- ✅ 组件职责单一
- ✅ Props 类型定义完整
- ✅ 可复用性高

#### 用户体验
- ✅ 防抖优化搜索
- ✅ 加载状态提示
- ✅ 错误友好提示
- ✅ 操作二次确认

---

## 4. 风险与应对

### 4.1 技术风险

| 风险 | 影响 | 应对措施 |
|------|------|---------|
| PostgreSQL 18.x 兼容性 | 中 | 使用稳定版本驱动，充分测试 |
| React 19 新特性不稳定 | 低 | 避免使用实验性功能 |
| Tailwind 4 配置问题 | 低 | 参考官方文档，使用默认配置 |

### 4.2 进度风险

| 风险 | 应对措施 |
|------|---------|
| 某阶段超时 | 优先保证核心功能，次要功能可延后 |
| Bug 修复耗时 | 预留 1 天 Buffer 时间 |
| 需求理解偏差 | 及时沟通确认 |

---

## 5. 验收标准总结

### 5.1 功能完整性
- ✅ 所有需求文档中的功能已实现
- ✅ API 端点完整且正常工作
- ✅ 前端页面完整且交互流畅

### 5.2 代码质量
- ✅ 代码结构清晰，职责分明
- ✅ 类型定义完整
- ✅ 错误处理完善
- ✅ 注释适当

### 5.3 用户体验
- ✅ 界面美观，符合设计规范
- ✅ 响应速度快，无明显卡顿
- ✅ 提示信息友好
- ✅ 响应式布局正常

### 5.4 稳定性
- ✅ 无严重 Bug
- ✅ 边界情况处理正确
- ✅ 错误恢复机制完善

---

## 6. 后续优化方向

### 6.1 功能增强
- [ ] 添加 Ticket 优先级排序
- [ ] 支持 Markdown 描述渲染
- [ ] 添加 Ticket 归档功能
- [ ] 支持批量操作

### 6.2 性能优化
- [ ] 虚拟滚动优化大列表渲染
- [ ] Service Worker 离线缓存
- [ ] 图片懒加载
- [ ] 代码分割

### 6.3 开发体验
- [ ] 添加单元测试
- [ ] 添加 E2E 测试
- [ ] CI/CD 自动化
- [ ] Docker 容器化

---

**计划结束**

本实现计划基于 `v1-spec-sonnet.md` 需求和设计文档，详细规划了从项目初始化到功能完成的全部开发过程。按照此计划执行，预计 8 个工作日可完成项目核心功能的开发和测试。

