from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from uuid import UUID

from app.schemas.label import LabelCreate, LabelUpdate, LabelBase, LabelWithCount
from app.services.label_service import LabelService
from app.utils.dependencies import get_label_service

router = APIRouter(prefix="/labels", tags=["Labels"])


@router.get("/", response_model=dict)
async def get_labels(
    with_count: bool = True,
    sort_by: str = "created_at",
    service: LabelService = Depends(get_label_service)
):
    """获取所有标签列表
    
    Args:
        with_count: 是否包含 Ticket 数量统计
        sort_by: 排序方式 ("name" 或 "created_at")
        service: LabelService 实例
    
    Returns:
        包含标签列表和总数的字典
    """
    labels = service.get_all(with_count=with_count, sort_by=sort_by)
    
    if with_count:
        # 处理带统计的查询结果（SQLAlchemy 返回 Row 对象）
        data = []
        for item in labels:
            # 当使用 add_columns 时，SQLAlchemy 返回 Row 对象
            # Row 对象可以通过索引访问：item[0] 是 Label，item[1] 是 count
            if hasattr(item, '__getitem__') and len(item) == 2:
                label = item[0]
                ticket_count = item[1] if item[1] is not None else 0
                label_dict = LabelBase.model_validate(label).model_dump()
                label_dict["ticket_count"] = ticket_count
                data.append(label_dict)
            else:
                # 单个 label 对象（不应该发生，但作为后备）
                label_dict = LabelBase.model_validate(item).model_dump()
                label_dict["ticket_count"] = service.get_ticket_count(item.id)
                data.append(label_dict)
    else:
        data = [LabelBase.model_validate(label).model_dump() for label in labels]
    
    return {"data": data, "total": len(data)}


@router.get("/{label_id}", response_model=LabelWithCount)
async def get_label(
    label_id: UUID,
    service: LabelService = Depends(get_label_service)
):
    """根据 ID 获取单个标签
    
    Args:
        label_id: 标签 ID
        service: LabelService 实例
    
    Returns:
        标签详情（包含 Ticket 数量）
    
    Raises:
        HTTPException: 如果标签不存在
    """
    label = service.get_by_id(label_id)
    if not label:
        raise HTTPException(status_code=404, detail="Label not found")
    
    ticket_count = service.get_ticket_count(label_id)
    label_dict = LabelBase.model_validate(label).model_dump()
    label_dict["ticket_count"] = ticket_count
    return label_dict


@router.post("/", response_model=LabelWithCount, status_code=status.HTTP_201_CREATED)
async def create_label(
    label_data: LabelCreate,
    service: LabelService = Depends(get_label_service)
):
    """创建新标签
    
    Args:
        label_data: 标签创建数据
        service: LabelService 实例
    
    Returns:
        创建的标签（包含 Ticket 数量，初始为 0）
    """
    label = service.create(label_data)
    label_dict = LabelBase.model_validate(label).model_dump()
    label_dict["ticket_count"] = 0
    return label_dict


@router.put("/{label_id}", response_model=LabelWithCount)
async def update_label(
    label_id: UUID,
    label_data: LabelUpdate,
    service: LabelService = Depends(get_label_service)
):
    """更新标签
    
    Args:
        label_id: 标签 ID
        label_data: 标签更新数据
        service: LabelService 实例
    
    Returns:
        更新后的标签（包含 Ticket 数量）
    """
    label = service.update(label_id, label_data)
    ticket_count = service.get_ticket_count(label_id)
    label_dict = LabelBase.model_validate(label).model_dump()
    label_dict["ticket_count"] = ticket_count
    return label_dict


@router.delete("/{label_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_label(
    label_id: UUID,
    service: LabelService = Depends(get_label_service)
):
    """删除标签
    
    Args:
        label_id: 标签 ID
        service: LabelService 实例
    
    Returns:
        None (204 No Content)
    """
    service.delete(label_id)
    return None

