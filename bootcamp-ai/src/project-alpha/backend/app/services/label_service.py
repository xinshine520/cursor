from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from uuid import UUID

from app.models.label import Label
from app.models.ticket_label import TicketLabel
from app.schemas.label import LabelCreate, LabelUpdate
from fastapi import HTTPException, status


class LabelService:
    """Label 业务逻辑服务类"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_all(self, with_count: bool = True, sort_by: str = "created_at") -> List[Label]:
        """获取所有标签
        
        Args:
            with_count: 是否包含 Ticket 数量统计
            sort_by: 排序方式 ("name" 或 "created_at")
        
        Returns:
            标签列表
        """
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
        """根据 ID 获取标签
        
        Args:
            label_id: 标签 ID
        
        Returns:
            标签对象，如果不存在返回 None
        """
        return self.db.query(Label).filter(Label.id == label_id).first()
    
    def create(self, label_data: LabelCreate) -> Label:
        """创建新标签
        
        Args:
            label_data: 标签创建数据
        
        Returns:
            创建的标签对象
        
        Raises:
            HTTPException: 如果标签名称已存在
        """
        # 检查名称唯一性（不区分大小写）
        existing = self.db.query(Label).filter(
            func.lower(Label.name) == label_data.name.lower()
        ).first()
        
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Label with this name already exists"
            )
        
        label = Label(**label_data.model_dump())
        self.db.add(label)
        self.db.commit()
        self.db.refresh(label)
        return label
    
    def update(self, label_id: UUID, label_data: LabelUpdate) -> Label:
        """更新标签
        
        Args:
            label_id: 标签 ID
            label_data: 标签更新数据
        
        Returns:
            更新后的标签对象
        
        Raises:
            HTTPException: 如果标签不存在或名称已存在
        """
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
        
        # 更新字段（只更新提供的字段）
        for field, value in label_data.model_dump(exclude_unset=True).items():
            setattr(label, field, value)
        
        self.db.commit()
        self.db.refresh(label)
        return label
    
    def delete(self, label_id: UUID) -> None:
        """删除标签
        
        Args:
            label_id: 标签 ID
        
        Raises:
            HTTPException: 如果标签不存在
        """
        label = self.get_by_id(label_id)
        if not label:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Label not found"
            )
        
        self.db.delete(label)
        self.db.commit()
    
    def get_ticket_count(self, label_id: UUID) -> int:
        """获取标签关联的 Ticket 数量
        
        Args:
            label_id: 标签 ID
        
        Returns:
            Ticket 数量
        """
        return self.db.query(TicketLabel).filter(
            TicketLabel.label_id == label_id
        ).count()

