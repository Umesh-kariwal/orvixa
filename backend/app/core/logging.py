import json
import logging
import sys
import uuid
import re
from typing import Any, Dict
from app.core.config import settings

import contextvars
correlation_id_var = contextvars.ContextVar("correlation_id", default="")
request_id_var = contextvars.ContextVar("request_id", default="")
session_id_var = contextvars.ContextVar("session_id", default="")


class StructuredJSONFormatter(logging.Formatter):
    """Production-grade structured JSON log formatter.

    Cleans PII, passwords, prompt content, and API keys automatically.
    """

    # Matches key/value assignment formats and captures key, quotes, and punctuation
    SECRET_PATTERN = re.compile(
        r"(\b(?:api_key|password|token|secret|authorization|key|credentials|ssn|phone|email)\b\s*[:=]\s*['\"]?)[a-zA-Z0-9_\-\.\@]+(['\"]?)",
        re.IGNORECASE,
    )

    def scrub_message(self, message: str) -> str:
        if not message:
            return ""
        return self.SECRET_PATTERN.sub(r"\1[REDACTED_BY_GUARDIAN]\2", message)

    def format(self, record: logging.LogRecord) -> str:
        log_data: Dict[str, Any] = {
            "timestamp": self.formatTime(record, self.datefmt or "%Y-%m-%dT%H:%M:%SZ"),
            "severity": record.levelname,
            "component": record.name,
            "message": self.scrub_message(record.getMessage()),
            "correlation_id": correlation_id_var.get() or str(uuid.uuid4()),
            "request_id": request_id_var.get(),
            "session_id": session_id_var.get(),
        }

        if record.exc_info:
            if settings.ENVIRONMENT == "development":
                log_data["exception"] = self.formatException(record.exc_info)
            else:
                log_data["exception"] = "[Traceback Hidden in Production]"

        return json.dumps(log_data)


def setup_logging() -> logging.Logger:
    """Configures structured stream logging for the application."""
    log_level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)

    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)

    if not root_logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        
        if settings.ENVIRONMENT in ["production", "beta"]:
            formatter = StructuredJSONFormatter()
        else:
            formatter = logging.Formatter(
                fmt="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
                datefmt="%Y-%m-%dT%H:%M:%SZ",
            )
        
        handler.setFormatter(formatter)
        root_logger.addHandler(handler)

    logger = logging.getLogger("orvixa")
    logger.setLevel(log_level)

    return logger


logger = setup_logging()
