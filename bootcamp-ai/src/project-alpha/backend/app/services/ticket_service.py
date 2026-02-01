from sqlalchemy.orm import Session, joinedload
from typing import List, Optional, Tuple, Dict, Any
from uuid import UUID

from app.models.ticket import Ticket, TicketStatus
from app.models.label import Label
from app.models.ticket_label import TicketLabel
from app.schemas.ticket import TicketCreate, TicketUpdate
from fastapi import HTTPException, status


class TicketService:
    """Ticket 业务逻辑服务类"""
    
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
    ) -> Tuple[List[Ticket], Dict[str, Any]]:
        """获取 Ticket 列表（支持搜索、筛选、排序、分页）
        
        Args:
            title: 标题搜索关键词（模糊匹配）
            status_filter: 状态筛选 ("all", "open", "completed")
            priority: 优先级筛选
            label_ids: 标签 ID 列表筛选
            no_label: 是否只显示无标签的 Ticket
            sort_by: 排序字段 ("created_at", "updated_at", "priority")
            sort_order: 排序方向 ("asc", "desc")
            page: 页码（从 1 开始）
            page_size: 每页数量
        
        Returns:
            (Ticket 列表, 分页信息字典)
        """
        query = self.db.query(Ticket).options(joinedload(Ticket.labels))
        
        # 标题搜索（不区分大小写）
        if title:
            query = query.filter(Ticket.title.ilike(f"%{title}%"))
        
        # 状态筛选
        if status_filter and status_filter != "all":
            query = query.filter(Ticket.status == status_filter)
        
        # 优先级筛选
        if priority:
            query = query.filter(Ticket.priority == priority)
        
        # 标签筛选（支持多个标签，使用 AND 逻辑）
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
        total_pages = (total + page_size - 1) // page_size if total > 0 else 0
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
        """根据 ID 获取 Ticket
        
        Args:
            ticket_id: Ticket ID
        
        Returns:
            Ticket 对象，如果不存在返回 None
        """
        return self.db.query(Ticket).options(
            joinedload(Ticket.labels)
        ).filter(Ticket.id == ticket_id).first()
    
    def create(self, ticket_data: TicketCreate) -> Ticket:
        """创建新 Ticket
        
        Args:
            ticket_data: Ticket 创建数据
        
        Returns:
            创建的 Ticket 对象
        
        Raises:
            HTTPException: 如果关联的标签不存在
        """
        # 提取 label_ids
        label_ids = ticket_data.label_ids
        ticket_dict = ticket_data.model_dump(exclude={"label_ids"})
        
        # 创建 Ticket
        ticket = Ticket(**ticket_dict)
        self.db.add(ticket)
        self.db.flush()
        
        # 关联标签
        if label_ids:
            labels = self.db.query(Label).filter(Label.id.in_(label_ids)).all()
            # 验证所有标签是否存在
            found_label_ids = {label.id for label in labels}
            missing_label_ids = set(label_ids) - found_label_ids
            if missing_label_ids:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Labels not found: {list(missing_label_ids)}"
                )
            ticket.labels = labels
        
        self.db.commit()
        self.db.refresh(ticket)
        return ticket
    
    def update(self, ticket_id: UUID, ticket_data: TicketUpdate) -> Ticket:
        """更新 Ticket
        
        Args:
            ticket_id: Ticket ID
            ticket_data: Ticket 更新数据
        
        Returns:
            更新后的 Ticket 对象
        
        Raises:
            HTTPException: 如果 Ticket 不存在或关联的标签不存在
        """
        ticket = self.get_by_id(ticket_id)
        if not ticket:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Ticket not found"
            )
        
        # 提取 label_ids
        label_ids = ticket_data.label_ids
        update_dict = ticket_data.model_dump(exclude={"label_ids"}, exclude_unset=True)
        
        # 更新字段
        for field, value in update_dict.items():
            setattr(ticket, field, value)
        
        # 更新标签关联（如果提供了 label_ids）
        if label_ids is not None:
            labels = self.db.query(Label).filter(Label.id.in_(label_ids)).all()
            # 验证所有标签是否存在
            found_label_ids = {label.id for label in labels}
            missing_label_ids = set(label_ids) - found_label_ids
            if missing_label_ids:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Labels not found: {list(missing_label_ids)}"
                )
            ticket.labels = labels
        
        self.db.commit()
        self.db.refresh(ticket)
        return ticket
    
    def delete(self, ticket_id: UUID) -> None:
        """删除 Ticket
        
        Args:
            ticket_id: Ticket ID
        
        Raises:
            HTTPException: 如果 Ticket 不存在
        """
        ticket = self.get_by_id(ticket_id)
        if not ticket:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Ticket not found"
            )
        
        self.db.delete(ticket)
        self.db.commit()
    
    def complete(self, ticket_id: UUID) -> Ticket:
        """完成 Ticket
        
        Args:
            ticket_id: Ticket ID
        
        Returns:
            更新后的 Ticket 对象
        
        Raises:
            HTTPException: 如果 Ticket 不存在或已经完成
        """
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
        # completed_at 由数据库触发器自动设置
        
        self.db.commit()
        self.db.refresh(ticket)
        return ticket
    
    def reopen(self, ticket_id: UUID) -> Ticket:
        """重新打开 Ticket
        
        Args:
            ticket_id: Ticket ID
        
        Returns:
            更新后的 Ticket 对象
        
        Raises:
            HTTPException: 如果 Ticket 不存在或未完成
        """
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
        # completed_at 由数据库触发器自动清除
        
        self.db.commit()
        self.db.refresh(ticket)
        return ticket

