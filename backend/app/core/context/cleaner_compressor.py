import re
from typing import Tuple
from app.schemas.learning_context import TokenCompressionMeta


class ContextCleanerCompressor:
    """Filters noisy webpage boilerplate and compresses token footprint."""

    NOISE_PATTERNS = [
        r"cookie[s]?\s+policy",
        r"accept\s+all\s+cookies",
        r"subscribe\s+to\s+newsletter",
        r"privacy\s+policy",
        r"terms\s+of\s+service",
        r"all\s+rights\s+reserved",
        r"share\s+on\s+facebook",
        r"share\s+on\s+twitter",
        r"advertisement",
        r"sponsored\s+content",
    ]

    @classmethod
    def clean_and_compress(cls, raw_text: str) -> Tuple[str, TokenCompressionMeta]:
        if not raw_text:
            return "", TokenCompressionMeta(original_char_count=0, compressed_char_count=0, compression_ratio=0.0)

        orig_len = len(raw_text)
        cleaned = raw_text

        # 1. Filter Noisy Advertisements & Cookie Banners
        for pattern in cls.NOISE_PATTERNS:
            cleaned = re.sub(pattern, "", cleaned, flags=re.IGNORECASE)

        # 2. Collapse Multiple Whitespaces and Empty Lines
        cleaned = re.sub(r"\n\s*\n+", "\n\n", cleaned)
        cleaned = re.sub(r"[ \t]+", " ", cleaned).strip()

        # 3. Compress Repetitive Structural Sentences
        lines = cleaned.split("\n")
        seen = set()
        unique_lines = []
        for line in lines:
            normalized_line = line.strip().lower()
            if normalized_line and normalized_line not in seen:
                seen.add(normalized_line)
                unique_lines.append(line.strip())

        compressed_text = "\n".join(unique_lines)
        comp_len = len(compressed_text)

        ratio = round((1 - (comp_len / orig_len)) if orig_len > 0 else 0.0, 2)

        meta = TokenCompressionMeta(
            original_char_count=orig_len,
            compressed_char_count=comp_len,
            compression_ratio=ratio,
        )

        return compressed_text, meta
