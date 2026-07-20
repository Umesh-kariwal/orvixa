from abc import ABC, abstractmethod
from typing import Generic, TypeVar

InputDTO = TypeVar("InputDTO")
OutputDTO = TypeVar("OutputDTO")


class BaseUseCase(ABC, Generic[InputDTO, OutputDTO]):
    """Abstract Base Class defining the contract for all application use cases."""

    @abstractmethod
    async def execute(self, input_dto: InputDTO) -> OutputDTO:
        """Executes the application use case with input parameters.

        Args:
            input_dto: Standardized input command or query DTO.

        Returns:
            OutputDTO: Standardized output result DTO.
        """
        pass
