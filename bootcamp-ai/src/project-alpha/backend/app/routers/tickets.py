from fastapi import APIRouter, Depends, Query, HTTPException, status
from typing import List, Optional
from uuid import UUID

from app.schemas.ticket import TicketCreate, TicketUpdate, TicketResponse, TicketStatusResponse
from app.schemas.common import PaginatedResponse, PaginationMeta
from app.services.ticket_service import TicketService
from app.utils.dependencies import get_ticket_service

router = APIRouter(prefix="/tickets", tags=["Tickets"])


@router.get("/", response_model=PaginatedResponse[TicketResponse])
async def get_tickets(
    title: Optional[str] = Query(None, description="标题搜索关键词"),
    status: Optional[str] = Query("all", description="状态筛选: all, open, completed"),
    priority: Optional[str] = Query(None, description="优先级筛选: low, medium, high, critical"),
    label_ids: Optional[str] = Query(None, description="标签 ID 列表，逗号分隔"),
    no_label: bool = Query(False, description="是否只显示无标签的 Ticket"),
    sort_by: str = Query("created_at", description="排序字段: created_at, updated_at, priority"),
    sort_order: str = Query("desc", description="排序方向: asc, desc"),
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(20, ge=1, le=100, description="每页数量"),
    service: TicketService = Depends(get_ticket_service)
):
    """获取 Ticket 列表（支持搜索、筛选、排序、分页）
    
    Args:
        title: 标题搜索关键词（模糊匹配）
        status: 状态筛选
        priority: 优先级筛选
        label_ids: 标签 ID 列表（逗号分隔）
        no_label: 是否只显示无标签的 Ticket
        sort_by: 排序字段
        sort_order: 排序方向
        page: 页码（从 1 开始）
        page_size: 每页数量（1-100）
        service: TicketService 实例
    
    Returns:
        分页的 Ticket 列表
    """
    # 解析 label_ids
    label_id_list = []
    if label_ids:
        try:
            label_id_list = [UUID(id.strip()) for id in label_ids.split(",")]
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid label_ids format. Expected comma-separated UUIDs."
            )
    
    tickets, pagination = service.get_list(
        title=title,
        status_filter=status,
        priority=priority,
        label_ids=label_id_list if label_id_list else None,
        no_label=no_label,
        sort_by=sort_by,
        sort_order=sort_order,
        page=page,
        page_size=page_size
    )
    
    return {
        "data": [TicketResponse.model_validate(ticket).model_dump() for ticket in tickets],
        "pagination": PaginationMeta(**pagination)
    }


@router.get("/{ticket_id}", response_model=TicketResponse)
async def get_ticket(
    ticket_id: UUID,
    service: TicketService = Depends(get_ticket_service)
):
    """根据 ID 获取单个 Ticket
    
    Args:
        ticket_id: Ticket ID
        service: TicketService 实例
    
    Returns:
        Ticket 详情
    
    Raises:
        HTTPException: 如果 Ticket 不存在
    """
    ticket = service.get_by_id(ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return TicketResponse.model_validate(ticket).model_dump()


@router.post("/", response_model=TicketResponse, status_code=status.HTTP_201_CREATED)
async def create_ticket(
    ticket_data: TicketCreate,
    service: TicketService = Depends(get_ticket_service)
):
    """创建新 Ticket
    
    Args:
        ticket_data: Ticket 创建数据
        service: TicketService 实例
    
    Returns:
        创建的 Ticket
    """
    ticket = service.create(ticket_data)
    return TicketResponse.model_validate(ticket).model_dump()


@router.put("/{ticket_id}", response_model=TicketResponse)
async def update_ticket(
    ticket_id: UUID,
    ticket_data: TicketUpdate,
    service: TicketService = Depends(get_ticket_service)
):
    """更新 Ticket
    
    Args:
        ticket_id: Ticket ID
        ticket_data: Ticket 更新数据
        service: TicketService 实例
    
    Returns:
        更新后的 Ticket
    """
    ticket = service.update(ticket_id, ticket_data)
    return TicketResponse.model_validate(ticket).model_dump()


@router.delete("/{ticket_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_ticket(
    ticket_id: UUID,
    service: TicketService = Depends(get_ticket_service)
):
    """删除 Ticket
    
    Args:
        ticket_id: Ticket ID
        service: TicketService 实例
    
    Returns:
        None (204 No Content)
    """
    service.delete(ticket_id)
    return None


@router.patch("/{ticket_id}/complete", response_model=TicketStatusResponse)
async def complete_ticket(
    ticket_id: UUID,
    service: TicketService = Depends(get_ticket_service)
):
    """完成 Ticket
    
    Args:
        ticket_id: Ticket ID
        service: TicketService 实例
    
    Returns:
        Ticket 状态信息
    """
    ticket = service.complete(ticket_id)
    return TicketStatusResponse(
        id=ticket.id,
        status=ticket.status,
        completed_at=ticket.completed_at
    )


@router.patch("/{ticket_id}/reopen", response_model=TicketStatusResponse)
async def reopen_ticket(
    ticket_id: UUID,
    service: TicketService = Depends(get_ticket_service)
):
    """重新打开 Ticket
    
    Args:
        ticket_id: Ticket ID
        service: TicketService 实例
    
    Returns:
        Ticket 状态信息
    """
    ticket = service.reopen(ticket_id)
    return TicketStatusResponse(
        id=ticket.id,
        status=ticket.status,
        completed_at=ticket.completed_at
    )

