import asyncio
import time
from enum import Enum
from typing import Callable, TypeVar

T = TypeVar("T")


class CircuitState(str, Enum):
    CLOSED = "CLOSED"      # Normal operation
    OPEN = "OPEN"          # Provider failing, fast fail active
    HALF_OPEN = "HALF_OPEN"# Testing recovery


class CircuitBreaker:
    """Production Circuit Breaker for AI Providers.

    Protects system from cascading failures if an AI provider drops or experiences high error rate.
    """

    def __init__(self, failure_threshold: int = 5, recovery_timeout_sec: float = 30.0):
        self.failure_threshold = failure_threshold
        self.recovery_timeout_sec = recovery_timeout_sec
        self.state = CircuitState.CLOSED
        self.failure_count = 0
        self.last_failure_time = 0.0

    def record_success(self):
        self.failure_count = 0
        self.state = CircuitState.CLOSED

    def record_failure(self):
        self.failure_count += 1
        self.last_failure_time = time.time()
        if self.failure_count >= self.failure_threshold:
            self.state = CircuitState.OPEN

    def allow_request(self) -> bool:
        if self.state == CircuitState.CLOSED:
            return True

        if self.state == CircuitState.OPEN:
            if time.time() - self.last_failure_time > self.recovery_timeout_sec:
                self.state = CircuitState.HALF_OPEN
                return True
            return False

        if self.state == CircuitState.HALF_OPEN:
            return True

        return False


class RetryPolicy:
    """Exponential backoff with jitter retry strategy."""

    @classmethod
    async def execute_with_retry(
        cls,
        func: Callable[[], T],
        max_retries: int = 3,
        base_delay_sec: float = 0.5,
    ) -> T:
        for attempt in range(max_retries):
            try:
                return await func()
            except Exception as err:
                if attempt == max_retries - 1:
                    raise err
                delay = base_delay_sec * (2 ** attempt)
                await asyncio.sleep(delay)
        raise RuntimeError("Retry limit reached")
