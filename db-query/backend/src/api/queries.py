"""Query API endpoints."""

from uuid import UUID

from fastapi import APIRouter, HTTPException, status

from ..models.query import (
    GeneratedQuery,
    NaturalLanguageQueryRequest,
    QueryRequest,
    QueryResult,
)
from ..models.errors import ErrorDetail, ErrorResponse
from ..services.connection_service import ConnectionService
from ..services.nlq_service import NLQService
from ..services.query_service import QueryService

router = APIRouter(prefix="/connections/{connection_id}/query", tags=["Queries"])


@router.post("", response_model=QueryResult)
async def execute_query(connection_id: UUID, request: QueryRequest) -> QueryResult:
    """Execute a SQL query."""
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
        # Update last accessed timestamp
        await ConnectionService.update_last_accessed(connection_id)
        
        # Execute query
        result = await QueryService.execute_query(str(connection_id), request.sql)
        return result
    except ValueError as e:
        # Validation or SQL errors
        error_code = "INVALID_SQL" if "syntax" in str(e).lower() else "FORBIDDEN_STATEMENT"
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=ErrorResponse(
                error=ErrorDetail(
                    code=error_code,
                    message=str(e),
                )
            ).model_dump(by_alias=True),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=ErrorResponse(
                error=ErrorDetail(
                    code="QUERY_EXECUTION_FAILED",
                    message=f"Query execution failed: {str(e)}",
                )
            ).model_dump(by_alias=True),
        )


@router.post("/generate", response_model=GeneratedQuery)
async def generate_query(
    connection_id: UUID, request: NaturalLanguageQueryRequest
) -> GeneratedQuery:
    """Generate SQL query from natural language."""
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
        # Update last accessed timestamp
        await ConnectionService.update_last_accessed(connection_id)
        
        # Generate SQL from natural language
        result = await NLQService.generate_sql(str(connection_id), request.query)
        return result
    except ValueError as e:
        # Validation or generation errors
        error_msg = str(e)
        # Check if it's an authentication/configuration error
        if "authentication" in error_msg.lower() or "api_key" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=ErrorResponse(
                    error=ErrorDetail(
                        code="OPENAI_AUTH_ERROR",
                        message=f"OpenAI API authentication failed: {error_msg}",
                    )
                ).model_dump(by_alias=True),
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=ErrorResponse(
                error=ErrorDetail(
                    code="SQL_GENERATION_FAILED",
                    message=error_msg,
                )
            ).model_dump(by_alias=True),
        )
    except Exception as e:
        import traceback
        import logging
        
        error_msg = str(e)
        error_type = type(e).__name__
        
        # Log the full traceback for debugging
        logger = logging.getLogger(__name__)
        logger.error(f"SQL generation error ({error_type}): {error_msg}", exc_info=True)
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=ErrorResponse(
                error=ErrorDetail(
                    code="SQL_GENERATION_ERROR",
                    message=f"Failed to generate SQL ({error_type}): {error_msg}",
                )
            ).model_dump(by_alias=True),
        )
