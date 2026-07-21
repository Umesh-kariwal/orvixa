import re
from typing import Optional
from app.schemas.github_analysis import StackTraceAnalysisSchema


class StackTraceAnalyzer:
    """Parses stack traces into structured diagnostic objects."""

    @classmethod
    def analyze_stack_trace(cls, raw_trace: str) -> StackTraceAnalysisSchema:
        if not raw_trace or not raw_trace.strip():
            return StackTraceAnalysisSchema(
                exception_type="UnknownError",
                error_message="Empty stack trace provided",
                language="unknown",
                probable_cause="No trace text provided",
                confidence=0.0,
            )

        # 1. Python Stack Trace Pattern
        py_match = re.search(r'File "(.*?)", line (\d+), in (.*)\n\s*(.*)\n(\w+Error|Exception):\s*(.*)', raw_trace)
        if py_match:
            return StackTraceAnalysisSchema(
                exception_type=py_match.group(5),
                error_message=py_match.group(6).strip(),
                language="python",
                source_file=py_match.group(1),
                line_number=int(py_match.group(2)),
                probable_cause=f"Error in {py_match.group(3)}: {py_match.group(6).strip()}",
                confidence=0.95,
            )

        # 2. JavaScript / TypeScript Stack Trace Pattern
        js_match = re.search(r'(\w+Error):\s*(.*?)\n\s+at (?:(.*?) \()?([^:]+):(\d+):(\d+)\)?', raw_trace)
        if js_match:
            return StackTraceAnalysisSchema(
                exception_type=js_match.group(1),
                error_message=js_match.group(2).strip(),
                language="typescript",
                source_file=js_match.group(4),
                line_number=int(js_match.group(5)),
                probable_cause=f"Exception in function {js_match.group(3) or 'anonymous'}: {js_match.group(2).strip()}",
                confidence=0.90,
            )

        # 3. Fallback generic trace matcher
        return StackTraceAnalysisSchema(
            exception_type="RuntimeError",
            error_message=raw_trace.split("\n")[0][:100],
            language="generic",
            probable_cause="Generic runtime exception detected",
            confidence=0.50,
        )
