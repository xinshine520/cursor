from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID
from typing import Optional


class LabelCreate(BaseModel):
    """创建标签请求模型"""
    name: str = Field(..., min_length=1, max_length=50)
    color: str = Field(default="#6366f1", pattern=r"^#[0-9A-Fa-f]{6}$")
    description: Optional[str] = Field(None, max_length=200)


class LabelUpdate(BaseModel):
    """更新标签请求模型"""
    name: Optional[str] = Field(None, min_length=1, max_length=50)
    color: Optional[str] = Field(None, pattern=r"^#[0-9A-Fa-f]{6}$")
    description: Optional[str] = Field(None, max_length=200)


class LabelBase(BaseModel):
    """标签响应模型（基础）"""
    id: UUID
    name: str
    color: str
    description: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class LabelWithCount(LabelBase):
    """标签响应模型（带 Ticket 数量）"""
    ticket_count: int = 0

