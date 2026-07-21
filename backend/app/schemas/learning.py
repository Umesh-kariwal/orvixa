from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class LearningIntentSchema(BaseModel):
    intent_mode: str = Field(description="Answer | Explain | Teach | Hint | Summarize | Translate | Interview | Practice | Compare | Simplify")
    domain: str = Field(default="programming", description="programming | physics | english | general")
    confidence: float = Field(default=0.95, description="Confidence score 0.0 - 1.0")


class AdaptiveCardPayload(BaseModel):
    card_type: str = Field(description="LEARNING_ANSWER | LEARNING_CONCEPT | LEARNING_HINT | LEARNING_EXAMPLE | LEARNING_FORMULA | LEARNING_INTERVIEW | LEARNING_PRACTICE | LEARNING_MISTAKES | LEARNING_REVISION")
    title: str
    content: str
    metadata: Dict[str, Any] = Field(default_factory=dict)


class LearningResponsePayload(BaseModel):
    intent: LearningIntentSchema
    summary: str
    cards: List[AdaptiveCardPayload] = Field(default_factory=list)
