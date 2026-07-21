import uuid
from typing import Any, Dict, Optional
from app.core.context.privacy import PIIRedactor
from app.core.context.classifier import ContextClassifier
from app.core.context.cleaner_compressor import ContextCleanerCompressor
from app.schemas.learning_context import LearningContextSchema


class UniversalContextEngine:
    """Unified Universal Context Engine for Orvixa Learning Copilot.

    Normalizes all context inputs (selection, screen capture, page view, adapters)
    through Privacy Shield, Domain Classification, Noise Filtering, and Token Compression.
    """

    @classmethod
    def process_context(
        cls,
        raw_text: str,
        source_type: str = "generic_web",
        url: Optional[str] = None,
        page_title: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> LearningContextSchema:
        # 1. Apply Privacy Shield Filtering (Mask secrets, API keys, passwords, PII)
        sanitized_text, redaction_count = PIIRedactor.redact_secrets(raw_text or "")

        # 2. Clean Noise & Compress Token Footprint
        cleaned_text, comp_meta = ContextCleanerCompressor.clean_and_compress(sanitized_text)

        # 3. Classify Educational Domain
        category = ContextClassifier.classify_context(
            text=cleaned_text,
            url=url or "",
            title=page_title or "",
        )

        context_id = f"ctx_u_{uuid.uuid4().hex[:8]}"

        return LearningContextSchema(
            context_id=context_id,
            source_type=source_type,
            url=url,
            page_title=page_title,
            category=category,
            extracted_text=sanitized_text,
            cleaned_content=cleaned_text,
            compression_meta=comp_meta,
            is_privacy_sanitized=True,
            metadata={
                **(metadata or {}),
                "redaction_count": redaction_count,
            },
        )
