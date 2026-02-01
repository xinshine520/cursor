from sqlalchemy import Column, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from app.models.base import TimestampMixin
from app.database import Base


class Label(Base, TimestampMixin):
    """Label 模型"""
    __tablename__ = "labels"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(50), nullable=False, unique=True, index=True)
    color = Column(String(7), nullable=False, default="#6366f1")
    description = Column(String(200), nullable=True)
    
    # 关系
    tickets = relationship("Ticket", secondary="ticket_labels", back_populates="labels")

