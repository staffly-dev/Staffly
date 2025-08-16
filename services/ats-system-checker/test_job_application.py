#!/usr/bin/env python3
"""
Test script for job application endpoint
This script tests the job application functionality to ensure file uploads work correctly.
"""

import requests
import os
import sys
from pathlib import Path

# Add the src directory to the path for imports
sys.path.append(str(Path(__file__).parent / "src"))

def test_job_application():
    """Test the job application endpoint"""
    
    # Test URL - adjust this based on your setup
    base_url = "http://localhost:4000"  # Local development
    # base_url = "https://ats-system-checker-backend-production.up.railway.app"  # Production
    
    # Test endpoint
    endpoint = f"{base_url}/ats-checker/jobs"
    
    print(f"Testing job application endpoint: {endpoint}")
    
    # First, create a test job posting
    print("\n1. Creating test job posting...")
    job_data = {
        "title": "Test Software Engineer",
        "description": "Test job description for testing purposes",
        "required_skills": "Python, FastAPI, Testing",
        "additional_details": "This is a test job posting",
        "hr_email": "test@example.com",
        "hr_name": "Test HR",
        "evaluation_threshold": 70,
        "quiz_required": False,
        "quiz_pass_threshold": 7
    }
    
    try:
        # Create job posting
        response = requests.post(f"{endpoint}", data=job_data)
        print(f"Job creation response: {response.status_code}")
        
        if response.status_code == 200:
            job_info = response.json()
            job_id = job_info.get("job_id")
            print(f"Test job created with ID: {job_id}")
            
            # Now test the application endpoint
            print(f"\n2. Testing job application for job ID: {job_id}")
            
            # Create a test PDF file
            test_pdf_path = "test_cv.pdf"
            with open(test_pdf_path, "wb") as f:
                # Create a minimal PDF file
                f.write(b"%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000111 00000 n \ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n149\n%%EOF\n")
            
            # Test file upload
            application_data = {
                "candidate_email": "test@example.com",
                "candidate_name": "Test Candidate"
            }
            
            files = {
                "cv_file": ("test_cv.pdf", open(test_pdf_path, "rb"), "application/pdf")
            }
            
            apply_url = f"{endpoint}/{job_id}/apply"
            print(f"Submitting application to: {apply_url}")
            
            response = requests.post(apply_url, data=application_data, files=files)
            print(f"Application response: {response.status_code}")
            print(f"Response content: {response.text}")
            
            # Clean up test file
            if os.path.exists(test_pdf_path):
                os.remove(test_pdf_path)
                
        else:
            print(f"Failed to create test job: {response.text}")
            
    except Exception as e:
        print(f"Error testing job application: {e}")
        print(f"Make sure the server is running and accessible at {base_url}")

if __name__ == "__main__":
    test_job_application()
