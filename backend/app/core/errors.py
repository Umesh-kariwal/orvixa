import uuid
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from app.core.logging import logger
from app.core.config import settings


def register_exception_handlers(app: FastAPI) -> None:
    """Registers global exception handlers for the FastAPI application."""

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
        err_id = f"ERR-{uuid.uuid4().hex[:8].upper()}"
        logger.warning(
            "HTTP error occurred: id=%s status=%s path=%s detail=%s",
            err_id,
            exc.status_code,
            request.url.path,
            exc.detail,
        )

        recovery_suggestion = "Please check your input parameters and retry."
        if exc.status_code == 400 and "Security Alert" in exc.detail:
            recovery_suggestion = "Please verify that your prompt does not contain malicious instruction overrides."
        elif exc.status_code == 429:
            recovery_suggestion = "You have exceeded the allowed rate limit. Please wait a minute and retry."

        content = {
            "error": {
                "id": err_id,
                "code": exc.status_code,
                "message": exc.detail,
                "recovery_suggestion": recovery_suggestion,
                "type": "HTTPException",
            }
        }

        # Include technical details only in development mode
        if settings.ENVIRONMENT == "development":
            content["error"]["technical_details"] = "Starlette HTTP Exception occurred on path."

        return JSONResponse(status_code=exc.status_code, content=content)

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
        err_id = f"ERR-{uuid.uuid4().hex[:8].upper()}"
        logger.warning("Validation error on path=%s: %s", request.url.path, exc.errors())
        
        content = {
            "error": {
                "id": err_id,
                "code": 422,
                "message": "Validation Error",
                "recovery_suggestion": "Please ensure all required payload schema fields are provided correctly.",
                "details": exc.errors(),
                "type": "ValidationError",
            }
        }

        return JSONResponse(status_code=422, content=content)

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        err_id = f"ERR-{uuid.uuid4().hex[:8].upper()}"
        logger.error(
            "Unhandled internal server error on path=%s: %s",
            request.url.path,
            str(exc),
            exc_info=True,
        )

        content = {
            "error": {
                "id": err_id,
                "code": status.HTTP_500_INTERNAL_SERVER_ERROR,
                "message": "An unexpected error occurred.",
                "recovery_suggestion": "Please reload the Orvixa sidebar and retry. If this persists, contact support.",
                "type": "UnhandledException",
            }
        }

        if settings.ENVIRONMENT == "development":
            content["error"]["technical_details"] = str(exc)

        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=content,
        )
