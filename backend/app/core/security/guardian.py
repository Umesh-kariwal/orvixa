import re
import time
from typing import Dict, Tuple, Optional
from fastapi import HTTPException, status

# In-memory IP request store for rate limiting (reset on reload)
rate_limit_store: Dict[str, list] = {}


class InputValidator:
    """Validates user text inputs for length, size, and encoding safety."""

    MAX_CHAR_LIMIT = 50000  # Prevent oversized buffer injection attacks

    @classmethod
    def validate_text(cls, text: str) -> None:
        if not text:
            return

        # 1. Size Validation
        if len(text) > cls.MAX_CHAR_LIMIT:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="Input exceeds maximum allowed length.",
            )

        # 2. Character Encoding Validation
        try:
            text.encode("utf-8")
        except UnicodeEncodeError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Malformed encoding in payload characters.",
            )


class PromptInjectionGuard:
    """Detects and neutralizes prompt injections, system override overrides, and Unicode jailbreaks."""

    INJECTION_PATTERNS = [
        r"ignore\s+(?:all\s+)?previous\s+instructions",
        r"you\s+must\s+now\s+act\s+as",
        r"system\s+override",
        r"bypass\s+restrictions",
        r"developer\s+mode\s+active",
        r"act\s+as\s+a\s+terminal",
        r"output\s+raw\s+system\s+prompt",
        r"forget\s+your\s+rules",
    ]

    @classmethod
    def contains_injection(cls, text: str) -> Tuple[bool, Optional[str]]:
        if not text:
            return False, None

        # 1. Strip invisible control characters (Unicode zero-width space hacks)
        cleaned = re.sub(r"[\u200b-\u200d\ufeff]", "", text).lower()

        # 2. Check match patterns
        for pattern in cls.INJECTION_PATTERNS:
            if re.search(pattern, cleaned):
                return True, pattern

        return False, None

    @classmethod
    def sanitize_context_text(cls, text: str) -> str:
        """Neutralizes execution injection tokens in user-supplied screen context."""
        if not text:
            return ""
        # Escape markdown formatting block headers to prevent parser hijacking
        return text.replace("```", " escaped_code_block ")


class RateLimiter:
    """Enforces request rate limits (max 30 requests per minute per IP)."""

    LIMIT_WINDOW_SEC = 60
    MAX_REQUESTS = 30

    @classmethod
    def check_rate_limit(cls, ip_address: str) -> None:
        now = time.time()
        if ip_address not in rate_limit_store:
            rate_limit_store[ip_address] = [now]
            return

        # Filter out timestamps outside active window
        active_requests = [t for t in rate_limit_store[ip_address] if now - t < cls.LIMIT_WINDOW_SEC]
        active_requests.append(now)
        rate_limit_store[ip_address] = active_requests

        if len(active_requests) > cls.MAX_REQUESTS:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Request rate limit exceeded. Please wait a minute.",
            )
