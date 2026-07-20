class ApplicationException(Exception):
    """Base exception for all application layer orchestration errors."""

    def __init__(self, message: str, code: str = "APPLICATION_ERROR"):
        super().__init__(message)
        self.message = message
        self.code = code


class UseCaseExecutionException(ApplicationException):
    """Raised when an application use case encounters an unresolvable execution error."""

    def __init__(self, use_case_name: str, reason: str):
        super().__init__(
            f"Use case '{use_case_name}' failed to execute: {reason}",
            code="USE_CASE_EXECUTION_FAILED",
        )
        self.use_case_name = use_case_name


class NotFoundApplicationException(ApplicationException):
    """Raised when an application query fails to locate a target resource."""

    def __init__(self, resource_name: str, resource_id: str):
        super().__init__(
            f"Resource '{resource_name}' with ID '{resource_id}' was not found.",
            code="RESOURCE_NOT_FOUND",
        )
        self.resource_name = resource_name
        self.resource_id = resource_id
