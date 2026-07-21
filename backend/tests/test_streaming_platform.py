import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.ai.base_provider import BaseAIProvider, ProviderCapabilities
from app.core.ai.gemini_provider import GoogleGeminiProvider
from app.core.ai.provider_registry import AIProviderRegistry
from app.core.ai.reliability import CircuitBreaker, CircuitState


@pytest.fixture
def client():
    return TestClient(app)


def test_gemini_provider_capabilities():
    """Test GoogleGeminiProvider returns valid capability metadata."""
    provider = GoogleGeminiProvider()
    capabilities = provider.get_capabilities()

    assert capabilities.supports_streaming is True
    assert capabilities.supports_cancellation is True
    assert capabilities.max_token_limit > 0


def test_provider_registry_resolution():
    """Test AIProviderRegistry resolves provider correctly."""
    provider = AIProviderRegistry.resolve_provider("google_gemini")
    assert isinstance(provider, GoogleGeminiProvider)
    assert provider.provider_name == "google_gemini"


def test_circuit_breaker_transitions():
    """Test CircuitBreaker state transitions from CLOSED to OPEN on threshold reach."""
    circuit = CircuitBreaker(failure_threshold=3, recovery_timeout_sec=10.0)
    assert circuit.state == CircuitState.CLOSED
    assert circuit.allow_request() is True

    circuit.record_failure()
    circuit.record_failure()
    assert circuit.state == CircuitState.CLOSED

    circuit.record_failure()  # Reaches threshold (3)
    assert circuit.state == CircuitState.OPEN
    assert circuit.allow_request() is False


def test_streaming_sse_endpoint(client):
    """Test POST /api/v1/stream/intent endpoint streams SSE chunks."""
    payload = {
        "context_id": "ctx_test_100",
        "intent_id": "intent_test_200",
        "intent_type": "CODE_DIFF_TRACE",
        "prompt_text": "Explain bug in code",
        "provider_hint": "google_gemini",
        "context_payload": {"url": "https://github.com/org/repo/pull/1"}
    }

    response = client.post("/api/v1/stream/intent", json=payload)
    assert response.status_code == 200
    assert "text/event-stream" in response.headers["content-type"]
    assert "data: " in response.text


def test_cancel_stream_endpoint(client):
    """Test POST /api/v1/stream/cancel registers cancellation."""
    payload = {"cancel_id": "ctx_test_100"}
    response = client.post("/api/v1/stream/cancel", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "cancelled"
    assert data["cancel_id"] == "ctx_test_100"
