from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class DiffHunkSchema(BaseModel):
    old_start: int
    old_lines: int
    new_start: int
    new_lines: int
    header: str
    added_lines: List[str] = Field(default_factory=list)
    removed_lines: List[str] = Field(default_factory=list)


class DiffFileSchema(BaseModel):
    old_path: str
    new_path: str
    status: str = Field(description="added | modified | deleted | renamed")
    additions: int = 0
    deletions: int = 0
    hunks: List[DiffHunkSchema] = Field(default_factory=list)
    is_security_sensitive: bool = False
    is_config_file: bool = False
    is_test_file: bool = False


class PrioritizedFileSchema(BaseModel):
    filepath: str
    priority_score: float = Field(description="Priority ranking score 0.0 - 100.0")
    reason: str
    security_risk_level: str = Field(description="HIGH | MEDIUM | LOW | NONE")


class DependencyGraphSchema(BaseModel):
    imports: List[str] = Field(default_factory=list)
    exports: List[str] = Field(default_factory=list)
    impact_radius: int = Field(description="Estimated number of downstream affected modules")


class StackTraceAnalysisSchema(BaseModel):
    exception_type: str
    error_message: str
    language: str
    source_file: Optional[str] = None
    line_number: Optional[int] = None
    probable_cause: str
    confidence: float = Field(description="Confidence score 0.0 - 1.0")


class CommitAnalysisSchema(BaseModel):
    commit_hash: Optional[str] = None
    intent: str
    scope: str
    affected_modules: List[str] = Field(default_factory=list)
    risk_level: str = Field(description="HIGH | MEDIUM | LOW")
    deployment_impact: str


class PRAnalysisSchema(BaseModel):
    pr_number: Optional[str] = None
    total_files_changed: int = 0
    total_additions: int = 0
    total_deletions: int = 0
    touched_directories: List[str] = Field(default_factory=list)
    languages: List[str] = Field(default_factory=list)
    has_security_impact: bool = False
    has_config_changes: bool = False
    has_test_coverage: bool = False
    prioritized_files: List[PrioritizedFileSchema] = Field(default_factory=list)
    summary: str
