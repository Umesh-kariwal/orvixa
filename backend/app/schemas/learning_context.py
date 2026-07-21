from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class ContextCategorySchema(BaseModel):
    category: str = Field(description="Programming | Mathematics | Physics | Chemistry | Biology | English | Aptitude | Interview | Documentation | Research | General")
    confidence: float = Field(default=0.95, description="Category classification confidence score")


class TokenCompressionMeta(BaseModel):
    original_char_count: int
    compressed_char_count: int
    compression_ratio: float = Field(description="Ratio of compression savings (e.g. 0.45)")


class LearningContextSchema(BaseModel):
    context_id: str
    source_type: str = Field(description="selection | screen_capture | page_view | adapter_github | adapter_leetcode | adapter_notion | generic_web")
    url: Optional[str] = None
    page_title: Optional[str] = None
    category: ContextCategorySchema
    extracted_text: str
    cleaned_content: str
    compression_meta: TokenCompressionMeta
    is_privacy_sanitized: bool = True
    metadata: Dict[str, Any] = Field(default_factory=dict)
