"""
Logging Configuration Utilities for ATS System
"""

import logging
import os
from typing import Dict


def setup_logging(log_level: str = "INFO", log_file: str = "ats_system.log") -> None:
    """
    Setup logging configuration for the application
    
    Args:
        log_level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_file: Log file path
    """
    # Log level mapping
    LOG_LEVELS: Dict[str, int] = {
        'DEBUG': logging.DEBUG,
        'INFO': logging.INFO, 
        'WARNING': logging.WARNING,
        'ERROR': logging.ERROR,
        'CRITICAL': logging.CRITICAL
    }
    
    # Get log level, default to INFO if invalid
    level = LOG_LEVELS.get(log_level.upper(), logging.INFO)
    
    # Create logs directory if it doesn't exist
    log_dir = os.path.dirname(log_file) if os.path.dirname(log_file) else "."
    if log_dir != "." and not os.path.exists(log_dir):
        os.makedirs(log_dir, exist_ok=True)
    
    # Configure logging
    logging.basicConfig(
        level=level,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler(log_file, encoding='utf-8'),
            logging.StreamHandler()
        ]
    )
    
    # Set specific logger levels
    logging.getLogger("uvicorn").setLevel(logging.WARNING)
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    
    logger = logging.getLogger(__name__)
    logger.info(f" Logging configured - Level: {log_level}, File: {log_file}")


def get_logger(name: str) -> logging.Logger:
    """
    Get a logger instance for a specific module
    
    Args:
        name: Logger name (usually __name__)
        
    Returns:
        logging.Logger: Configured logger instance
    """
    return logging.getLogger(name) 