"""
Configuration package for ATS System
Centralized configuration management and initialization
"""

from src.config.settings import Settings, get_settings
from src.config.database import init_database, close_database

__all__ = [
    'Settings',
    'get_settings',
    'init_database',
    'close_database'
] 