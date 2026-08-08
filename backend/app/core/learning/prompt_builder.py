from typing import List, Dict, Any, Optional


class LearningPromptBuilder:
    """Builds token-efficient, highly structured prompts for the learning engine."""

    @classmethod
    def build_prompt(
        cls,
        context_payload: Dict[str, Any],
        intent_mode: str,
        domain: str,
        conversation_history: List[Dict[str, str]],
        user_question: str,
    ) -> str:
        # 1. System Context & Constraints
        if intent_mode.lower() == "voicechat":
            system_instructions = (
                "You are Orvixa, the Universal AI Learning Copilot. You are in real-time voice conversation mode with the learner.\n"
                "Pedagogical Rules:\n"
                "- Respond in ONLY 1 or 2 short sentences. Be extremely concise.\n"
                "- Do NOT use markdown, headings, lists, bold text, or stars (e.g. absolutely no '*', '###', '1.', or '**' in your response).\n"
                "- Output pure conversational text that is natural and easy to read aloud.\n"
                "- Speak directly to the learner. Respond in the same language the user spoke (Hindi or English).\n"
            )
        else:
            system_instructions = (
                f"You are Orvixa, the Universal AI Learning & Interview Copilot.\n"
                f"Active Subject/Domain: {domain.upper()}\n"
                f"Learner Intent Mode: {intent_mode.upper()}\n\n"
                f"Pedagogical Rules:\n"
                f"- Guide the learner with Socratic insights. Do not give away answers instantly if intent is 'Hint'.\n"
                f"- Avoid long paragraphs. Format output using structured markdown headers (e.g. ### Concept, ### Formula, ### Common Mistakes) representing Adaptive Learning Cards.\n"
                f"- Speak to the learner directly. Keep explanations clean, concise, and targeted.\n"
                f"- DYNAMIC LENGTH ADAPTATION: Match your response length and depth to the user's message. If the user's query is very short or simple, keep your response short, direct, and focused. If the user's query is long, detailed, or complex, provide a comprehensive, multi-section breakdown.\n"
            )

        # 2. Extract and format active screen/selection context
        page_title = context_payload.get("page_title", "Unknown Page")
        url = context_payload.get("url", "")
        cleaned_content = context_payload.get("cleaned_content", "") or context_payload.get("raw_text", "")

        context_block = ""
        if cleaned_content:
            context_block = (
                f"--- LEARNING ENVIRONMENT CONTEXT ---\n"
                f"Page Title: {page_title}\n"
                f"URL: {url}\n"
                f"Selected Content:\n"
                f"\"\"\"\n{cleaned_content}\n\"\"\"\n\n"
            )

        # 3. Format Conversation History (Short-term memory)
        history_block = ""
        if conversation_history:
            history_block = "--- CONVERSATION HISTORY ---\n"
            for msg in conversation_history:
                role = "Learner" if msg.get("role") == "user" else "Copilot"
                text = msg.get("text", "")
                history_block += f"{role}: {text}\n"
            history_block += "\n"

        # 4. Combine into final prompt
        final_prompt = (
            f"{system_instructions}\n"
            f"{context_block}"
            f"{history_block}"
            f"Learner (Current Query): {user_question}\n"
            f"Copilot: "
        )

        return final_prompt
