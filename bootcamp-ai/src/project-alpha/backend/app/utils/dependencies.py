from fastapi import Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.ticket_service import TicketService
from app.services.label_service import LabelService


def get_ticket_service(db: Session = Depends(get_db)) -> TicketService:
    """获取 TicketService 实例的依赖注入函数"""
    return TicketService(db)


def get_label_service(db: Session = Depends(get_db)) -> LabelService:
    """获取 LabelService 实例的依赖注入函数"""
    return LabelService(db)

