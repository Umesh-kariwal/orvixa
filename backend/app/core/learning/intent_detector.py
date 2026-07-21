import re
from app.schemas.learning import LearningIntentSchema


class IntentDetector:
    """Detects pedagogical intent mode and domain from user query text."""

    @classmethod
    def detect_intent(cls, prompt: str) -> LearningIntentSchema:
        prompt_lower = prompt.lower()

        # 1. Default Intent Resolution
        intent_mode = "Explain"
        domain = "general"

        # 2. Intent Mode Classification
        if any(w in prompt_lower for w in ["hint", "clue", "socratic", "stuck"]):
            intent_mode = "Hint"
        elif any(w in prompt_lower for w in ["teach", "lesson", "deeply", "learn"]):
            intent_mode = "Teach"
        elif any(w in prompt_lower for w in ["interview", "mock", "candidate", "roleplay"]):
            intent_mode = "Interview"
        elif any(w in prompt_lower for w in ["practice", "quiz", "exercise"]):
            intent_mode = "Practice"
        elif any(w in prompt_lower for w in ["summary", "summarize", "tl", "tl;dr"]):
            intent_mode = "Summarize"
        elif any(w in prompt_lower for w in ["compare", "difference", "versus", "vs"]):
            intent_mode = "Compare"
        elif any(w in prompt_lower for w in ["simplify", "easier", "ELI5"]):
            intent_mode = "Simplify"
        elif any(w in prompt_lower for w in ["translate", "language", "meaning"]):
            intent_mode = "Translate"
        elif any(w in prompt_lower for w in ["solve", "answer", "result", "calculate"]):
            intent_mode = "Answer"

        # 3. Domain Classification
        if any(w in prompt_lower for w in ["python", "code", "java", "binary search", "array", "pointer", "function", "variable"]):
            domain = "programming"
        elif any(w in prompt_lower for w in ["force", "gravity", "mass", "physics", "formula", "velocity", "friction"]):
            domain = "physics"
        elif any(w in prompt_lower for w in ["english", "grammar", "meaning", "vocabulary", "pronounce"]):
            domain = "english"

        return LearningIntentSchema(
            intent_mode=intent_mode,
            domain=domain,
            confidence=0.98,
        )
