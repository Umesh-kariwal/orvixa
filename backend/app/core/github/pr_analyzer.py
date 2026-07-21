from typing import List, Optional
from app.core.github.diff_parser import DiffAnalyzer
from app.core.github.file_prioritizer import FilePrioritizer
from app.schemas.github_analysis import PRAnalysisSchema


class PullRequestAnalyzer:
    """Orchestrates Pull Request analysis pipeline."""

    @classmethod
    def analyze_pr(cls, raw_diff: str, pr_number: Optional[str] = None) -> PRAnalysisSchema:
        diff_files = DiffAnalyzer.parse_diff(raw_diff)
        prioritized = FilePrioritizer.prioritize_files(diff_files)

        total_additions = sum(f.additions for f in diff_files)
        total_deletions = sum(f.deletions for f in diff_files)

        touched_dirs = list({f.new_path.split("/")[0] for f in diff_files if "/" in f.new_path})
        has_security = any(f.is_security_sensitive for f in diff_files)
        has_config = any(f.is_config_file for f in diff_files)
        has_tests = any(f.is_test_file for f in diff_files)

        summary = (
            f"PR #{pr_number or 'N/A'}: Changed {len(diff_files)} files "
            f"(+{total_additions} / -{total_deletions} lines). "
            f"Security impact: {'YES' if has_security else 'NO'}."
        )

        return PRAnalysisSchema(
            pr_number=pr_number,
            total_files_changed=len(diff_files),
            total_additions=total_additions,
            total_deletions=total_deletions,
            touched_directories=touched_dirs,
            has_security_impact=has_security,
            has_config_changes=has_config,
            has_test_coverage=has_tests,
            prioritized_files=prioritized,
            summary=summary,
        )
