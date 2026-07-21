import pytest
from app.core.learning.intent_detector import IntentDetector
from app.core.learning.prompt_builder import LearningPromptBuilder


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


def test_prompt_builder_history_and_context():
    context = {
        "page_title": "LeetCode 704",
        "url": "https://leetcode.com/problems/binary-search/",
        "cleaned_content": "Binary Search problem statement",
    }
    history = [
        {"role": "user", "text": "What is the time complexity?"},
        {"role": "assistant", "text": "The time complexity is O(log N)."},
    ]
    prompt = LearningPromptBuilder.build_prompt(
        context_payload=context,
        intent_mode="Explain",
        domain="programming",
        conversation_history=history,
        user_question="Why is it O(log N)?",
    )

    assert "LeetCode 704" in prompt
    assert "Learner: What is the time complexity?" in prompt
    assert "Copilot: The time complexity is O(log N)." in prompt
    assert "Learner (Current Query): Why is it O(log N)?" in prompt
