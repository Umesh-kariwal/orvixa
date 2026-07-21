from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class ConfidenceTier(str, Enum):
    HIGH = "HIGH"          # Score >= 0.85: Trigger side panel recommendations
    MEDIUM = "MEDIUM"      # Score >= 0.65: Show subtle aura indicator
    LOW = "LOW"            # Score >= 0.40: Remain quiet, log candidate
    UNKNOWN = "UNKNOWN"    # Score < 0.40: Absolute silence (Zero noise)


class ActiveObjectSchema(BaseModel):
    """Details about active DOM element, highlighted text, or code block."""

    object_type: str = Field(..., json_schema_extra={"example": "code_snippet"}, description="Type of DOM object (code_snippet, text_selection, form_input, table_row)")
    content: Optional[str] = Field(default=None, description="Raw content of active object")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Metadata (language, element_tag, line_numbers)")
    is_sensitive: bool = Field(default=False, description="Flag set if object originates from password/auth field")


class NormalizedContextSchema(BaseModel):
    """Normalized web context payload captured from host platform."""

    url: str = Field(..., json_schema_extra={"example": "https://github.com/org/repo/pull/42"}, description="Full host URL")
    domain: str = Field(..., json_schema_extra={"example": "github.com"}, description="Host domain name")
    platform_hint: Optional[str] = Field(default="generic", description="Suggested platform adapter key")
    screen_title: Optional[str] = Field(default=None, description="Page or document title")
    active_object: Optional[ActiveObjectSchema] = Field(default=None, description="Current focused or selected object")
    visible_text_summary: Optional[str] = Field(default=None, description="Truncated summary of visible page text")
    session_id: Optional[str] = Field(default=None, description="Short-lived working session identifier")
    recent_actions: List[str] = Field(default_factory=list, description="Recent user actions (select, copy, error_click)")


class RecommendedActionSchema(BaseModel):
    """Dynamically generated contextual action."""

    action_id: str = Field(..., json_schema_extra={"example": "explain_selection"}, description="Unique action code")
    label: str = Field(..., json_schema_extra={"example": "Explain Selection"}, description="Human-readable button label")
    description: str = Field(..., json_schema_extra={"example": "Explains the selected code snippet in 1 sentence"}, description="Action summary")
    icon: Optional[str] = Field(default="help-circle", description="Icon key for UI rendering")


class ContextIntelligenceResponse(BaseModel):
    """Result returned by Universal Context Intelligence Engine."""

    confidence_tier: ConfidenceTier = Field(..., description="Engine confidence level")
    confidence_score: float = Field(..., json_schema_extra={"example": 0.92}, description="Calculated confidence score between 0.0 and 1.0")
    primary_intent: str = Field(..., json_schema_extra={"example": "CODE_DEBUGGING"}, description="Derived primary user intent")
    recommended_actions: List[RecommendedActionSchema] = Field(default_factory=list, description="Generated actions")
    side_panel_state: str = Field(..., json_schema_extra={"example": "ACTIVE_RECOMMENDATIONS"}, description="Recommended side panel state")
    redacted: bool = Field(default=False, description="Flag indicating if PII redaction was applied")
    sanitized_summary: Optional[str] = Field(default=None, description="PII-sanitized context summary")
