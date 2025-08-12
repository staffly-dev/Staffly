"""
Dependency Injection Utilities for ATS System
FastAPI dependency providers for controllers and services
"""

from fastapi import Request

from ..controllers import HealthController, JobController, QuizController, StatisticsController, ApplicationController, UploadController


def get_health_controller(request: Request) -> HealthController:
    """Get health controller with dependencies"""
    return HealthController(
        database_service=request.app.state.database_service,
        cohere_service=request.app.state.cohere_service,
        email_service=request.app.state.email_service
    )


def get_job_controller(request: Request) -> JobController:
    """Get job controller with dependencies"""
    return JobController(
        database_service=request.app.state.database_service,
        evaluation_service=request.app.state.evaluation_service
    )


def get_quiz_controller(request: Request) -> QuizController:
    """Get quiz controller with dependencies"""
    return QuizController(
        database_service=request.app.state.database_service,
        evaluation_service=request.app.state.evaluation_service
    )


def get_statistics_controller(request: Request) -> StatisticsController:
    """Get statistics controller with dependencies"""
    return StatisticsController(
        database_service=request.app.state.database_service
    )


def get_application_controller(request: Request) -> ApplicationController:
    """Get application controller with dependencies"""
    return ApplicationController(
        database_service=request.app.state.database_service
    )


def get_upload_controller(request: Request) -> UploadController:
    """Get upload controller with dependencies"""
    return UploadController()


# Legacy dependency for backward compatibility
def get_evaluation_service(request: Request):
    """Get evaluation service (legacy dependency)"""
    return request.app.state.evaluation_service 