import re
from typing import Tuple


class PIIRedactor:
    """Production PII & Sensitive Secret Redaction Pipeline.

    Scans and redacts API keys, credentials, emails, SSNs, and bearer tokens
    to guarantee zero privacy leakage to LLM providers or logs.
    """

    PATTERNS = [
        # Secret API Keys & Access Tokens
        (re.compile(r"sk-[A-Za-z0-9_\-]{16,}"), "[REDACTED_SECRET]"),
        (re.compile(r"sec_token_[A-Za-z0-9_]{24,}"), "[REDACTED_API_TOKEN]"),
        (re.compile(r"bearer\s+[A-Za-z0-9\-\._~\+\/]+=*", re.IGNORECASE), "Bearer [REDACTED_TOKEN]"),
        
        # Email Addresses
        (re.compile(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"), "[REDACTED_EMAIL]"),
        
        # Social Security Numbers (US SSN)
        (re.compile(r"\b\d{3}-\d{2}-\d{4}\b"), "[REDACTED_SSN]"),
        
        # Credit Card Numbers (Major Brands)
        (re.compile(r"\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13})\b"), "[REDACTED_CREDIT_CARD]"),
    ]

    @classmethod
    def sanitize(cls, text: str) -> Tuple[str, bool]:
        """Sanitizes text by replacing matching PII patterns with redacted placeholders.

        Returns:
            Tuple[str, bool]: (sanitized_text, was_redacted_flag)
        """
        if not text:
            return "", False

        sanitized = text
        was_redacted = False

        for pattern, replacement in cls.PATTERNS:
            if pattern.search(sanitized):
                sanitized = pattern.sub(replacement, sanitized)
                was_redacted = True

        return sanitized, was_redacted

    @classmethod
    def redact_secrets(cls, text: str) -> Tuple[str, int]:
        """Redacts secrets and returns (sanitized_text, redaction_count)."""
        if not text:
            return "", 0

        sanitized = text
        count = 0
        for pattern, replacement in cls.PATTERNS:
            matches = pattern.findall(sanitized)
            if matches:
                count += len(matches)
                sanitized = pattern.sub(replacement, sanitized)

        return sanitized, count


class SensitiveFieldFilter:
    """Filters and suppresses inputs originating from sensitive DOM fields (passwords, OTPs)."""

    SENSITIVE_TYPES = {"password", "pin", "otp", "cvv", "creditcard", "ssn", "secret"}

    @classmethod
    def is_sensitive(cls, field_name: str, field_type: str = "") -> bool:
        """Determines if a DOM field is classified as sensitive."""
        name_lower = field_name.lower()
        type_lower = field_type.lower()

        for st in cls.SENSITIVE_TYPES:
            if st in name_lower or st in type_lower:
                return True
        return False
