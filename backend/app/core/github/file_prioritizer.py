from typing import List
from app.schemas.github_analysis import DiffFileSchema, PrioritizedFileSchema


class FilePrioritizer:
    """Ranks Pull Request changed files by review priority."""

    @classmethod
    def prioritize_files(cls, diff_files: List[DiffFileSchema]) -> List[PrioritizedFileSchema]:
        prioritized: List[PrioritizedFileSchema] = []

        for df in diff_files:
            score = 10.0
            reasons: List[str] = []
            risk_level = "NONE"

            # 1. Security Sensitivity Weight
            if df.is_security_sensitive:
                score += 50.0
                reasons.append("Contains security/auth logic")
                risk_level = "HIGH"

            # 2. Infrastructure / Config Weight
            if df.is_config_file:
                score += 25.0
                reasons.append("Configuration or infrastructure changes")
                if risk_level == "NONE":
                    risk_level = "MEDIUM"

            # 3. Diff Size Weight
            lines_changed = df.additions + df.deletions
            if lines_changed > 200:
                score += 15.0
                reasons.append(f"Large diff ({lines_changed} lines changed)")
            elif lines_changed > 50:
                score += 5.0

            # 4. Test Files (Lower Priority for review order)
            if df.is_test_file:
                score -= 10.0
                reasons.append("Test suite file")
                if risk_level == "NONE":
                    risk_level = "LOW"

            reason_str = ", ".join(reasons) if reasons else "Standard business logic file"

            prioritized.append(
                PrioritizedFileSchema(
                    filepath=df.new_path,
                    priority_score=round(max(0.0, min(100.0, score)), 1),
                    reason=reason_str,
                    security_risk_level=risk_level,
                )
            )

        # Sort descending by priority score
        prioritized.sort(key=lambda f: f.priority_score, reverse=True)
        return prioritized
