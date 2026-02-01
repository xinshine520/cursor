from sqlalchemy import Column, DateTime, func
from app.database import Base


class TimestampMixin:
    """时间戳混入类，提供 created_at 和 updated_at 字段"""
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

