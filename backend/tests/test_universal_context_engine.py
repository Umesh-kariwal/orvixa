import pytest
from app.core.context.classifier import ContextClassifier
from app.core.context.cleaner_compressor import ContextCleanerCompressor
from app.core.context.universal_engine import UniversalContextEngine
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_context_classifier_domains():
    c_py = ContextClassifier.classify_context("def binary_search(arr, target):", title="LeetCode 704")
    assert c_py.category == "Programming"
    assert c_py.confidence >= 0.95

    c_math = ContextClassifier.classify_context("Compute the definite integral from 0 to 1")
    assert c_math.category == "Mathematics"

    c_phys = ContextClassifier.classify_context("Calculate the gravitational force and velocity")
    assert c_phys.category == "Physics"


def test_cleaner_compressor_noise_removal():
    raw_text = """
    Learn Binary Search Algorithm.
    Accept All Cookies to continue.
    Binary Search divides a sorted array in half.
    Subscribe to newsletter.
    """
    cleaned, meta = ContextCleanerCompressor.clean_and_compress(raw_text)

    assert "Accept All Cookies" not in cleaned
    assert "Subscribe to newsletter" not in cleaned
    assert "Binary Search" in cleaned
    assert meta.compression_ratio > 0.0


def test_universal_context_engine_privacy_and_pipeline():
    raw_input = "User API Secret: sk-proj-1234567890abcdef. Definite integral of x^2 from 0 to 3."
    ctx = UniversalContextEngine.process_context(
        raw_text=raw_input,
        source_type="page_view",
        page_title="Math Homework",
    )

    assert "sk-proj-" not in ctx.cleaned_content
    assert "[REDACTED_SECRET]" in ctx.extracted_text
    assert ctx.category.category == "Mathematics"
    assert ctx.is_privacy_sanitized is True


def test_api_universal_context_endpoint():
    res = client.post(
        "/api/v1/context/universal",
        json={
            "raw_text": "Write a Python function to solve binary search.",
            "source_type": "selection",
            "page_title": "LeetCode Coding Interview",
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["category"]["category"] == "Programming"
    assert data["source_type"] == "selection"
