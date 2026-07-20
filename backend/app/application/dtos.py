from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class DiagnoseAttemptCommand(BaseModel):
    """Command DTO containing input parameters required to diagnose a student attempt."""

    tenant_id: str = Field(..., description="Unique platform/tenant identifier")
    student_id: str = Field(..., description="Unique student/learner identifier")
    question_content: str = Field(..., description="Text of the question item being attempted")
    concept_id: str = Field(..., description="Primary learning concept identifier")
    difficulty: str = Field(default="INTERMEDIATE", description="Cognitive difficulty tier")
    raw_answer: Optional[str] = Field(default=None, description="Student submitted response text")


class DiagnosticResultDTO(BaseModel):
    """Query result DTO returning diagnostic outcome data to callers."""

    attempt_id: str = Field(..., description="Unique attempt context identifier")
    recommended_action: str = Field(..., description="Recommended pedagogical action name")
    identified_gaps: List[str] = Field(default_factory=list, description="List of identified concept gap IDs")
    explanation_summary: str = Field(..., description="Summary explanation for student/teacher")
    created_at: datetime = Field(..., description="UTC creation timestamp")
