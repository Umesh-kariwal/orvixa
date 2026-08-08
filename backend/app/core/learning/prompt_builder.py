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
                f"- FORMATTING & STYLE STRENGTH: Never use lazy, repetitive list patterns (like an endless sequence of dashes '- item' followed by single sentences). Avoid raw dash separators. Write in rich, fluid, well-structured paragraphs with bold inline keypoints. Use numbers (1., 2.) or emojis (🎯, 🔍, 💡) for list items.\n"
                f"- Speak to the learner directly. Keep explanations clean, concise, and targeted. Conclude every response with a warm, supportive pedagogical summary; never terminate abruptly.\n"
                f"- DYNAMIC LENGTH ADAPTATION: Match your response length and depth to the user's message. If the user's query is very short or simple, keep your response short, direct, and focused.\n"
                f"- VISUAL DIAGRAMS AND SCHEMATICS: If explaining any scientific, technical, mechanical, medical, biological, historical, or visual concept, ALWAYS embed 1 to 3 high-quality, compact educational illustrations/diagrams from Pollinations AI using Markdown image syntax: `![Diagram Title](https://image.pollinations.ai/prompt/highly_detailed_educational_illustration_of_subject_labeled_clear_schematic?width=800&height=600&nologo=true&private=true&model=flux)`. Use a clear, scientific descriptive prompt.\n"
                f"- CREATIVE ASCII ART & GRAPHICS: Use text-based graphs or ASCII flowcharts (e.g. `[Concept A] ──> [Process] ──> [Result]`) to illustrate connections and map processes with precision.\n"
                f"- FORMATTING COMPONENT DIVERSITY: Use emojis, bold text callouts, side-by-side comparison tables, and visual Mermaid JS flowcharts (inside ```mermaid code blocks) to show sequence workflows. Do not output plain text blocks.\n"
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
