from pydantic import BaseModel
from typing import Generic, TypeVar, List

DataT = TypeVar("DataT")


class PaginationParams(BaseModel):
    """分页参数"""
    page: int = 1
    page_size: int = 20


class PaginationMeta(BaseModel):
    """分页元信息"""
    page: int
    page_size: int
    total: int
    total_pages: int
    has_next: bool
    has_prev: bool


class PaginatedResponse(BaseModel, Generic[DataT]):
    """分页响应"""
    data: List[DataT]
    pagination: PaginationMeta

