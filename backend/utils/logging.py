import logging
from typing import Any


class ColoredFormatter(logging.Formatter):
    """
    Custom ANSI colored log formatter for terminal output.
    """

    RESET = "\033[0m"
    RED = "\033[91m"
    BOLD_RED = "\033[1;91m"
    ORANGE = "\033[38;5;208m"
    GREEN = "\033[92m"
    CYAN = "\033[96m"

    def format(self, record: logging.LogRecord) -> str:
        record_copy = logging.makeLogRecord(record.__dict__)
        levelno = record_copy.levelno

        if levelno >= logging.CRITICAL:
            color = self.BOLD_RED
        elif levelno >= logging.ERROR:
            color = self.RED
        elif levelno >= logging.WARNING:
            color = self.ORANGE
        elif levelno >= logging.INFO:
            color = self.GREEN
        elif levelno >= logging.DEBUG:
            color = self.CYAN
        else:
            color = self.RESET

        record_copy.levelname = f"{color}{record_copy.levelname}{self.RESET}"
        return super().format(record_copy)


UVICORN_LOGGING_CONFIG: dict[str, Any] = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "default": {
            "()": ColoredFormatter,
            "fmt": "%(asctime)s [%(levelname)s]  %(filename)s:%(lineno)d  %(message)s",
            "datefmt": "%Y-%m-%d %H:%M:%S",
        },
        "access": {
            "()": ColoredFormatter,
            "fmt": "%(asctime)s [%(levelname)s]  %(filename)s:%(lineno)d  %(message)s",
            "datefmt": "%Y-%m-%d %H:%M:%S",
        },
    },
    "handlers": {
        "default": {
            "formatter": "default",
            "class": "logging.StreamHandler",
            "stream": "ext://sys.stdout",
        },
        "access": {
            "formatter": "access",
            "class": "logging.StreamHandler",
            "stream": "ext://sys.stdout",
        },
    },
    "loggers": {
        "": {"handlers": ["default"], "level": "INFO"},
        "uvicorn": {"handlers": ["default"], "level": "INFO", "propagate": False},
        "uvicorn.error": {"handlers": ["default"], "level": "INFO", "propagate": False},
        "uvicorn.access": {"handlers": ["access"], "level": "INFO", "propagate": False},
    },
}
