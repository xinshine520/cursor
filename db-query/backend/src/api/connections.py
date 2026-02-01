"""Connection API endpoints."""

from uuid import UUID

from fastapi import APIRouter, HTTPException, status

from ..models.connection import Connection, ConnectionCreate, ConnectionUpdate
from ..models.errors import ErrorDetail, ErrorResponse
from ..models.metadata import DatabaseMetadata
from ..services.connection_service import ConnectionService
from ..services.metadata_service import MetadataService

router = APIRouter(prefix="/connections", tags=["Connections"])


@router.post("", response_model=Connection, status_code=status.HTTP_201_CREATED)
async def create_connection(connection_data: ConnectionCreate) -> Connection:
    """Create a new database connection and extract metadata."""
    try:
        connection = await ConnectionService.create(connection_data)
        
        # Automatically extract metadata after connection creation
        try:
            await MetadataService.extract_metadata(connection.id)
            await ConnectionService.update_last_accessed(connection.id)
        except Exception as metadata_error:
            # Log error but don't fail connection creation
            # Metadata can be refreshed later
            pass
        
        return connection
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=ErrorResponse(
                error=ErrorDetail(code="VALIDATION_ERROR", message=str(e))
            ).model_dump(by_alias=True),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=ErrorResponse(
                error=ErrorDetail(
                    code="CONNECTION_FAILED", message=f"Failed to create connection: {str(e)}"
                )
            ).model_dump(by_alias=True),
        )


@router.get("", response_model=list[Connection])
async def list_connections() -> list[Connection]:
    """List all saved connections."""
    return await ConnectionService.list_all()


@router.get("/{connection_id}", response_model=Connection)
async def get_connection(connection_id: UUID) -> Connection:
    """Get a specific connection."""
    connection = await ConnectionService.get_by_id(connection_id)
    if not connection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=ErrorResponse(
                error=ErrorDetail(code="NOT_FOUND", message=f"Connection {connection_id} not found")
            ).model_dump(by_alias=True),
        )
    return connection


@router.patch("/{connection_id}", response_model=Connection)
async def update_connection(
    connection_id: UUID, update_data: ConnectionUpdate
) -> Connection:
    """Update connection name."""
    try:
        return await ConnectionService.update(connection_id, update_data)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=ErrorResponse(
                error=ErrorDetail(code="VALIDATION_ERROR", message=str(e))
            ).model_dump(by_alias=True),
        )


@router.post("/{connection_id}/test", status_code=status.HTTP_200_OK)
async def test_connection(connection_id: UUID) -> dict[str, str]:
    """Test database connection health."""
    try:
        connection_url = await ConnectionService.get_connection_url(connection_id)
        
        # Try to connect and execute a simple query
        import asyncpg
        conn = await asyncpg.connect(connection_url, timeout=5)
        try:
            result = await conn.fetchval("SELECT 1")
            if result == 1:
                return {"status": "success", "message": "Connection successful"}
            else:
                return {"status": "error", "message": "Connection test failed"}
        finally:
            await conn.close()
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=ErrorResponse(
                error=ErrorDetail(code="NOT_FOUND", message=str(e))
            ).model_dump(by_alias=True),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=ErrorResponse(
                error=ErrorDetail(
                    code="CONNECTION_TEST_FAILED",
                    message=f"Connection test failed: {str(e)}",
                )
            ).model_dump(by_alias=True),
        )


@router.delete("/{connection_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_connection(connection_id: UUID) -> None:
    """Delete a connection and its cached metadata."""
    try:
        await ConnectionService.delete(connection_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=ErrorResponse(
                error=ErrorDetail(code="NOT_FOUND", message=str(e))
            ).model_dump(by_alias=True),
        )
