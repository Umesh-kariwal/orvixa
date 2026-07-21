import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.context.privacy import PIIRedactor, SensitiveFieldFilter
from app.core.context.adapters import AdapterRegistry, GitHubPlatformAdapter, CodeEditorAdapter, GenericWebAdapter
from app.core.context.intent_engine import MultiStageIntentEngine
from app.core.context.action_engine import DynamicActionRecommendationEngine
from app.schemas.context import ConfidenceTier, NormalizedContextSchema, ActiveObjectSchema


@pytest.fixture
def client():
    """FastAPI TestClient fixture."""
    return TestClient(app)


def test_pii_redactor_secrets_and_emails():
    """Test PIIRedactor redacts secret tokens and emails."""
    raw_text = "User email user@domain.com has API token sec_token_1234567890abcdefghijklmnopqrstuvwxyz."
    sanitized, was_redacted = PIIRedactor.sanitize(raw_text)

    assert was_redacted is True
    assert "user@domain.com" not in sanitized
    assert "sec_token_1234567890" not in sanitized
    assert "[REDACTED_EMAIL]" in sanitized
    assert "[REDACTED_API_TOKEN]" in sanitized


def test_sensitive_field_filter():
    """Test SensitiveFieldFilter identifies password and secrets fields."""
    assert SensitiveFieldFilter.is_sensitive("user_password", "password") is True
    assert SensitiveFieldFilter.is_sensitive("auth_otp", "number") is True
    assert SensitiveFieldFilter.is_sensitive("public_username", "text") is False


def test_adapter_registry_resolution():
    """Test AdapterRegistry selects specific adapter without hardcoded if/else."""
    github_adapter = AdapterRegistry.resolve_adapter("github.com")
    assert isinstance(github_adapter, GitHubPlatformAdapter)

    leetcode_adapter = AdapterRegistry.resolve_adapter("leetcode.com")
    assert isinstance(leetcode_adapter, CodeEditorAdapter)

    generic_adapter = AdapterRegistry.resolve_adapter("example.com")
    assert isinstance(generic_adapter, GenericWebAdapter)


def test_multi_stage_intent_engine_code_analysis():
    """Test MultiStageIntentEngine scores code selection accurately."""
    context = NormalizedContextSchema(
        url="https://github.com/org/repo/blob/main/app.py",
        domain="github.com",
        platform_hint="github",
        screen_title="app.py",
        active_object=ActiveObjectSchema(
            object_type="code_snippet",
            content="def add(a, b):\n    return a + b",
        )
    )

    primary_intent, score, tier = MultiStageIntentEngine.analyze_intent(context)

    assert primary_intent == "CODE_ANALYSIS"
    assert score >= 0.85
    assert tier == ConfidenceTier.HIGH


def test_silence_policy_on_low_confidence():
    """Test DynamicActionRecommendationEngine returns empty list when confidence is UNKNOWN/LOW."""
    context = NormalizedContextSchema(
        url="https://example.com",
        domain="example.com",
        screen_title="Blank Page",
    )

    _, _, tier = MultiStageIntentEngine.analyze_intent(context)
    actions = DynamicActionRecommendationEngine.generate_actions(
        primary_intent="PAGE_BROWSING",
        confidence_tier=tier,
        context=context,
    )

    # Silence policy: Zero uninvited actions on low confidence
    assert len(actions) == 0


def test_context_api_endpoint(client):
    """Integration test for POST /api/v1/context/analyze endpoint."""
    payload = {
        "url": "https://github.com/org/repo/pull/42",
        "domain": "github.com",
        "platform_hint": "github",
        "screen_title": "PR #42: Add Context Engine",
        "active_object": {
            "object_type": "code_diff",
            "content": "+ def new_feature():\n+     pass",
        },
        "visible_text_summary": "Pull Request overview text",
        "recent_actions": ["select"]
    }

    response = client.post("/api/v1/context/analyze", json=payload)
    assert response.status_code == 200

    data = response.json()
    assert "confidence_tier" in data
    assert "primary_intent" in data
    assert "recommended_actions" in data
    assert len(data["recommended_actions"]) > 0
    assert data["confidence_tier"] in ["HIGH", "MEDIUM"]
