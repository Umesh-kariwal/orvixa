class DomainException(Exception):
    """Base exception class for all domain-level business rule violations."""

    def __init__(self, message: str, code: str = "DOMAIN_ERROR"):
        super().__init__(message)
        self.message = message
        self.code = code


class InvalidAttemptStateException(DomainException):
    """Raised when an attempt context violates state transition rules."""

    def __init__(self, message: str):
        super().__init__(message, code="INVALID_ATTEMPT_STATE")


class InvalidPedagogicalActionException(DomainException):
    """Raised when an unsupported pedagogical action is requested for a context."""

    def __init__(self, message: str):
        super().__init__(message, code="INVALID_PEDAGOGICAL_ACTION")
