from dataclasses import dataclass
from enum import Enum


class PedagogicalAction(str, Enum):
    """Types of pedagogical interventions Orvixa provides."""

    HINT = "HINT"
    CONCEPT_EXPLANATION = "CONCEPT_EXPLANATION"
    ERROR_DIAGNOSIS = "ERROR_DIAGNOSIS"
    SOCRATIC_PROMPT = "SOCRATIC_PROMPT"


class DifficultyLevel(str, Enum):
    """Cognitive difficulty tier of a learning concept or assessment item."""

    FOUNDATIONAL = "FOUNDATIONAL"
    INTERMEDIATE = "INTERMEDIATE"
    ADVANCED = "ADVANCED"


@dataclass(frozen=True)
class ConceptId:
    """Value object representing a unique learning concept identifier."""

    value: str

    def __post_init__(self) -> None:
        if not self.value or not self.value.strip():
            raise ValueError("ConceptId value cannot be empty.")


@dataclass(frozen=True)
class StudentAnswer:
    """Value object encapsulating student submitted response data."""

    raw_response: str
    is_submitted: bool = True

    def __post_init__(self) -> None:
        if self.raw_response is None:
            raise ValueError("raw_response cannot be None.")
