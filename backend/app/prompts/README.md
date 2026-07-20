# Prompt Template Storage Conventions

This directory serves as the centralized repository for file-based prompt templates used by Orvixa's AI engine.

## Rules & Conventions

1. **No Prompts in Source Code**: Raw prompts, system instructions, and persona definitions must NEVER be hardcoded inside Python files.
2. **File Format**: Prompts should be written as Markdown (`.md`) or plain text (`.txt`) files.
3. **Variable Substitution**: Use standard Python format strings (`{variable_name}`) for dynamic runtime variables.
4. **Naming Convention**: Use snake_case descriptive filenames (e.g., `pedagogical_tutor.md`, `error_diagnosis.md`).

## Example Usage

```python
from app.core.ai import prompt_loader

formatted_prompt = prompt_loader.load_prompt(
    "pedagogical_tutor.md",
    variables={"student_name": "Alice", "topic": "Calculus"}
)
```
