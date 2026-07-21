import pytest
from app.core.github.diff_parser import DiffAnalyzer
from app.core.github.file_prioritizer import FilePrioritizer
from app.core.github.pr_analyzer import PullRequestAnalyzer
from app.core.github.stack_trace_analyzer import StackTraceAnalyzer


SMALL_PR_DIFF = """diff --git a/src/utils.py b/src/utils.py
--- a/src/utils.py
+++ b/src/utils.py
@@ -10,3 +10,3 @@ def add(a, b):
-    return a + b
+    return a + b if a and b else 0
"""

SECURITY_PR_DIFF = """diff --git a/src/auth/jwt_verifier.py b/src/auth/jwt_verifier.py
--- a/src/auth/jwt_verifier.py
+++ b/src/auth/jwt_verifier.py
@@ -1,5 +1,8 @@
-def verify_token(token):
-    return True
+def verify_token(token, secret_key):
+    if not token or not secret_key:
+        raise ValueError("Invalid secret")
+    return jwt.decode(token, secret_key)
"""

PYTHON_STACK_TRACE = """Traceback (most recent call last):
  File "app/core/context/privacy.py", line 42, in redact_secrets
    sanitized = re.sub(pattern, "****", raw_text)
TypeError: expected string or bytes-like object
"""

JS_STACK_TRACE = """TypeError: Cannot read properties of undefined (reading 'confidence')
    at SidePanelProvider.executeAction (SidePanelProvider.tsx:64:33)
    at HTMLButtonElement.dispatch (react-dom.js:120:4)
"""


def test_diff_analyzer_parses_unified_diff():
    files = DiffAnalyzer.parse_diff(SMALL_PR_DIFF)
    assert len(files) == 1
    assert files[0].new_path == "src/utils.py"
    assert files[0].additions == 1
    assert files[0].deletions == 1


def test_file_prioritizer_ranks_security_files_highest():
    files = DiffAnalyzer.parse_diff(SECURITY_PR_DIFF)
    prioritized = FilePrioritizer.prioritize_files(files)

    assert len(prioritized) == 1
    assert prioritized[0].filepath == "src/auth/jwt_verifier.py"
    assert prioritized[0].security_risk_level == "HIGH"
    assert prioritized[0].priority_score >= 50.0


def test_pr_analyzer_orchestration():
    analysis = PullRequestAnalyzer.analyze_pr(SECURITY_PR_DIFF, pr_number="42")
    assert analysis.pr_number == "42"
    assert analysis.has_security_impact is True
    assert len(analysis.prioritized_files) == 1


def test_stack_trace_analyzer_python():
    res = StackTraceAnalyzer.analyze_stack_trace(PYTHON_STACK_TRACE)
    assert res.language == "python"
    assert res.exception_type == "TypeError"
    assert res.source_file == "app/core/context/privacy.py"
    assert res.line_number == 42
    assert res.confidence >= 0.90


def test_stack_trace_analyzer_javascript():
    res = StackTraceAnalyzer.analyze_stack_trace(JS_STACK_TRACE)
    assert res.language == "typescript"
    assert res.exception_type == "TypeError"
    assert res.line_number == 64
    assert res.confidence >= 0.90
