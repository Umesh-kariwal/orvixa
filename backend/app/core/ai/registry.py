from typing import Callable, Dict, List
from app.core.ai.exceptions import AIProviderNotRegisteredException
from app.core.ai.interfaces import BaseLLMProvider


class ProviderRegistry:
    """Thread-safe registry for registering and instantiating LLM providers."""

    def __init__(self) -> None:
        self._factories: Dict[str, Callable[[], BaseLLMProvider]] = {}

    def register(self, name: str, factory: Callable[[], BaseLLMProvider]) -> None:
        """Registers a provider factory function associated with a provider name.

        Args:
            name: Provider name key (e.g., 'gemini', 'openai').
            factory: Callable producing a BaseLLMProvider instance.
        """
        self._factories[name.lower()] = factory

    def get(self, name: str) -> BaseLLMProvider:
        """Retrieves and instantiates a registered LLM provider by name.

        Args:
            name: Registered provider name key.

        Returns:
            BaseLLMProvider instance.

        Raises:
            AIProviderNotRegisteredException: If provider name is not registered.
        """
        key = name.lower()
        if key not in self._factories:
            raise AIProviderNotRegisteredException(provider_name=name)
        return self._factories[key]()

    def list_providers(self) -> List[str]:
        """Returns a list of all currently registered provider names."""
        return list(self._factories.keys())


# Singleton instance of ProviderRegistry for global use
provider_registry = ProviderRegistry()
