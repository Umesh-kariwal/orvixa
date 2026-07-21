import re
from app.schemas.learning_context import ContextCategorySchema


class ContextClassifier:
    """Classifies learning context into 11 specialized educational domains."""

    @classmethod
    def classify_context(cls, text: str, url: str = "", title: str = "") -> ContextCategorySchema:
        combined = f"{title} {url} {text}".lower()

        # 1. Category Keyword Matching Rules
        if any(w in combined for w in ["leetcode", "github", "python", "javascript", "algorithm", "binary search", "array", "def ", "class ", "function"]):
            return ContextCategorySchema(category="Programming", confidence=0.98)

        if any(w in combined for w in ["integral", "derivative", "calculus", "matrix", "algebra", "theorem", "equation", "math", "summation"]):
            return ContextCategorySchema(category="Mathematics", confidence=0.95)

        if any(w in combined for w in ["velocity", "acceleration", "force", "gravity", "mass", "momentum", "quantum", "physics", "thermodynamics"]):
            return ContextCategorySchema(category="Physics", confidence=0.95)

        if any(w in combined for w in ["reaction", "molecule", "atomic", "acid", "base", "element", "chemistry", "bond"]):
            return ContextCategorySchema(category="Chemistry", confidence=0.95)

        if any(w in combined for w in ["cell", "dna", "rna", "organism", "gene", "protein", "biology", "species"]):
            return ContextCategorySchema(category="Biology", confidence=0.95)

        if any(w in combined for w in ["grammar", "vocabulary", "pronunciation", "sentence", "noun", "verb", "adjective", "english"]):
            return ContextCategorySchema(category="English", confidence=0.92)

        if any(w in combined for w in ["percentage", "ratio", "reasoning", "puzzle", "speed", "distance", "aptitude"]):
            return ContextCategorySchema(category="Aptitude", confidence=0.90)

        if any(w in combined for w in ["interview", "candidate", "roleplay", "star method", "behavioral", "system design"]):
            return ContextCategorySchema(category="Interview", confidence=0.96)

        if any(w in combined for w in ["docs", "documentation", "api reference", "sdk", "guide", "manual", "notion"]):
            return ContextCategorySchema(category="Documentation", confidence=0.94)

        if any(w in combined for w in ["abstract", "arxiv", "paper", "journal", "experiment", "methodology", "research"]):
            return ContextCategorySchema(category="Research", confidence=0.93)

        return ContextCategorySchema(category="General", confidence=0.75)
