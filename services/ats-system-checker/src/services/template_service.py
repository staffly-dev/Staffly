"""
Template Service for ATS System
Handles HTML template rendering with dynamic content replacement
"""

import os
import json
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)


class TemplateService:
    """Service for rendering HTML templates with dynamic content"""
    
    def __init__(self, template_dir: str = "frontend"):
        """
        Initialize template service
        
        Args:
            template_dir: Directory containing HTML templates
        """
        self.template_dir = template_dir
    
    def render_template(self, template_name: str, context: Dict[str, Any] = None) -> str:
        """
        Render an HTML template with the provided context
        
        Args:
            template_name: Name of the template file
            context: Dictionary of values to replace in template
            
        Returns:
            str: Rendered HTML content
        """
        try:
            template_path = os.path.join(self.template_dir, template_name)
            
            if not os.path.exists(template_path):
                logger.error(f"Template not found: {template_path}")
                raise FileNotFoundError(f"Template '{template_name}' not found")
            
            # Read template file
            with open(template_path, 'r', encoding='utf-8') as file:
                template_content = file.read()
            
            # Replace placeholders if context provided
            if context:
                template_content = self._replace_placeholders(template_content, context)
            
            logger.info(f" Successfully rendered template: {template_name}")
            return template_content
            
        except Exception as e:
            logger.error(f" Error rendering template {template_name}: {e}")
            raise
    
    def _replace_placeholders(self, template_content: str, context: Dict[str, Any]) -> str:
        """
        Replace placeholders in template with actual values
        
        Args:
            template_content: HTML template content
            context: Values to replace placeholders with
            
        Returns:
            str: Template with replaced values
        """
        try:
            for key, value in context.items():
                # Handle triple-brace placeholders first (unescaped content like JSON)
                triple_placeholder = f"{{{{{{{key}}}}}}}"  # {{{KEY}}} format
                double_placeholder = f"{{{{{key}}}}}"  # {{KEY}} format
                
                # Handle different value types
                if value is None:
                    replacement = ""
                elif isinstance(value, bool):
                    replacement = "Yes" if value else "No"
                elif isinstance(value, list):
                    # For lists, join with HTML list items
                    if key.upper() == "REQUIRED_SKILLS":
                        replacement = self._format_skills_list(value)
                    else:
                        replacement = ", ".join(str(item) for item in value)
                elif isinstance(value, dict):
                    # For dictionaries (like QUIZ_DATA), convert to JSON
                    replacement = json.dumps(value)
                else:
                    replacement = str(value)
                
                # Replace triple-brace placeholders first (for unescaped content)
                if triple_placeholder in template_content:
                    template_content = template_content.replace(triple_placeholder, replacement)
                
                # Then replace double-brace placeholders (for escaped content)
                if double_placeholder in template_content:
                    # For double-brace, we might want to escape HTML in the future
                    template_content = template_content.replace(double_placeholder, replacement)
            
            # Handle conditional sections
            template_content = self._handle_conditional_sections(template_content, context)
            
            return template_content
            
        except Exception as e:
            logger.error(f" Error replacing placeholders: {e}")
            return template_content
    
    def _format_skills_list(self, skills: list) -> str:
        """
        Format skills list as HTML list items
        
        Args:
            skills: List of skill strings
            
        Returns:
            str: HTML formatted skills list
        """
        if not skills:
            return "<li>No specific skills listed</li>"
        
        return "\n".join(f"<li>{skill}</li>" for skill in skills)
    
    def _handle_conditional_sections(self, template_content: str, context: Dict[str, Any]) -> str:
        """
        Handle conditional sections based on context values
        
        Args:
            template_content: Template content
            context: Context values
            
        Returns:
            str: Template with conditional sections processed
        """
        # Handle additional details section
        if context.get('ADDITIONAL_DETAILS'):
            additional_section = f"""<div class="additional-details">
                <h3>Additional Information</h3>
                <p>{context['ADDITIONAL_DETAILS'].replace(chr(10), '<br>')}</p>
            </div>"""
            template_content = template_content.replace('{{ADDITIONAL_DETAILS}}', additional_section)
        else:
            template_content = template_content.replace('{{ADDITIONAL_DETAILS}}', '')
        
        # Handle HR contact section
        if context.get('HR_NAME'):
            hr_section = f"""<div class="hr-contact">
                <h3>Contact</h3>
                <p>👤 {context['HR_NAME']}</p>
            </div>"""
            template_content = template_content.replace('{{HR_CONTACT}}', hr_section)
        else:
            template_content = template_content.replace('{{HR_CONTACT}}', '')
        
        return template_content
    
    def render_job_application_page(self, job_posting) -> str:
        """
        Render job application page with job posting data
        
        Args:
            job_posting: JobPosting database object
            
        Returns:
            str: Rendered HTML for job application page
        """
        try:
            context = {
                'JOB_ID': job_posting.job_id,
                'JOB_TITLE': job_posting.title,
                'JOB_DESCRIPTION': job_posting.description.replace('\n', '<br>'),
                'REQUIRED_SKILLS': job_posting.required_skills,
                'ADDITIONAL_DETAILS': job_posting.additional_details,
                'HR_NAME': job_posting.hr_name
            }
            
            return self.render_template('job-application.html', context)
            
        except Exception as e:
            logger.error(f" Error rendering job application page: {e}")
            raise
    
    def render_quiz_page(self, quiz_session, job_title: str = "Skills Assessment", application_id: str = None) -> str:
        """
        Render quiz page with quiz session data
        
        Args:
            quiz_session: QuizSession database object
            job_title: Job title for the quiz
            application_id: Application ID for linking quiz results
            
        Returns:
            str: Rendered HTML for quiz page
        """
        try:
            # Prepare quiz questions HTML
            questions_html = ""
            for i, question_data in enumerate(quiz_session.questions):
                options_html = ""
                for j, option in enumerate(question_data['options']):
                    options_html += f"""
                    <div class="option" onclick="document.getElementById('q{i}_a{j}').checked=true; saveAnswer({i}, {j})">
                        <input type="radio" id="q{i}_a{j}" name="question_{i}" value="{j}">
                        <label for="q{i}_a{j}">{option}</label>
                    </div>"""
                
                questions_html += f"""
                <div class="question" data-question="{i}">
                    <h4>Question {i+1}: {question_data['question']}</h4>
                    <div class="options">
                        {options_html}
                    </div>
                </div>"""
            
            context = {
                'JOB_TITLE': job_title,
                'TIME_LIMIT': quiz_session.time_limit_seconds // 60,  # Convert to minutes
                'TOTAL_QUESTIONS': len(quiz_session.questions),
                'PASS_THRESHOLD': quiz_session.pass_threshold,
                'QUIZ_QUESTIONS': questions_html,
                'QUIZ_DATA': json.dumps(quiz_session.questions),
                'CANDIDATE_EMAIL': quiz_session.candidate_email or '',
                'APPLICATION_ID': application_id or ''
            }
            
            return self.render_template('quiz-page.html', context)
            
        except Exception as e:
            logger.error(f" Error rendering quiz page: {e}")
            raise
    
    def get_error_page(self, error_type: str) -> str:
        """
        Get appropriate error page HTML
        
        Args:
            error_type: Type of error ('not_found', 'inactive', 'server_error')
            
        Returns:
            str: Error page HTML
        """
        try:
            error_templates = {
                'not_found': 'job-not-found.html',
                'inactive': 'job-inactive.html',
                'server_error': 'error-500.html'
            }
            
            template_name = error_templates.get(error_type, 'job-not-found.html')
            return self.render_template(template_name)
            
        except Exception as e:
            logger.error(f" Error getting error page: {e}")
            # Return basic error HTML as fallback
            return self._get_fallback_error_html(error_type)
    
    def _get_fallback_error_html(self, error_type: str) -> str:
        """
        Return basic error HTML as fallback
        
        Args:
            error_type: Type of error
            
        Returns:
            str: Basic error HTML
        """
        error_messages = {
            'not_found': 'Job posting not found',
            'inactive': 'Job posting is no longer active',
            'server_error': 'An error occurred while loading this page'
        }
        
        message = error_messages.get(error_type, 'An error occurred')
        
        return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Error - ATS System</title>
    <style>
        body {{ font-family: Arial, sans-serif; text-align: center; margin: 50px; }}
        .error {{ background: #f8d7da; border: 1px solid #f5c6cb; padding: 20px; border-radius: 10px; }}
    </style>
</head>
<body>
    <div class="error">
        <h1> Error</h1>
        <p>{message}</p>
        <button onclick="window.location.href='/'"> Go Home</button>
    </div>
</body>
</html>"""