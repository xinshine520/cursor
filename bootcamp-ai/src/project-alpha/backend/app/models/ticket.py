from sqlalchemy import Column, String, Text, Enum, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
import enum

from app.models.base import TimestampMixin
from app.database import Base


class TicketPriority(str, enum.Enum):
    """Ticket 优先级枚举"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class TicketStatus(str, enum.Enum):
    """Ticket 状态枚举"""
    OPEN = "open"
    COMPLETED = "completed"


class Ticket(Base, TimestampMixin):
    """Ticket 模型"""
    __tablename__ = "tickets"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(200), nullable=False, index=True)
    description = Column(Text, nullable=True)
    priority = Column(Enum(TicketPriority, values_callable=lambda x: [e.value for e in x]), nullable=False, default=TicketPriority.MEDIUM, index=True)
    status = Column(Enum(TicketStatus, values_callable=lambda x: [e.value for e in x]), nullable=False, default=TicketStatus.OPEN, index=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    # 关系
    labels = relationship("Label", secondary="ticket_labels", back_populates="tickets")

