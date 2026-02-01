from sqlalchemy import Column, ForeignKey, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base


class TicketLabel(Base):
    """Ticket 和 Label 的关联表"""
    __tablename__ = "ticket_labels"
    
    ticket_id = Column(UUID(as_uuid=True), ForeignKey("tickets.id", ondelete="CASCADE"), primary_key=True)
    label_id = Column(UUID(as_uuid=True), ForeignKey("labels.id", ondelete="CASCADE"), primary_key=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

