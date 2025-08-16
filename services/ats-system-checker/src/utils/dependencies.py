"""
Dependency Injection Utilities for ATS System
FastAPI dependency providers for controllers and services
"""

from fastapi import Request

from ..controllers import HealthController, JobController, QuizController, StatisticsController, ApplicationController, AWS_S3Controller


def get_health_controller(request: Request) -> HealthController:
    """Get health controller with dependencies"""
    # Get cohere service if available, otherwise pass None
    cohere_service = getattr(request.app.state, 'cohere_service', None)
    
    return HealthController(
        database_service=request.app.state.database_service,
        cohere_service=cohere_service,
        email_service=request.app.state.email_service
    )


def get_job_controller(request: Request) -> JobController:
    """Get job controller with dependencies"""
    return JobController(
        database_service=request.app.state.database_service,
        evaluation_service=request.app.state.evaluation_service,
        s3_service=request.app.state.s3_service
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


def get_aws_s3_controller(request: Request) -> AWS_S3Controller:
    """Get AWS S3 controller with dependencies"""
    return AWS_S3Controller()


# Legacy dependency for backward compatibility
def get_evaluation_service(request: Request):
    """Get evaluation service (legacy dependency)"""
    return request.app.state.evaluation_service 