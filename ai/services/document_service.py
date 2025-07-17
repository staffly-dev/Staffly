"""
Document Processing Service for ATS System
Handles text extraction from PDF and DOCX files
"""

import os
import re
import logging
import tempfile
from typing import Optional
from datetime import datetime
from io import BytesIO
from pathlib import Path
import docx2txt
import PyPDF2 as pdf

logger = logging.getLogger(__name__)


class DocumentProcessingService:
    """Service for processing CV documents and extracting text"""
    
    def __init__(self, upload_folder: str = "uploads"):
        """Initialize document processing service"""
        from pathlib import Path
        self.upload_folder = str(Path(upload_folder))  # Store as string for compatibility
        self.allowed_extensions = {'pdf', 'docx'}
        os.makedirs(upload_folder, exist_ok=True)
    
    def is_allowed_file(self, filename: str) -> bool:
        """Check if file extension is allowed"""
        return '.' in filename and filename.rsplit('.', 1)[1].lower() in self.allowed_extensions
    
    def _extract_text_from_file_sync(self, file_content: bytes, filename: str) -> Optional[str]:
        """
        Extract text from file based on its extension (sync version)
        
        Args:
            file_content (bytes): File content as bytes
            filename (str): Original filename with extension
            
        Returns:
            Optional[str]: Extracted text or None if failed
        """
        if not self.is_allowed_file(filename):
            logger.error(f"Unsupported file type: {filename}")
            return None
        
        file_extension = filename.rsplit('.', 1)[1].lower()
        
        try:
            if file_extension == 'pdf':
                return self._extract_text_from_pdf(file_content)
            elif file_extension == 'docx':
                return self._extract_text_from_docx(file_content)
            else:
                logger.error(f"Unsupported file extension: {file_extension}")
                return None
        except Exception as e:
            logger.error(f"Error processing file {filename}: {e}")
            return None
    
    def _extract_text_from_pdf(self, file_content: bytes) -> Optional[str]:
        """Extract text from PDF file with enhanced error handling"""
        try:
            logger.info("Attempting to read PDF...")
            pdf_reader = pdf.PdfReader(BytesIO(file_content))
            text_content = ""
            
            logger.info(f"PDF has {len(pdf_reader.pages)} pages")
            
            for i, page in enumerate(pdf_reader.pages):
                try:
                    page_text = page.extract_text() or ""
                    text_content += page_text + "\n"
                    logger.info(f" Extracted text from page {i+1}: {len(page_text)} characters")
                except Exception as page_error:
                    logger.warning(f" Error extracting from page {i+1}: {page_error}")
                    continue
            
            if not text_content.strip():
                logger.warning(" No text extracted from PDF")
                return None
                
            logger.info(f" Total text extracted: {len(text_content)} characters")
            return text_content.strip()
            
        except Exception as e:
            logger.error(f" Error extracting PDF: {e}")
            return None
    
    def _extract_text_from_docx(self, file_content: bytes) -> Optional[str]:
        """Extract text from DOCX file with enhanced error handling"""
        temp_filename = None
        try:
            logger.info("Attempting to read DOCX...")
            
            # Create temporary file
            temp_filename = os.path.join(
                self.upload_folder, 
                f'temp_{datetime.now().strftime("%Y%m%d_%H%M%S")}_{os.getpid()}.docx'
            )
            
            with open(temp_filename, 'wb') as temp_file:
                temp_file.write(file_content)
            
            text_content = docx2txt.process(temp_filename)
            
            if not text_content or not text_content.strip():
                logger.warning(" No text extracted from DOCX")
                return None
                
            logger.info(f" Text extracted from DOCX: {len(text_content)} characters")
            return text_content.strip()
            
        except Exception as e:
            logger.error(f" Error extracting DOCX: {e}")
            return None
        finally:
            # Clean up temporary file
            if temp_filename and os.path.exists(temp_filename):
                try:
                    os.remove(temp_filename)
                    logger.info(" Temporary file cleaned up")
                except Exception as e:
                    logger.error(f" Failed to clean up temporary file: {e}")
    
    def extract_email_from_text(self, text: str) -> Optional[str]:
        """
        Extract email address from text (specifically Gmail addresses)
        
        Args:
            text (str): Text content to search for email
            
        Returns:
            Optional[str]: Email address or None if not found
        """
        if not text:
            return None
        
        # Pattern for Gmail addresses
        email_pattern = r'[a-zA-Z0-9._%+-]+@gmail\.com'
        match = re.search(email_pattern, text, re.IGNORECASE)
        return match.group(0) if match else None
    
    def extract_name_from_text(self, text: str) -> Optional[str]:
        """
        Extract candidate name from CV text using pattern matching
        
        Args:
            text (str): CV text content to search for name
            
        Returns:
            Optional[str]: Extracted name or None if not found
        """
        if not text:
            return None
        
        # Clean the text first
        text = self.clean_text(text)
        
        # Common patterns for name extraction in CVs
        name_patterns = [
            # Name in header format (all caps, 2-4 words) - prioritize this for headers like "MOHAMED ABOLYAZEED"
            r'^([A-Z]{2,}(?:\s+[A-Z]{2,}){1,3})\s*$',
            # Name after "Name:" or "Full Name:" - look for the part after the colon
            r'(?:Name|Full Name|Full name|NAME|FULL NAME)\s*:?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})',
            # Name before email pattern (stop at email line)
            r'([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})(?:\s*\n\s*[a-zA-Z0-9._%+-]+@)',
            # Name at the beginning of CV (first line with capital letters, end at newline)
            r'^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})\s*$',
        ]
        
        # Split text into lines for better pattern matching
        lines = text.split('\n')
        
        # Try each pattern
        for pattern in name_patterns:
            # First try on the whole text
            match = re.search(pattern, text, re.MULTILINE)
            if match:
                name = match.group(1).strip()
                # Use appropriate validation based on name format
                if name.isupper():
                    is_valid = self._is_valid_name_caps(name)
                else:
                    is_valid = self._is_valid_name(name)
                
                if is_valid:
                    logger.info(f"Name extracted using pattern: {name}")
                    return name
            
            # Also try on first few lines
            for i, line in enumerate(lines[:3]):  # Check first 3 lines
                match = re.search(pattern, line)
                if match:
                    name = match.group(1).strip()
                    # Use appropriate validation based on name format
                    if name.isupper():
                        is_valid = self._is_valid_name_caps(name)
                    else:
                        is_valid = self._is_valid_name(name)
                    
                    if is_valid:
                        logger.info(f"Name extracted from line {i+1}: {name}")
                        return name
        
        # Special handling for "Name:" patterns - look for the content after the colon
        for line in lines[:3]:
            if "Name:" in line or "Full Name:" in line:
                # Extract everything after the colon, but stop at job titles
                parts = line.split()
                name_parts = []
                name_started = False
                
                for part in parts:
                    if not name_started:
                        if "Name:" in part or "Full" in part:
                            name_started = True
                        continue
                    
                    # Stop if we hit a job title or position
                    if part.upper() in ['POSITION', 'LOCATION', 'EMAIL', 'PHONE', 'SOFTWARE', 'ENGINEER', 'MANAGER', 'DEVELOPER', 'SCIENTIST', 'ANALYST', 'MARKETING', 'DATA', 'NEW', 'NY', 'YORK']:
                        break
                    
                    # Only add proper name parts (capitalized words)
                    if part and part[0].isupper() and part.isalpha():
                        name_parts.append(part)
                    
                    # Stop after we have 2-4 name parts
                    if len(name_parts) >= 4:
                        break
                
                if len(name_parts) >= 2:
                    name = " ".join(name_parts[:4])  # Take at most 4 parts
                    # Use appropriate validation based on name format
                    if name.isupper():
                        is_valid = self._is_valid_name_caps(name)
                    else:
                        is_valid = self._is_valid_name_basic(name)
                    
                    if is_valid:
                        logger.info(f"Name extracted using improved colon pattern: {name}")
                        return name
        
        # Fallback: look for the first sequence of capitalized words in the first few lines
        for line in lines[:3]:
            line = line.strip()
            if line:
                # Look for 2-4 capitalized words at the beginning of the line (mixed case)
                fallback_match = re.search(r'^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})(?:\s|$)', line)
                if fallback_match:
                    name = fallback_match.group(1).strip()
                    # Use appropriate validation based on name format
                    if name.isupper():
                        is_valid = self._is_valid_name_caps(name)
                    else:
                        is_valid = self._is_valid_name(name)
                    
                    if is_valid:
                        logger.info(f"Name extracted using fallback: {name}")
                        return name
                
                # Also try all-caps fallback for names like "MOHAMED ABOLYAZEED"
                caps_fallback_match = re.search(r'^([A-Z]{2,}(?:\s+[A-Z]{2,}){1,3})(?:\s|$)', line)
                if caps_fallback_match:
                    name = caps_fallback_match.group(1).strip()
                    if self._is_valid_name_caps(name):
                        logger.info(f"Name extracted using caps fallback: {name}")
                        return name
        
        logger.warning("Could not extract name from CV text")
        return None
    
    def _is_valid_name(self, name: str) -> bool:
        """
        Validate if extracted text is likely a valid name
        
        Args:
            name (str): Extracted name candidate
            
        Returns:
            bool: True if valid name, False otherwise
        """
        if not name or len(name) < 2:
            return False
        
        # Remove common false positives
        false_positives = [
            'CV', 'RESUME', 'CURRICULUM VITAE', 'PERSONAL INFORMATION',
            'CONTACT INFORMATION', 'PROFESSIONAL SUMMARY', 'OBJECTIVE',
            'WORK EXPERIENCE', 'EDUCATION', 'SKILLS', 'REFERENCES',
            'EMPLOYMENT HISTORY', 'CAREER OBJECTIVE', 'PROFILE',
            'SUMMARY', 'EXPERIENCE', 'QUALIFICATIONS', 'ACHIEVEMENTS',
            'CERTIFICATIONS', 'PROJECTS', 'LANGUAGES', 'INTERESTS',
            'HOBBIES', 'ACTIVITIES', 'VOLUNTEER', 'AWARDS'
        ]
        
        if name.upper() in false_positives:
            return False
        
        # Check if it contains only letters and spaces
        if not re.match(r'^[A-Za-z\s]+$', name):
            return False
        
        # Check for reasonable length (2-50 characters)
        if len(name) < 2 or len(name) > 50:
            return False
        
        # Should have at least 2 words for full name
        words = name.split()
        if len(words) < 2:
            return False
        
        # Each word should be at least 2 characters
        if any(len(word) < 2 for word in words):
            return False
        
        # Should not have more than 4 words (to avoid false positives)
        if len(words) > 4:
            return False
        
        # Check for job titles and positions that shouldn't be names
        job_titles = [
            'ENGINEER', 'MANAGER', 'DEVELOPER', 'SCIENTIST', 'ANALYST', 'CONSULTANT',
            'DIRECTOR', 'SPECIALIST', 'COORDINATOR', 'ASSISTANT', 'EXECUTIVE',
            'ADMINISTRATOR', 'TECHNICIAN', 'SUPERVISOR', 'REPRESENTATIVE',
            'SOFTWARE', 'SENIOR', 'JUNIOR', 'LEAD', 'PRINCIPAL', 'CHIEF',
            'MARKETING', 'SALES', 'HUMAN', 'RESOURCES', 'FINANCE', 'OPERATIONS',
            'PRODUCT', 'PROJECT', 'BUSINESS', 'DATA', 'SYSTEM', 'NETWORK',
            'QUALITY', 'CUSTOMER', 'SERVICE', 'SUPPORT', 'TECHNICAL', 'ACCOUNT',
            'POSITION', 'LOCATION', 'PHONE', 'EMAIL', 'ADDRESS', 'LINKEDIN'
        ]
        
        name_upper = name.upper()
        for title in job_titles:
            if title in name_upper:
                return False
        
        return True
    
    def _is_valid_name_caps(self, name: str) -> bool:
        """
        Validate all-caps names (like MOHAMED ABOLYAZEED)
        
        Args:
            name (str): Extracted name candidate in all caps
            
        Returns:
            bool: True if valid name, False otherwise
        """
        if not name or len(name) < 2:
            return False
        
        # Check if it contains only letters and spaces
        if not re.match(r'^[A-Z\s]+$', name):
            return False
        
        # Check for reasonable length (2-50 characters)
        if len(name) < 2 or len(name) > 50:
            return False
        
        # Should have at least 2 words for full name
        words = name.split()
        if len(words) < 2:
            return False
        
        # Each word should be at least 2 characters
        if any(len(word) < 2 for word in words):
            return False
        
        # Should not have more than 4 words (to avoid false positives)
        if len(words) > 4:
            return False
        
        # Remove common false positives for ALL-CAPS text (less restrictive than mixed case)
        false_positives_caps = [
            'CV', 'RESUME', 'CURRICULUM VITAE', 'PERSONAL INFORMATION',
            'CONTACT INFORMATION', 'PROFESSIONAL SUMMARY', 'OBJECTIVE',
            'WORK EXPERIENCE', 'EDUCATION', 'SKILLS', 'REFERENCES',
            'EMPLOYMENT HISTORY', 'CAREER OBJECTIVE', 'PROFILE',
            'SUMMARY', 'EXPERIENCE', 'QUALIFICATIONS', 'ACHIEVEMENTS',
            'CERTIFICATIONS', 'PROJECTS', 'LANGUAGES', 'INTERESTS',
            'HOBBIES', 'ACTIVITIES', 'VOLUNTEER', 'AWARDS'
        ]
        
        if name in false_positives_caps:
            return False
        
        # For all-caps names, be more lenient about job titles since many names
        # might contain words that sound like titles
        job_titles_strict = [
            'CURRICULUM VITAE', 'PROFESSIONAL SUMMARY', 'WORK EXPERIENCE',
            'EMPLOYMENT HISTORY', 'CAREER OBJECTIVE', 'CONTACT INFORMATION',
            'PERSONAL INFORMATION'
        ]
        
        if name in job_titles_strict:
            return False
        
        return True
    
    def _is_valid_name_basic(self, name: str) -> bool:
        """
        Basic name validation with fewer restrictions
        
        Args:
            name (str): Extracted name candidate
            
        Returns:
            bool: True if valid name, False otherwise
        """
        if not name or len(name) < 2:
            return False
        
        # Check if it contains only letters and spaces
        if not re.match(r'^[A-Za-z\s]+$', name):
            return False
        
        # Check for reasonable length (2-50 characters)
        if len(name) < 2 or len(name) > 50:
            return False
        
        # Should have at least 2 words for full name
        words = name.split()
        if len(words) < 2:
            return False
        
        # Each word should be at least 2 characters
        if any(len(word) < 2 for word in words):
            return False
        
        # Should not have more than 4 words (to avoid false positives)
        if len(words) > 4:
            return False
        
        return True
    
    def clean_text(self, text: str) -> str:
        """
        Clean and normalize extracted text
        
        Args:
            text (str): Raw text content
            
        Returns:
            str: Cleaned text
        """
        if not text:
            return ""
        
        # Remove excessive whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Remove special characters but keep basic punctuation
        text = re.sub(r'[^\w\s.,;:!?()-]', '', text)
        
        return text.strip()
    
    def validate_file_size(self, file_content: bytes, max_size: int = 16 * 1024 * 1024) -> bool:
        """
        Validate if file size is within allowed limits
        
        Args:
            file_content (bytes): File content
            max_size (int): Maximum allowed size in bytes (default 16MB)
            
        Returns:
            bool: True if size is valid, False otherwise
        """
        return len(file_content) <= max_size
    
    def get_file_info(self, file_content: bytes, filename: str) -> dict:
        """
        Get file information for logging and processing
        
        Args:
            file_content (bytes): File content
            filename (str): Original filename
            
        Returns:
            dict: File information
        """
        return {
            'filename': filename,
            'size_bytes': len(file_content),
            'size_mb': round(len(file_content) / (1024 * 1024), 2),
            'extension': filename.rsplit('.', 1)[1].lower() if '.' in filename else 'unknown',
            'is_allowed': self.is_allowed_file(filename),
            'timestamp': datetime.now().isoformat()
        }
    
    # Async methods for integration with FastAPI
    
    async def extract_text_from_file_async(self, file_content: bytes, filename: str) -> Optional[str]:
        """
        Async version of extract_text_from_file
        
        Args:
            file_content (bytes): File content as bytes
            filename (str): Original filename with extension
            
        Returns:
            Optional[str]: Extracted text or None if failed
        """
        import asyncio
        return await asyncio.get_event_loop().run_in_executor(
            None, self._extract_text_from_file_sync, file_content, filename
        )
    
    def extract_email(self, text: str) -> Optional[str]:
        """
        Extract email address from text using various patterns
        
        Args:
            text (str): Text content to search for email
            
        Returns:
            Optional[str]: Email address or None if not found
        """
        if not text:
            return None
        
        # Pattern for general email addresses
        email_patterns = [
            r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}',  # General email
            r'[a-zA-Z0-9._%+-]+@gmail\.com',  # Gmail specifically
            r'[a-zA-Z0-9._%+-]+@outlook\.com',  # Outlook
            r'[a-zA-Z0-9._%+-]+@yahoo\.com',  # Yahoo
        ]
        
        for pattern in email_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(0)
        
        return None
    
    def extract_name(self, text: str) -> Optional[str]:
        """
        Extract candidate name from CV text
        
        Args:
            text (str): CV text content
            
        Returns:
            Optional[str]: Extracted name or None if not found
        """
        if not text:
            return None
        
        # Clean the text and split into lines
        lines = text.split('\n')
        
        # Look for name in first few lines
        for i, line in enumerate(lines[:10]):  # Check first 10 lines
            line = line.strip()
            
            # Skip empty lines or very short lines
            if len(line) < 3:
                continue
            
            # Skip lines that look like contact info, addresses, etc.
            if any(keyword in line.lower() for keyword in [
                'phone', 'email', 'address', 'tel:', 'mobile', 
                '@', 'http', 'www', 'linkedin', 'github'
            ]):
                continue
            
            # Look for potential name patterns
            words = line.split()
            
            # If line has 2-4 words and looks like a name
            if 2 <= len(words) <= 4:
                # Check if words start with capital letters (name pattern)
                if all(word[0].isupper() and word.isalpha() for word in words if len(word) > 1):
                    return ' '.join(words)
        
        return None
    
    # Methods expected by tests
    def extract_text_from_file(self, file_path: str) -> str:
        """
        Extract text from file (test-compatible version with single parameter)
        
        Args:
            file_path (str): Path to the file to extract text from
            
        Returns:
            str: Extracted text content
        """
        from pathlib import Path
        
        file_path = Path(file_path)
        if not file_path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")
        
        # Check file extension
        if file_path.suffix.lower() not in ['.txt', '.pdf', '.docx']:
            raise ValueError(f"Unsupported file format: {file_path.suffix}")
        
        # For text files, read directly
        if file_path.suffix.lower() == '.txt':
            return file_path.read_text(encoding='utf-8')
        
        # For PDF/DOCX files, read as bytes and process
        file_content = file_path.read_bytes()
        filename = file_path.name
        
        # Use existing sync method
        result = self._extract_text_from_file_sync(file_content, filename)
        return result or ""
    
    def save_uploaded_file(self, file_content: bytes, filename: str) -> Path:
        """
        Save uploaded file to upload folder
        
        Args:
            file_content (bytes): File content as bytes
            filename (str): Original filename
            
        Returns:
            Path: Path to saved file
        """
        from pathlib import Path
        
        # Create upload folder if it doesn't exist
        upload_path = Path(self.upload_folder)
        upload_path.mkdir(parents=True, exist_ok=True)
        
        # Create full file path
        file_path = upload_path / filename
        
        # Write file content
        file_path.write_bytes(file_content)
        
        return file_path
    
    def validate_file_type(self, filename: str) -> bool:
        """
        Validate file type based on extension
        
        Args:
            filename (str): Filename to validate
            
        Returns:
            bool: True if file type is valid, False otherwise
        """
        if not filename or '.' not in filename:
            return False
        
        extension = filename.rsplit('.', 1)[1].lower()
        
        # Valid file extensions
        valid_extensions = {'txt', 'pdf', 'docx'}
        return extension in valid_extensions