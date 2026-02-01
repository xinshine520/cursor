"""Error response models."""

from typing import Any

from . import CamelModel


class ErrorDetail(CamelModel):
    """Error detail information."""

    code: str
    message: str
    details: dict[str, Any] | None = None


class ErrorResponse(CamelModel):
    """Standard error response format."""

    error: ErrorDetail
