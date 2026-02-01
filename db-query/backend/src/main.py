"""FastAPI application entry point."""

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .api import connections, metadata, queries
from .config import settings
from .db.migrations import migrate_database
from .db.sqlite import db_pool
from .models.errors import ErrorDetail, ErrorResponse


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    # Startup
    await db_pool.initialize()
    # Run migrations
    await migrate_database()
    yield
    # Shutdown
    await db_pool.close()


app = FastAPI(
    title="DB-Query API",
    description="Database query tool API for connection management, metadata extraction, and SQL execution",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """Handle Pydantic validation errors."""
    errors = exc.errors()
    error_messages = []
    for error in errors:
        field = " -> ".join(str(loc) for loc in error.get("loc", []))
        msg = error.get("msg", "Validation error")
        error_messages.append(f"{field}: {msg}")
    
    error_response = ErrorResponse(
        error=ErrorDetail(
            code="VALIDATION_ERROR",
            message="Request validation failed: " + "; ".join(error_messages),
            details={"errors": errors},
        )
    )
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content=error_response.model_dump(by_alias=True),
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Global exception handler returning ErrorResponse format."""
    error_response = ErrorResponse(
        error=ErrorDetail(
            code="INTERNAL_ERROR",
            message=str(exc),
            details={"path": str(request.url.path)},
        )
    )
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=error_response.model_dump(by_alias=True),
    )


# Register routers
app.include_router(connections.router)
app.include_router(metadata.router)
app.include_router(queries.router)


@app.get("/health")
async def health_check() -> dict[str, str]:
    """Health check endpoint."""
    return {"status": "ok"}
