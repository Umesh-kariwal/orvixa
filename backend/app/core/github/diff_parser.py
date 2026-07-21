import re
from typing import List
from app.schemas.github_analysis import DiffFileSchema, DiffHunkSchema


class DiffAnalyzer:
    """Parses raw Git unified diffs into structured Pydantic objects."""

    @classmethod
    def parse_diff(cls, raw_diff: str) -> List[DiffFileSchema]:
        files: List[DiffFileSchema] = []
        if not raw_diff or not raw_diff.strip():
            return files

        raw_files = re.split(r"^diff --git ", raw_diff, flags=re.MULTILINE)

        for rf in raw_files:
            if not rf.strip():
                continue

            lines = rf.split("\n")
            header_line = lines[0]
            paths = re.findall(r"a/(.*?)\s+b/(.*)", header_line)

            old_path = paths[0][0] if paths else "unknown"
            new_path = paths[0][1] if paths else "unknown"

            additions = 0
            deletions = 0
            hunks: List[DiffHunkSchema] = []
            current_hunk: DiffHunkSchema | None = None

            for line in lines:
                if line.startsWith if hasattr(line, "startsWith") else line.startswith("@@"):
                    match = re.match(r"@@ -(\d+),?(\d+)? \+(\d+),?(\d+)? @@(.*)", line)
                    if match:
                        current_hunk = DiffHunkSchema(
                            old_start=int(match.group(1)),
                            old_lines=int(match.group(2) or 1),
                            new_start=int(match.group(3)),
                            new_lines=int(match.group(4) or 1),
                            header=match.group(5).strip(),
                            added_lines=[],
                            removed_lines=[],
                        )
                        hunks.append(current_hunk)
                elif current_hunk:
                    if line.startswith("+") and not line.startswith("+++"):
                        additions += 1
                        current_hunk.added_lines.append(line[1:])
                    elif line.startswith("-") and not line.startswith("---"):
                        deletions += 1
                        current_hunk.removed_lines.append(line[1:])

            is_sec = cls._is_security_file(new_path)
            is_cfg = cls._is_config_file(new_path)
            is_tst = cls._is_test_file(new_path)

            files.append(
                DiffFileSchema(
                    old_path=old_path,
                    new_path=new_path,
                    status="modified" if old_path == new_path else "added",
                    additions=additions,
                    deletions=deletions,
                    hunks=hunks,
                    is_security_sensitive=is_sec,
                    is_config_file=is_cfg,
                    is_test_file=is_tst,
                )
            )

        return files

    @staticmethod
    def _is_security_file(filepath: str) -> bool:
        path_lower = filepath.lower()
        return any(term in path_lower for term in ["auth", "security", "token", "secret", "permission", "crypto", "cert", "key"])

    @staticmethod
    def _is_config_file(filepath: str) -> bool:
        path_lower = filepath.lower()
        return any(term in path_lower for term in ["config", ".env", "docker", "k8s", "settings", "manifest", "package.json", "requirements.txt"])

    @staticmethod
    def _is_test_file(filepath: str) -> bool:
        path_lower = filepath.lower()
        return any(term in path_lower for term in ["test", "spec", "__tests__", "e2e"])
