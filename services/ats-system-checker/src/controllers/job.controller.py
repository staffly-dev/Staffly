"""
Job Controller for ATS System
Handles job posting creation, retrieval, and management
"""

from typing import Optional, List
from fastapi import HTTPException, UploadFile
import httpx

from src.utils.logging_config import get_logger
from src.utils.responses import success_response
from src.models.api_models import JobPostingResponse, ApplicationsListResponse, ApplicationListResponse
from src.services.database_service import DatabaseService
from src.services.evaluation_service import EvaluationService
from src.config.settings import get_settings

logger = get_logger(__name__)
settings = get_settings()


class JobController:
    """Controller for job posting operations"""
    
    def __init__(
        self,
        database_service: DatabaseService,
        evaluation_service: EvaluationService,
    ):
        """
        Initialize job controller
        
        Args:
            database_service: Database service instance
            evaluation_service: Evaluation service instance
        """
        self.database_service = database_service
        self.evaluation_service = evaluation_service
    
    async def create_job_posting(
        self,
        title: str,
        description: str,
        required_skills: str,
        additional_details: Optional[str] = None,
        hr_email: Optional[str] = None,
        hr_name: Optional[str] = None,
        evaluation_threshold: int = 70,
        quiz_required: bool = True,
        quiz_pass_threshold: int = 7
    ) -> JobPostingResponse:
        """
        Create a new job posting and return shareable link
        
        Args:
            title: Job title
            description: Job description
            required_skills: Required skills (comma-separated)
            additional_details: Additional job details
            hr_email: HR contact email
            hr_name: HR contact name
            evaluation_threshold: Minimum CV score for acceptance
            quiz_required: Whether quiz is required for accepted candidates
            quiz_pass_threshold: Minimum quiz score to pass
            
        Returns:
            JobPostingResponse: Job posting details with shareable link
        """
        try:
            logger.info(f" Creating new job posting: {title}")
            
            # Validation
            if not title.strip() or not description.strip() or not required_skills.strip():
                raise HTTPException(
                    status_code=400,
                    detail="Job title, description, and required skills are required"
                )
            
            # Parse required skills
            skills_list = [skill.strip() for skill in required_skills.split(',') if skill.strip()]
            
            # Create job posting
            job_posting = await self.database_service.create_job_posting(
                title=title,
                description=description,
                required_skills=skills_list,
                additional_details=additional_details,
                hr_email=hr_email,
                hr_name=hr_name,
                evaluation_threshold=evaluation_threshold,
                quiz_required=quiz_required,
                quiz_pass_threshold=quiz_pass_threshold
            )
            
            # Generate shareable link
            base_url = settings.FRONTEND_URL or "http://localhost:8000"
            shareable_link = f"{base_url}/apply/{job_posting.job_id}"
            
            logger.info(f" Created job posting with ID: {job_posting.job_id}")
            
            return JobPostingResponse(
                job_id=job_posting.job_id,
                title=job_posting.title,
                description=job_posting.description,
                required_skills=job_posting.required_skills,
                shareable_link=shareable_link,
                created_at=job_posting.created_at,
                is_active=job_posting.is_active
            )
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f" Error creating job posting: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to create job posting: {str(e)}")
    
    async def get_job_posting(self, job_id: str) -> JobPostingResponse:
        """
        Get job posting details by job ID
        
        Args:
            job_id: Job posting ID
            
        Returns:
            JobPostingResponse: Job posting details
        """
        try:
            logger.info(f" Retrieving job posting: {job_id}")
            
            job_posting = await self.database_service.get_job_posting_by_id(job_id)
            
            if not job_posting:
                raise HTTPException(
                    status_code=404,
                    detail="Job posting not found"
                )
            
            if not job_posting.is_active:
                raise HTTPException(
                    status_code=410,
                    detail="This job posting is no longer active"
                )
            
            # Generate shareable link
            base_url = settings.FRONTEND_URL or "http://localhost:8000"
            shareable_link = f"{base_url}/apply/{job_posting.job_id}"
            
            return JobPostingResponse(
                job_id=job_posting.job_id,
                title=job_posting.title,
                description=job_posting.description,
                required_skills=job_posting.required_skills,
                shareable_link=shareable_link,
                created_at=job_posting.created_at,
                is_active=job_posting.is_active
            )
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f" Error retrieving job posting: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to retrieve job posting: {str(e)}")
    
    async def get_all_job_postings(self, include_inactive: bool = False) -> List[JobPostingResponse]:
        """
        Get all job postings
        
        Args:
            include_inactive: Whether to include inactive job postings
            
        Returns:
            List[JobPostingResponse]: List of job postings
        """
        try:
            logger.info(f" Getting all job postings (include_inactive: {include_inactive})")
            
            job_postings = await self.database_service.get_all_job_postings(include_inactive)
            
            response_data = []
            for job in job_postings:
                job_response = JobPostingResponse(
                    job_id=job.job_id,
                    title=job.title,
                    description=job.description,
                    required_skills=job.required_skills,
                    shareable_link=f"{settings.FRONTEND_URL or 'http://localhost:8000'}/apply/{job.job_id}",
                    created_at=job.created_at,
                    is_active=job.is_active
                )
                response_data.append(job_response)
            
            logger.info(f" Successfully retrieved {len(response_data)} job postings")
            return response_data
            
        except Exception as e:
            logger.error(f" Failed to get job postings: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to get job postings: {str(e)}")
    
    async def submit_application(
        self,
        job_id: str,
        cv_file: UploadFile,
        candidate_email: Optional[str] = None,
        candidate_name: Optional[str] = None
    ):
        """
        Submit application for a job posting
        
        Args:
            job_id: Job posting ID
            cv_file: Uploaded CV file
            candidate_email: Candidate email address
            candidate_name: Candidate full name
            
        Returns:
            APIResponse: Application submission confirmation
        """
        try:
            logger.info(f" Processing application for job: {job_id}")
            
            # Get job posting
            job_posting = await self.database_service.get_job_posting_by_id(job_id)
            if not job_posting:
                raise HTTPException(status_code=404, detail="Job posting not found")
            
            if not job_posting.is_active:
                raise HTTPException(status_code=410, detail="This job posting is no longer active")
            
            # Validate file
            if not cv_file or not cv_file.filename or cv_file.filename == '':
                raise HTTPException(status_code=400, detail="Please upload a valid CV file")
            
            if not cv_file.filename.lower().endswith(('.pdf', '.docx')):
                raise HTTPException(status_code=400, detail="CV must be in PDF or DOCX format")
            
            # Read file content
            cv_content = await cv_file.read()
            
            if not cv_content or len(cv_content) < 100:
                raise HTTPException(status_code=400, detail="Uploaded file is empty or too small.")
            
            # Extract text from CV using AI service
            try:
                async with httpx.AsyncClient() as client:
                    files = {'file': (cv_file.filename, cv_content)}
                    ai_url = f"{settings.AI_SERVICE_URL}/extract-text"
                    response = await client.post(ai_url, files=files, timeout=60)
                    try:
                        response.raise_for_status()
                    except httpx.HTTPStatusError as http_exc:
                        logger.error(f"AI service error: {response.text}")
                        raise HTTPException(status_code=500, detail=f"AI service error: {response.text}")
                    data = response.json()
                    cv_text = data.get("text_content", "")
                    extracted_email = data.get("email", None)
                    extracted_name = data.get("name", None)
            except Exception as ai_exc:
                logger.error(f"AI service extract-text error: {ai_exc}")
                raise HTTPException(status_code=500, detail=f"Failed to extract text from CV using AI service: {ai_exc}")
            
            if not cv_text or len(cv_text.strip()) < 50:
                raise HTTPException(
                    status_code=400,
                    detail="Could not extract sufficient text from CV. Please ensure the file is readable."
                )
            
            # Use provided email or extracted email
            final_email = candidate_email or extracted_email or "placeholder@example.com"
            
            # Use provided name or extracted name
            final_name = candidate_name or extracted_name or "Placeholder Candidate"
            
            # SECURITY CHECK: Prevent duplicate applications by email
            if final_email and final_email != "placeholder@example.com":
                existing_application = await self.database_service.check_duplicate_email_application(final_email, job_id)
                if existing_application:
                    raise HTTPException(
                        status_code=409,
                        detail=f"An application with email '{final_email}' has already been submitted for this job posting. Each candidate can only apply once per job."
                    )
            
            # Create application
            application = await self.database_service.create_application(
                job_id=job_id,
                cv_filename=cv_file.filename,
                candidate_email=final_email,
                candidate_name=final_name
            )
            
            logger.info(f" Created application: {application.application_id}")
            
            # Start asynchronous CV evaluation workflow
            try:
                evaluation_result = await self.evaluation_service.evaluate_cv_for_job(
                    cv_text=cv_text,
                    job_posting=job_posting,
                    application_id=application.application_id,
                    candidate_email=final_email,
                    candidate_name=final_name
                )
                
                if evaluation_result:
                    logger.info(f" CV evaluation completed: {evaluation_result.decision}")
                else:
                    logger.warning(" CV evaluation failed but application was recorded")
                
            except Exception as eval_error:
                logger.error(f" CV evaluation error: {eval_error}")
                # Don't fail the application submission if evaluation fails
                await self.database_service.update_application_status(
                    application.application_id, "EVALUATION_FAILED"
                )
            
            # Prepare response
            response_data = {
                "application_id": application.application_id,
                "job_title": job_posting.title,
                "status": "submitted",
                "message": "Your application has been submitted successfully!",
                "next_steps": "Our system is evaluating your CV. You will receive an email with the results shortly."
            }
            
            if evaluation_result:
                response_data.update({
                    "evaluation_score": evaluation_result.score,
                    "evaluation_decision": evaluation_result.decision.value
                })
            
            return success_response(
                message="Application submitted successfully",
                data=response_data
            )
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f" Error processing application: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to process application: {str(e)}") 