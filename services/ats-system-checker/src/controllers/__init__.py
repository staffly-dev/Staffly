"""
Controllers package for ATS System Server
Route handlers and business logic
"""

import sys
import os
from importlib import import_module
from importlib.util import spec_from_file_location, module_from_spec

# Get the current directory (controllers package directory)
controllers_dir = os.path.dirname(__file__)

def load_controller_from_file(filename, class_name):
    """Load a controller class from a file with dots in the name"""
    file_path = os.path.join(controllers_dir, filename)
    spec = spec_from_file_location(f"controller_{class_name.lower()}", file_path)
    module = module_from_spec(spec)
    spec.loader.exec_module(module)
    return getattr(module, class_name)

# Load controllers from files with dots in their names
HealthController = load_controller_from_file('health.controller.py', 'HealthController')
JobController = load_controller_from_file('job.controller.py', 'JobController')
QuizController = load_controller_from_file('quiz.controller.py', 'QuizController')
StatisticsController = load_controller_from_file('statistics.controller.py', 'StatisticsController')
ApplicationController = load_controller_from_file('application.controller.py', 'ApplicationController')
AWS_S3Controller = load_controller_from_file('aws_s3.controller.py', 'AWS_S3Controller')

__all__ = [
    'HealthController',
    'JobController',
    'QuizController',
    'StatisticsController',
    'ApplicationController',
    'AWS_S3Controller'
] 