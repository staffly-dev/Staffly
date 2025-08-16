"""
Job Controller for ATS System
Handles job posting creation, retrieval, and management
"""

from typing import Optional, List
from datetime import datetime
from fastapi import HTTPException, UploadFile
import httpx
import os
import uuid

from src.utils.logging_config import get_logger
from src.utils.responses import success_response
from src.models.api_models import JobPostingResponse, ApplicationsListResponse, ApplicationListResponse
from src.services.database_service import DatabaseService
from src.services.evaluation_service import EvaluationService
from src.services.s3_service import S3Service
from src.config.settings import get_settings

logger = get_logger(__name__)
settings = get_settings()


class JobController:
    """Controller for job posting operations"""
    
    def __init__(
        self,
        database_service: DatabaseService,
        evaluation_service: EvaluationService,
        s3_service: S3Service,
    ):
        """
        Initialize job controller
        
        Args:
            database_service: Database service instance
            evaluation_service: Evaluation service instance
            s3_service: S3 service instance
        """
        self.database_service = database_service
        self.evaluation_service = evaluation_service
        self.s3_service = s3_service
        
        # Debug: Log S3 service status on initialization
        logger.info(f"JobController initialized with S3 service: {self.s3_service.is_configured()}")
        logger.info(f"S3 bucket: {self.s3_service.bucket_name}")
        logger.info(f"S3 client ready: {self.s3_service.s3_client is not None}")
    
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
            base_url = settings.get_frontend_url()
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
            base_url = settings.get_frontend_url()
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
                    shareable_link=f"{settings.get_frontend_url()}/apply/{job.job_id}",
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
        candidate_email: str,
        candidate_name: str
    ):
        """
        Submit application for a job posting
        
        Args:
            job_id: Job posting ID
            cv_file: Uploaded CV file
            candidate_email: Candidate email address (required)
            candidate_name: Candidate full name (required)
            
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
            
            # SECURITY CHECK: Prevent duplicate applications by email
            existing_application = await self.database_service.check_duplicate_email_application(candidate_email, job_id)
            if existing_application:
                raise HTTPException(
                    status_code=409,
                    detail=f"An application with email '{candidate_email}' has already been submitted for this job posting. Each candidate can only apply once per job."
                )
            
            # Try to upload file to S3, fallback to local storage if S3 fails
            cv_content = None
            use_local_storage = False
            file_url = None
            s3_key = None
            
            # Debug: Check S3 service status
            logger.info(f"S3 service configured: {self.s3_service.is_configured()}")
            logger.info(f"S3 service client ready: {self.s3_service.s3_client is not None}")
            logger.info(f"S3 bucket name: {self.s3_service.bucket_name}")
            logger.info(f"S3 region: {self.s3_service.region}")
            
            try:
                if self.s3_service.is_configured():
                    logger.info("S3 service is configured, attempting S3 upload...")
                    try:
                        logger.info("About to call S3 upload_file method...")
                        s3_result = await self.s3_service.upload_file(cv_file)
                        logger.info(f"S3 upload successful! Result: {s3_result}")
                        file_url = s3_result['file_url']
                        s3_key = s3_result['s3_key']
                        # Read file content for AI processing after S3 upload
                        await cv_file.seek(0)
                        cv_content = await cv_file.read()
                        logger.info(f"File successfully uploaded to S3: {file_url}")
                        logger.info(f"S3 key: {s3_key}")
                        logger.info(f"File URL to be stored: {file_url}")
                        # Skip local storage logic since S3 upload succeeded
                        use_local_storage = False
                        logger.info("S3 upload completed successfully, skipping local storage")
                    except HTTPException as s3_error:
                        logger.warning(f"S3 upload failed with HTTPException: {s3_error.detail}, falling back to local storage")
                        use_local_storage = True
                        await cv_file.seek(0)  # Reset file position for local storage
                    except Exception as s3_error:
                        logger.warning(f"S3 upload failed with Exception: {str(s3_error)}, falling back to local storage")
                        logger.warning(f"Exception type: {type(s3_error)}")
                        logger.warning(f"Exception details: {s3_error}")
                        use_local_storage = True
                        await cv_file.seek(0)  # Reset file position for local storage
                else:
                    logger.warning("S3 not configured, using local storage")
                    use_local_storage = True
                
                # Only execute local storage logic if S3 failed or wasn't configured
                if use_local_storage:
                    # Fallback to local storage
                    logger.info("Using local storage for file upload")
                    
                    # Validate file has a name
                    if not cv_file.filename:
                        raise HTTPException(status_code=400, detail="File must have a filename")
                    
                    # Generate unique filename
                    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                    unique_id = str(uuid.uuid4())[:8]
                    file_extension = os.path.splitext(cv_file.filename)[1].lower()
                    
                    # Ensure we have a valid extension
                    if not file_extension:
                        file_extension = '.pdf'  # Default to PDF if no extension
                    
                    unique_filename = f"cv_{timestamp}_{unique_id}{file_extension}"
                    
                    # Save to local uploads directory
                    upload_path = os.path.join(settings.UPLOAD_FOLDER, unique_filename)
                    
                    # Ensure directory exists
                    try:
                        os.makedirs(settings.UPLOAD_FOLDER, exist_ok=True)
                        logger.info(f"Created/verified upload directory: {settings.UPLOAD_FOLDER}")
                    except Exception as dir_error:
                        logger.error(f"Failed to create upload directory: {dir_error}")
                        raise HTTPException(status_code=500, detail=f"Failed to create upload directory: {str(dir_error)}")
                    
                    # Read file content for both saving and AI processing
                    try:
                        cv_content = await cv_file.read()
                        if not cv_content:
                            raise HTTPException(status_code=400, detail="File is empty")
                        
                        with open(upload_path, 'wb') as f:
                            f.write(cv_content)
                        
                        logger.info(f"File saved locally: {upload_path} ({len(cv_content)} bytes)")
                    except Exception as write_error:
                        logger.error(f"Failed to write file: {write_error}")
                        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(write_error)}")
                    
                    # For local storage, construct the full URL
                    file_url = f"{settings.UPLOADS_BASE_URL}/uploads/{unique_filename}"
                    s3_key = unique_filename
                    
                    logger.info(f"File uploaded successfully to local storage: {unique_filename}")
            except Exception as upload_error:
                logger.error(f"File upload failed: {upload_error}")
                raise HTTPException(
                    status_code=500, 
                    detail=f"File upload failed: {str(upload_error)}"
                )
            
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
                    extracted_name = data.get("name", None)
            except Exception as ai_exc:
                logger.error(f"AI service extract-text error: {ai_exc}")
                raise HTTPException(status_code=500, detail=f"Failed to extract text from CV using AI service: {ai_exc}")
            
            if not cv_text or len(cv_text.strip()) < 50:
                raise HTTPException(
                    status_code=400,
                    detail="Could not extract sufficient text from CV. Please ensure the file is readable."
                )
            
            # Use provided name or extracted name as fallback
            final_name = candidate_name or extracted_name or "Unknown Candidate"
            
            # Create application with S3 file URL
            logger.info(f"Creating application with file_url: {file_url}")
            logger.info(f"Creating application with s3_key: {s3_key}")
            
            application = await self.database_service.create_application(
                job_id=job_id,
                cv_filename=file_url,  # Store the full URL (S3 or local)
                candidate_email=candidate_email,
                candidate_name=final_name
            )
            
            logger.info(f" Created application: {application.application_id}")
            
            # Start asynchronous CV evaluation workflow
            try:
                evaluation_result = await self.evaluation_service.evaluate_cv_for_job(
                    cv_text=cv_text,
                    job_posting=job_posting,
                    application_id=application.application_id,
                    candidate_email=candidate_email,
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
    
    async def delete_job_posting(self, job_id: str):
        """
        Delete a job posting and all its associated applications
        
        Args:
            job_id: Job posting ID to delete
            
        Returns:
            APIResponse: Deletion confirmation
        """
        try:
            logger.info(f" Deleting job posting: {job_id}")
            
            # Check if job posting exists
            job_posting = await self.database_service.get_job_posting_by_id(job_id)
            if not job_posting:
                raise HTTPException(
                    status_code=404,
                    detail="Job posting not found"
                )
            
            # Delete job posting and associated applications
            success = await self.database_service.delete_job_posting(job_id)
            
            if not success:
                raise HTTPException(
                    status_code=500,
                    detail="Failed to delete job posting"
                )
            
            logger.info(f" Successfully deleted job posting: {job_id}")
            
            return success_response(
                message="Job posting deleted successfully",
                data={
                    "job_id": job_id,
                    "title": job_posting.title,
                    "deleted_at": datetime.now().isoformat()
                }
            )
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f" Error deleting job posting: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to delete job posting: {str(e)}") 