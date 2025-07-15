"""
Route Registration for ATS System
"""

from fastapi import APIRouter
import importlib.util
import os

# Create main API router
api_router = APIRouter()

# Get the current directory
routes_dir = os.path.dirname(__file__)

# List of route files to load
route_files = [
    'health.routes.py',
    'jobs.routes.py', 
    'quiz.routes.py',
    'statistics.routes.py',
    'applications.routes.py'
]

# Load each route module and include its router
for route_file in route_files:
    try:
        # Create module name from filename
        module_name = route_file.replace('.py', '').replace('.', '_')
        file_path = os.path.join(routes_dir, route_file)
        
        # Check if file exists
        if not os.path.exists(file_path):
            continue
        
        # Load the module
        spec = importlib.util.spec_from_file_location(module_name, file_path)
        if spec and spec.loader:
            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)
            
            # Include the router if it exists
            if hasattr(module, 'router'):
                api_router.include_router(module.router)
    except Exception:
        # Silently skip problematic modules
        continue

__all__ = ["api_router"] 