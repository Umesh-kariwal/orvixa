import pytest
from app.core.learning.intent_detector import IntentDetector


def test_intent_detector_explain():
    intent = IntentDetector.detect_intent("Explain Binary Search in Python")
    assert intent.intent_mode == "Explain"
    assert intent.domain == "programming"


def test_intent_detector_hint():
    intent = IntentDetector.detect_intent("Give me a hint for this physics problem")
    assert intent.intent_mode == "Hint"
    assert intent.domain == "physics"


def test_intent_detector_interview():
    intent = IntentDetector.detect_intent("Mock interview for senior software engineer")
    assert intent.intent_mode == "Interview"


def test_intent_detector_answer():
    intent = IntentDetector.detect_intent("Solve for x: 2x + 4 = 10")
    assert intent.intent_mode == "Answer"
