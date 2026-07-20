from typing import Any, Dict, Optional
from pydantic import BaseModel, Field


class TokenUsage(BaseModel):
    """Represents token consumption metrics for an LLM interaction."""

    prompt_tokens: int = Field(default=0, ge=0, description="Number of tokens in prompt")
    completion_tokens: int = Field(default=0, ge=0, description="Number of tokens in generated completion")
    total_tokens: int = Field(default=0, ge=0, description="Total tokens consumed")


class AIRequest(BaseModel):
    """Provider-agnostic request model for LLM generation."""

    prompt: str = Field(description="User or system input prompt string")
    system_instruction: Optional[str] = Field(default=None, description="Optional system-level instruction context")
    temperature: float = Field(default=0.7, ge=0.0, le=2.0, description="Sampling temperature")
    max_tokens: Optional[int] = Field(default=None, ge=1, description="Maximum tokens to generate")
    top_p: float = Field(default=0.9, ge=0.0, le=1.0, description="Nucleus sampling parameter")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Arbitrary request metadata")


class AIResponse(BaseModel):
    """Provider-agnostic response payload returned by an LLM provider."""

    content: str = Field(description="Generated text content")
    model_name: str = Field(description="Name of the model that generated response")
    provider_name: str = Field(description="Name of the LLM provider (e.g. gemini, openai)")
    usage: TokenUsage = Field(default_factory=TokenUsage, description="Token usage metrics")
    finish_reason: str = Field(default="STOP", description="Completion termination reason")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Provider response metadata")


class AIStreamChunk(BaseModel):
    """Incremental chunk emitted during streaming LLM responses."""

    delta: str = Field(description="Text increment contained in this chunk")
    finish_reason: Optional[str] = Field(default=None, description="Termination reason if chunk is final")
    usage: Optional[TokenUsage] = Field(default=None, description="Final token usage metrics if chunk is final")
