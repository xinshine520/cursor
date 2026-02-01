from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID
from typing import Optional, List
from app.models.ticket import TicketPriority, TicketStatus
from app.schemas.label import LabelBase


class TicketCreate(BaseModel):
    """创建 Ticket 请求模型"""
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=10000)
    priority: TicketPriority = TicketPriority.MEDIUM
    label_ids: List[UUID] = Field(default_factory=list)


class TicketUpdate(BaseModel):
    """更新 Ticket 请求模型"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=10000)
    priority: Optional[TicketPriority] = None
    label_ids: Optional[List[UUID]] = None


class TicketResponse(BaseModel):
    """Ticket 响应模型"""
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


class TicketStatusResponse(BaseModel):
    """Ticket 状态更新响应模型"""
    id: UUID
    status: TicketStatus
    completed_at: Optional[datetime] = None

