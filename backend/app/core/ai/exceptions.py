class AIException(Exception):
    """Base exception class for all AI infrastructure errors."""

    def __init__(self, message: str, code: str = "AI_ERROR"):
        super().__init__(message)
        self.message = message
        self.code = code


class AIProviderException(AIException):
    """Raised when an external LLM provider encounters an execution error."""

    def __init__(self, message: str, provider: str, status_code: int = 500):
        super().__init__(message, code="PROVIDER_ERROR")
        self.provider = provider
        self.status_code = status_code


class AIRateLimitException(AIException):
    """Raised when an LLM provider rate limit or quota is exceeded."""

    def __init__(self, message: str, provider: str, retry_after: int = 60):
        super().__init__(message, code="RATE_LIMIT_EXCEEDED")
        self.provider = provider
        self.retry_after = retry_after


class AITokenLimitException(AIException):
    """Raised when prompt input or context length exceeds model limits."""

    def __init__(self, message: str, token_count: int, max_limit: int):
        super().__init__(message, code="TOKEN_LIMIT_EXCEEDED")
        self.token_count = token_count
        self.max_limit = max_limit


class AIPromptNotFoundException(AIException):
    """Raised when a requested file-based prompt template cannot be located."""

    def __init__(self, template_name: str):
        super().__init__(f"Prompt template '{template_name}' not found.", code="PROMPT_NOT_FOUND")
        self.template_name = template_name


class AIProviderNotRegisteredException(AIException):
    """Raised when requesting an LLM provider that has not been registered in ProviderRegistry."""

    def __init__(self, provider_name: str):
        super().__init__(f"Provider '{provider_name}' is not registered in ProviderRegistry.", code="PROVIDER_NOT_REGISTERED")
        self.provider_name = provider_name
