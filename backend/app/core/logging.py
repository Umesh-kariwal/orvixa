import logging
import sys
from app.core.config import settings


def setup_logging() -> logging.Logger:
    """Configures structured stream logging for the application."""
    log_level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)
    
    formatter = logging.Formatter(
        fmt="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%Y-%m-%dT%H:%M:%SZ",
    )

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(formatter)

    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)
    
    # Avoid duplicate handlers on re-initialization
    if not root_logger.handlers:
        root_logger.addHandler(handler)

    logger = logging.getLogger("orvixa")
    logger.setLevel(log_level)
    
    return logger


logger = setup_logging()
