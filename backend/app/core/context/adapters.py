from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional
from app.schemas.context import ActiveObjectSchema, NormalizedContextSchema


class BasePlatformAdapter(ABC):
    """Abstract Base Class for all Platform Adapters.

    Translates raw platform metadata into a standardized NormalizedContextSchema.
    """

    @property
    @abstractmethod
    def platform_key(self) -> str:
        """Unique key identifying the adapter."""
        pass

    @abstractmethod
    def matches(self, domain: str, platform_hint: Optional[str] = None) -> bool:
        """Evaluates if this adapter matches the domain or hint."""
        pass

    @abstractmethod
    def normalize(self, raw_payload: Dict[str, Any]) -> NormalizedContextSchema:
        """Normalizes raw platform payload into standard NormalizedContextSchema."""
        pass


class GenericWebAdapter(BasePlatformAdapter):
    """Default adapter for arbitrary web pages."""

    @property
    def platform_key(self) -> str:
        return "generic"

    def matches(self, domain: str, platform_hint: Optional[str] = None) -> bool:
        return True  # Fallback adapter

    def normalize(self, raw_payload: Dict[str, Any]) -> NormalizedContextSchema:
        url = raw_payload.get("url", "https://unknown")
        domain = raw_payload.get("domain", "unknown")
        title = raw_payload.get("screen_title", "Web Page")
        active_obj = raw_payload.get("active_object")

        active_schema = None
        if active_obj and isinstance(active_obj, dict):
            active_schema = ActiveObjectSchema(
                object_type=active_obj.get("object_type", "text_selection"),
                content=active_obj.get("content"),
                metadata=active_obj.get("metadata", {}),
                is_sensitive=active_obj.get("is_sensitive", False),
            )

        return NormalizedContextSchema(
            url=url,
            domain=domain,
            platform_hint=self.platform_key,
            screen_title=title,
            active_object=active_schema,
            visible_text_summary=raw_payload.get("visible_text_summary"),
            recent_actions=raw_payload.get("recent_actions", []),
        )


class GitHubPlatformAdapter(BasePlatformAdapter):
    """Platform adapter for GitHub (Pull Requests, Issues, Code Diffs)."""

    @property
    def platform_key(self) -> str:
        return "github"

    def matches(self, domain: str, platform_hint: Optional[str] = None) -> bool:
        return "github.com" in domain.lower() or platform_hint == "github"

    def normalize(self, raw_payload: Dict[str, Any]) -> NormalizedContextSchema:
        base = GenericWebAdapter().normalize(raw_payload)
        base.platform_hint = self.platform_key
        
        # Enhance metadata if code diff or issue is detected
        if base.active_object and "diff" in base.url:
            base.active_object.object_type = "code_diff"
            base.active_object.metadata["is_git_diff"] = True

        return base


class CodeEditorAdapter(BasePlatformAdapter):
    """Platform adapter for Code Editors (VS Code Web, LeetCode, Monaco)."""

    @property
    def platform_key(self) -> str:
        return "code_editor"

    def matches(self, domain: str, platform_hint: Optional[str] = None) -> bool:
        return (
            "leetcode.com" in domain.lower()
            or "vscode.dev" in domain.lower()
            or platform_hint == "code_editor"
        )

    def normalize(self, raw_payload: Dict[str, Any]) -> NormalizedContextSchema:
        base = GenericWebAdapter().normalize(raw_payload)
        base.platform_hint = self.platform_key
        if base.active_object:
            base.active_object.object_type = "code_snippet"
        return base


class AdapterRegistry:
    """Dynamic Adapter Registry discovering and resolving platform adapters without hardcoded if/else branching."""

    _adapters: List[BasePlatformAdapter] = [
        GitHubPlatformAdapter(),
        CodeEditorAdapter(),
    ]
    _fallback_adapter: BasePlatformAdapter = GenericWebAdapter()

    @classmethod
    def resolve_adapter(cls, domain: str, platform_hint: Optional[str] = None) -> BasePlatformAdapter:
        """Finds matching adapter or returns fallback GenericWebAdapter."""
        for adapter in cls._adapters:
            if adapter.matches(domain=domain, platform_hint=platform_hint):
                return adapter
        return cls._fallback_adapter
