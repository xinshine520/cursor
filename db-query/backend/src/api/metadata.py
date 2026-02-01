"""Metadata API endpoints."""

from uuid import UUID

from fastapi import APIRouter, HTTPException, status

from ..models.metadata import DatabaseMetadata
from ..models.errors import ErrorDetail, ErrorResponse
from ..services.metadata_service import MetadataService
from ..services.connection_service import ConnectionService

router = APIRouter(prefix="/connections/{connection_id}/metadata", tags=["Metadata"])


@router.get("", response_model=DatabaseMetadata)
async def get_metadata(connection_id: UUID) -> DatabaseMetadata:
    """Get cached metadata for a connection. If not cached, attempt to extract it."""
    # Verify connection exists
    connection = await ConnectionService.get_by_id(connection_id)
    if not connection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=ErrorResponse(
                error=ErrorDetail(code="NOT_FOUND", message=f"Connection {connection_id} not found")
            ).model_dump(by_alias=True),
        )

    # Get cached metadata
    metadata = await MetadataService.get_cached_metadata(connection_id)
    if not metadata:
        # If metadata not cached, try to extract it automatically
        try:
            metadata = await MetadataService.extract_metadata(connection_id)
            await ConnectionService.update_last_accessed(connection_id)
            return metadata
        except Exception as e:
            # If extraction fails, return 404 with helpful message
            error_msg = str(e)
            # Provide more user-friendly error messages
            if "Can't connect to MySQL server" in error_msg or "2003" in error_msg:
                user_message = "无法连接到 MySQL 服务器。请检查：1) MySQL 服务是否运行 2) 连接 URL 是否正确 3) 网络连接是否正常"
            elif "authentication failed" in error_msg.lower() or "access denied" in error_msg.lower():
                user_message = "数据库认证失败。请检查用户名和密码是否正确"
            elif "Unknown database" in error_msg or "database" in error_msg.lower():
                user_message = "数据库不存在或无法访问。请检查数据库名称是否正确"
            else:
                user_message = f"无法提取元数据: {error_msg}"
            
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=ErrorResponse(
                    error=ErrorDetail(
                        code="METADATA_EXTRACTION_FAILED",
                        message=user_message,
                        details={"original_error": error_msg}
                    )
                ).model_dump(by_alias=True),
            )

    return metadata


@router.post("/refresh", response_model=DatabaseMetadata)
async def refresh_metadata(connection_id: UUID) -> DatabaseMetadata:
    """Re-extract metadata from the database."""
    # Verify connection exists
    connection = await ConnectionService.get_by_id(connection_id)
    if not connection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=ErrorResponse(
                error=ErrorDetail(code="NOT_FOUND", message=f"Connection {connection_id} not found")
            ).model_dump(by_alias=True),
        )

    try:
        # Extract and cache metadata
        metadata = await MetadataService.extract_metadata(connection_id)
        # Update last accessed timestamp
        await ConnectionService.update_last_accessed(connection_id)
        return metadata
    except Exception as e:
        # Provide more user-friendly error messages
        error_msg = str(e)
        if "Can't connect to MySQL server" in error_msg or "2003" in error_msg:
            user_message = "无法连接到 MySQL 服务器。请检查：1) MySQL 服务是否运行 2) 连接 URL 是否正确 3) 网络连接是否正常"
        elif "Can't connect to PostgreSQL server" in error_msg or "could not connect" in error_msg.lower():
            user_message = "无法连接到 PostgreSQL 服务器。请检查：1) PostgreSQL 服务是否运行 2) 连接 URL 是否正确 3) 网络连接是否正常"
        elif "authentication failed" in error_msg.lower() or "access denied" in error_msg.lower() or "password" in error_msg.lower():
            user_message = "数据库认证失败。请检查用户名和密码是否正确"
        elif "Unknown database" in error_msg or "database" in error_msg.lower() and "does not exist" in error_msg.lower():
            user_message = "数据库不存在或无法访问。请检查数据库名称是否正确"
        else:
            user_message = f"无法提取元数据: {error_msg}"
        
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=ErrorResponse(
                error=ErrorDetail(
                    code="METADATA_EXTRACTION_FAILED",
                    message=user_message,
                    details={"original_error": error_msg}
                )
            ).model_dump(by_alias=True),
        )
