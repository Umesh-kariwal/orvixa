from pathlib import Path
from typing import Any, Dict, Optional
from app.core.ai.exceptions import AIPromptNotFoundException


class PromptLoader:
    """Service responsible for loading and formatting file-based prompt templates."""

    def __init__(self, prompts_dir: Optional[Path] = None) -> None:
        if prompts_dir is None:
            # Default prompts directory relative to application root
            prompts_dir = Path(__file__).resolve().parent.parent.parent / "prompts"
        self.prompts_dir = prompts_dir

    def load_prompt(self, template_name: str, variables: Optional[Dict[str, Any]] = None) -> str:
        """Loads a prompt file from the prompts directory and formats variables.

        Args:
            template_name: Relative path or filename of prompt template (e.g. 'system_instruction.md').
            variables: Key-value substitutions for template formatting.

        Returns:
            str: Evaluated prompt string.

        Raises:
            AIPromptNotFoundException: If the requested file does not exist.
        """
        file_path = self.prompts_dir / template_name
        if not file_path.exists() or not file_path.is_file():
            raise AIPromptNotFoundException(template_name=template_name)

        content = file_path.read_text(encoding="utf-8")
        if variables:
            return content.format(**variables)
        return content


# Default PromptLoader instance
prompt_loader = PromptLoader()
