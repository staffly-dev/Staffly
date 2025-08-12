"""
Email Service for ATS System
Handles sending email notifications asynchronously
"""

import smtplib
import logging
import asyncio
from typing import Optional, TYPE_CHECKING
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

if TYPE_CHECKING:
    from .database_service import DatabaseService

logger = logging.getLogger(__name__)


class EmailService:
    """Service for sending email notifications"""
    
    def __init__(self, gmail_user: str, gmail_password: str, database_service: Optional["DatabaseService"] = None, frontend_url: str = "https://stafflyhr.tech"):
        """
        Initialize email service
        
        Args:
            gmail_user: Gmail username
            gmail_password: Gmail app password
            database_service: Database service for saving notifications
            frontend_url: Frontend URL for generating quiz links
        """
        self.gmail_user = gmail_user
        self.gmail_password = gmail_password
        self.smtp_server = "smtp.gmail.com"
        self.smtp_port = 587
        self.database_service = database_service
        self.frontend_url = frontend_url.rstrip('/')  # Remove trailing slash
    
    async def send_email_async(
        self, 
        to_email: str, 
        subject: str, 
        body: str,
        notification_type: str = "SYSTEM",
        cv_evaluation_id: Optional[str] = None,
        quiz_result_id: Optional[str] = None
    ) -> bool:
        """
        Send email asynchronously and save notification to database
        
        Args:
            to_email: Recipient email address
            subject: Email subject
            body: Email body content
            notification_type: Type of notification
            cv_evaluation_id: Reference to CV evaluation
            quiz_result_id: Reference to quiz result
            
        Returns:
            bool: True if sent successfully, False otherwise
        """
        notification = None
        try:
            # Save notification to database first
            if self.database_service:
                notification = await self.database_service.save_email_notification(
                    recipient_email=to_email,
                    notification_type=notification_type,
                    subject=subject,
                    body=body,
                    cv_evaluation_id=cv_evaluation_id,
                    quiz_result_id=quiz_result_id
                )
            
            # Run email sending in thread pool to avoid blocking
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(
                None, 
                self._send_email_sync, 
                to_email, 
                subject, 
                body
            )
            
            # Update notification status
            if notification and self.database_service:
                status = "SENT" if result else "FAILED"
                await self.database_service.update_email_notification_status(
                    str(notification.id), status
                )
            
            return result
        except Exception as e:
            logger.error(f"Error sending async email: {e}")
            # Update notification status to failed
            if notification and self.database_service:
                try:
                    await self.database_service.update_email_notification_status(
                        str(notification.id), "FAILED", str(e)
                    )
                except:
                    pass
            return False
    
    def _send_email_sync(
        self,
        to_email: str,
        subject: str,
        body: str
    ) -> bool:
        """
        Send email synchronously (used internally by async method)
        
        Args:
            to_email: Recipient email address
            subject: Email subject
            body: Email body content
            
        Returns:
            bool: True if sent successfully, False otherwise
        """
        try:
            # Validate email configuration
            if not self.gmail_user or not self.gmail_password:
                logger.warning("Email credentials not configured")
                return False
            
            if self.gmail_user == "your_email@gmail.com":
                logger.warning("Default email configuration detected, skipping email send")
                return False
            
            # Create message
            msg = MIMEMultipart()
            msg['From'] = self.gmail_user
            msg['To'] = to_email
            msg['Subject'] = subject
            
            # Attach body
            msg.attach(MIMEText(body, 'plain'))
            
            # Connect to server and send email
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()
            server.login(self.gmail_user, self.gmail_password)
            server.send_message(msg)
            server.quit()
            
            logger.info(f" Email sent successfully to {to_email}")
            return True
            
        except smtplib.SMTPAuthenticationError:
            logger.error(" SMTP authentication failed. Check Gmail credentials.")
            return False
        except smtplib.SMTPRecipientsRefused:
            logger.error(f" Recipient email refused: {to_email}")
            return False
        except smtplib.SMTPServerDisconnected:
            logger.error(" SMTP server disconnected")
            return False
        except Exception as e:
            logger.error(f" Failed to send email to {to_email}: {e}")
            return False
    
    def _create_creative_cv_email(self, decision: str, score: int, filename: str, evaluation_text: str, candidate_name: Optional[str] = None) -> tuple[str, str]:
        """Create creative CV evaluation email content"""
        
        if decision == "ACCEPTED":
            subject = f" Fantastic News! Your CV Scored {score}/100 - Welcome to the Next Round!"
            
            emojis = "" if score >= 90 else "" if score >= 80 else ""
            
            # Extract first name (primitive name) from candidate's full name
            if candidate_name:
                name_parts = candidate_name.strip().split()
                greeting_name = name_parts[0] if name_parts else candidate_name
            else:
                greeting_name = "Candidate"
            
            body = f"""
{emojis} Dear {greeting_name},

Drum roll please...

Your CV "{filename}" has been thoroughly evaluated by our AI-powered ATS system, and we have EXCELLENT news to share!

YOUR RESULTS:
═══════════════════════════════════
    Score: {score}/100 {' Outstanding!' if score >= 90 else ' Impressive!' if score >= 80 else ' Great job!'}
    Decision: ACCEPTED
    Status: Moving forward to the next round!

DETAILED ANALYSIS:
{evaluation_text}

WHAT'S NEXT?
We're genuinely excited about your profile! Your skills and experience align beautifully with what we're looking for. A member of our team will be in touch soon with the next steps.

PRO TIP: Keep an eye on your inbox - good things are coming your way!

Warmest regards & high fives!
The ATS Evaluation Team

P.S. Your CV made our AI system smile (yes, it can do that!)

---
This evaluation was powered by cutting-edge AI technology
Sent with  from our ATS System
"""
        else:
            subject = f" Your CV Evaluation Results - Score: {score}/100"
            
            encouragement = " Every expert was once a beginner!" if score < 50 else " You're closer than you think!"
            
            # Extract first name (primitive name) from candidate's full name
            if candidate_name:
                name_parts = candidate_name.strip().split()
                greeting_name = name_parts[0] if name_parts else candidate_name
            else:
                greeting_name = "Candidate"
            
            body = f"""
Dear {greeting_name},

Thank you for taking the time to submit your CV "{filename}" for evaluation. We truly appreciate your interest!

YOUR EVALUATION RESULTS:
═══════════════════════════════════
    Score: {score}/100
    Decision: Not selected for this round
    Status: Room for growth identified

DETAILED FEEDBACK:
{evaluation_text}

{encouragement}

MOVING FORWARD:
While your CV didn't meet the requirements for this specific role, we believe in your potential! Here are some ways to strengthen your profile:

    •  Consider developing skills mentioned in the job requirements
    •  Highlight relevant projects and achievements more prominently
    •  Gain additional experience in key areas
    •  Keep learning and growing - you've got this!

REMEMBER: Every "no" brings you closer to the perfect "yes"! Don't give up on your dreams.

Feel free to apply again in the future as you continue to develop your skills. We'd love to see your growth!

Wishing you the very best in your career journey!

With warm regards,
The ATS Evaluation Team

---
This evaluation was powered by AI technology designed to be fair and comprehensive
Sent with encouragement from our ATS System
"""
        
        return subject, body
    
    async def send_evaluation_notification(
        self,
        to_email: str,
        filename: str,
        decision: str,
        score: int,
        evaluation_text: str,
        cv_evaluation_id: Optional[str] = None,
        candidate_name: Optional[str] = None
    ) -> bool:
        """
        Send creative CV evaluation notification email
        
        Args:
            to_email: Candidate email
            filename: CV filename
            decision: Evaluation decision (ACCEPTED/REJECTED)
            score: Evaluation score
            evaluation_text: Full evaluation text
            cv_evaluation_id: Reference to CV evaluation
            
        Returns:
            bool: True if sent successfully, False otherwise
        """
        subject, body = self._create_creative_cv_email(decision, score, filename, evaluation_text, candidate_name)
        
        return await self.send_email_async(
            to_email, 
            subject, 
            body,
            notification_type="CV_RESULT",
            cv_evaluation_id=cv_evaluation_id
        )
    
    def _create_creative_quiz_email(self, score: int, total: int, status: str, filename: Optional[str], candidate_name: Optional[str] = None) -> tuple[str, str]:
        """Create creative quiz result email content"""
        
        percentage = (score / total) * 100 if total > 0 else 0
        
        if status == "PASSED":
            subject = f" Quiz Champion! You Scored {score}/{total} ({percentage:.1f}%) - Congratulations!"
            
            celebration = "" if percentage >= 90 else "" if percentage >= 80 else ""
            
            # Extract first name (primitive name) from candidate's full name
            if candidate_name:
                name_parts = candidate_name.strip().split()
                greeting_name = name_parts[0] if name_parts else candidate_name
            else:
                greeting_name = "Champion"
            
            body = f"""
{celebration} Dear {greeting_name},

Wow! Just WOW!

You've absolutely crushed our quiz challenge, and we couldn't be more impressed!

YOUR STELLAR RESULTS:
═══════════════════════════════════
    Quiz Score: {score}/{total} ({percentage:.1f}%)
    Status: PASSED with flying colors!
    CV File: {filename if filename else 'N/A'}
    Achievement: Quiz Master Level Unlocked!

WHAT THIS MEANS:
You've demonstrated exceptional knowledge and problem-solving skills! Your performance shows that you're not just qualified on paper, but you truly understand the concepts that matter for this role.

NEXT STEPS:
Our team is absolutely thrilled with your performance. You can expect to hear from us very soon about the exciting opportunities ahead!

FUN FACT: Only the top candidates achieve scores like yours. You're officially part of an elite group! 

Keep being awesome!

With tremendous excitement,
The ATS Evaluation Team

P.S. Our AI is still calculating how impressive your score is... it might be a while! ✨

---
Quiz powered by advanced AI assessment technology
Sent with celebration from our ATS System
"""
        else:
            subject = f" Quiz Results - Score: {score}/{total} ({percentage:.1f}%)"
            
            motivation = " Growth mindset activated!" if percentage >= 60 else " Challenge accepted!"
            
            # Extract first name (primitive name) from candidate's full name
            if candidate_name:
                name_parts = candidate_name.strip().split()
                greeting_name = name_parts[0] if name_parts else candidate_name
            else:
                greeting_name = "Candidate"
            
            body = f"""
Dear {greeting_name},

Thank you for taking our quiz challenge! We appreciate the time and effort you invested.

YOUR QUIZ RESULTS:
═══════════════════════════════════
    Quiz Score: {score}/{total} ({percentage:.1f}%)
    Status: Did not meet the minimum threshold
    CV File: {filename if filename else 'N/A'}
    Target: 70% required to pass

{motivation}

WHAT WE OBSERVED:
While you didn't reach the passing threshold this time, your effort shows real dedication. Quiz challenges are tough, and taking them requires courage!

PATHWAYS TO SUCCESS:
This is just one step in your journey! Consider these growth opportunities:

    •  Review the topics covered in the quiz
    •  Explore additional learning resources in key areas
    •  Practice similar challenges to sharpen your skills
    •  Remember: every expert was once a beginner!

INSPIRATIONAL REMINDER:
"Success is not final, failure is not fatal: it is the courage to continue that counts." - Winston Churchill

Don't let this discourage you! Use it as fuel for your next breakthrough. We believe in your potential to grow and succeed.

Keep pushing forward!

With encouragement and support,
The ATS Evaluation Team

---
Quiz designed to identify growth opportunities
Sent with motivation from our ATS System
"""
        
        return subject, body
    
    async def send_quiz_notification(
        self,
        to_email: str,
        score: int,
        total: int,
        status: str,
        filename: Optional[str] = None,
        quiz_result_id: Optional[str] = None,
        candidate_name: Optional[str] = None
    ) -> bool:
        """
        Send creative quiz result notification email
        
        Args:
            to_email: Candidate email
            score: Quiz score
            total: Total questions
            status: PASSED or FAILED
            filename: Associated CV filename
            quiz_result_id: Reference to quiz result
            
        Returns:
            bool: True if sent successfully, False otherwise
        """
        subject, body = self._create_creative_quiz_email(score, total, status, filename, candidate_name)
        
        return await self.send_email_async(
            to_email,
            subject,
            body,
            notification_type="QUIZ_RESULT",
            quiz_result_id=quiz_result_id
        )
    
    async def send_bulk_notifications(
        self,
        notifications: list
    ) -> dict:
        """
        Send multiple email notifications asynchronously
        
        Args:
            notifications: List of notification dictionaries
            
        Returns:
            dict: Summary of send results
        """
        results = {
            "total": len(notifications),
            "sent": 0,
            "failed": 0,
            "errors": []
        }
        
        # Create tasks for concurrent email sending
        tasks = []
        for notification in notifications:
            task = self.send_email_async(
                notification['email'],
                notification['subject'],
                notification['body']
            )
            tasks.append(task)
        
        # Wait for all emails to be sent
        if tasks:
            send_results = await asyncio.gather(*tasks, return_exceptions=True)
            
            for i, result in enumerate(send_results):
                if isinstance(result, Exception):
                    results["failed"] += 1
                    results["errors"].append(f"Email {i+1}: {str(result)}")
                elif result:
                    results["sent"] += 1
                else:
                    results["failed"] += 1
                    results["errors"].append(f"Email {i+1}: Unknown error")
        
        logger.info(f"Bulk email results: {results['sent']}/{results['total']} sent successfully")
        return results
    
    def test_connection(self) -> bool:
        """
        Test email service connection
        
        Returns:
            bool: True if connection successful, False otherwise
        """
        try:
            if not self.gmail_user or not self.gmail_password:
                return False
            
            if self.gmail_user == "your_email@gmail.com":
                return False
            
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()
            server.login(self.gmail_user, self.gmail_password)
            server.quit()
            
            logger.info(" Email service connection test successful")
            return True
            
        except Exception as e:
            logger.error(f" Email service connection test failed: {e}")
            return False
    
    # New workflow-specific email methods
    
    async def send_acceptance_email_with_quiz(
        self,
        to_email: str,
        job_title: str,
        score: int,
        quiz_questions: list,
        application_id: str,
        quiz_session_id: str,
        candidate_name: Optional[str] = None
    ) -> bool:
        """
        Send acceptance email with quiz invitation
        
        Args:
            to_email: Candidate email
            job_title: Job title
            score: CV evaluation score
            quiz_questions: Generated quiz questions
            application_id: Application ID for personalized quiz link
            quiz_session_id: Quiz session ID for personalized quiz link
            
        Returns:
            bool: True if sent successfully
        """
        subject = f"Congratulations! You're Accepted - Complete Your Quiz for {job_title}"
        
        # Generate personalized quiz link using frontend URL
        quiz_link = f"{self.frontend_url}/quiz/{quiz_session_id}"
        
        # Use the full candidate_name if provided
        if candidate_name and candidate_name.strip():
            greeting_name = candidate_name.strip()
        else:
            # Fallback: try to extract name from email address
            email_local = to_email.split('@')[0] if '@' in to_email else to_email
            name_parts = []
            for part in email_local.split('.'):
                if part and part.isalpha():
                    name_parts.append(part.capitalize())
            if len(name_parts) >= 1:
                greeting_name = ' '.join(name_parts[:3])
            else:
                greeting_name = "Candidate"
        
        body = f"""
Dear {greeting_name},

Fantastic news! We're absolutely thrilled to inform you that your CV has been accepted for the {job_title} position!

YOUR ACHIEVEMENT:
═══════════════════════════════════
 CV Score: {score}/100 - Excellent performance!
 Status: ACCEPTED
 Next Step: Complete your skills assessment quiz

QUIZ CHALLENGE AWAITS:
To proceed to the final stage, we'd like you to complete a short skills assessment quiz. This will help us better understand your technical capabilities and ensure the best fit for both you and our team.

Quiz Details:
 • Questions: {len(quiz_questions)}
 • Time Limit: 5 minutes
 • Passing Score: 70%
 • Format: Multiple choice

Take Your Quiz Here: {quiz_link}

QUIZ TIPS:
 • Read each question carefully
 • Trust your instincts
 • Take your time but stay within the limit
 • Show us what you know!

IMPORTANT: Please complete the quiz within 48 hours to maintain your candidacy.

We're excited to see how you perform! Your CV already impressed us, and we're confident you'll do great on the quiz too.

Best of luck! 

With anticipation,
The {job_title} Hiring Team

---
This message was generated by our intelligent ATS system.
Questions? Reply to this email and we'll help you out!
"""
        
        return await self.send_email_async(
            to_email,
            subject,
            body,
            notification_type="QUIZ_INVITATION"
        )
    
    async def send_interview_invitation(
        self,
        to_email: str,
        job_title: str,
        hr_contact: str = "HR Team",
        candidate_name: Optional[str] = None
    ) -> bool:
        """
        Send interview invitation email
        
        Args:
            to_email: Candidate email
            job_title: Job title
            hr_contact: HR contact name
            
        Returns:
            bool: True if sent successfully
        """
        subject = f" Interview Invitation - {job_title} Position"
        
        # Use the full candidate_name if provided
        if candidate_name and candidate_name.strip():
            greeting_name = candidate_name.strip()
        else:
            # Fallback: try to extract name from email address
            email_local = to_email.split('@')[0] if '@' in to_email else to_email
            name_parts = []
            for part in email_local.split('.'):
                if part and part.isalpha():
                    name_parts.append(part.capitalize())
            if len(name_parts) >= 1:
                greeting_name = ' '.join(name_parts[:3])
            else:
                greeting_name = "Candidate"
        
        body = f"""
 Dear {greeting_name},

Congratulations! We are delighted to invite you for an interview for the {job_title} position!

YOUR SUCCESS:
═══════════════════════════════════
    CV Evaluation: Passed with excellent results
    Status: Moving to interview stage
    Achievement: You're among our top candidates!

INTERVIEW DETAILS:
Our {hr_contact} will be contacting you within the next 24-48 hours to schedule your interview at a time that works best for you.

WHAT TO EXPECT:
    • Discussion about your experience and skills
    • Overview of the role and company culture
    • Opportunity for you to ask questions
    • Friendly, professional conversation

INTERVIEW TIPS:
    • Review the job description
    • Prepare examples of your relevant experience
    • Think of questions about the role and company
    • Be yourself - authenticity is what we value most!

WE'RE EXCITED TO MEET YOU!
Your profile stood out among many applications, and we can't wait to learn more about you and discuss how you can contribute to our team.

Keep an eye on your phone and email - we'll be in touch soon!

Warmest congratulations and best wishes,
The {job_title} Hiring Team

Contact: {hr_contact}

---
This interview invitation is the result of your outstanding application
Reply to this email if you have any questions before the interview
"""
        
        return await self.send_email_async(
            to_email,
            subject,
            body,
            notification_type="INTERVIEW_INVITATION"
        )
    
    async def send_rejection_email(
        self,
        to_email: str,
        job_title: str,
        score: int,
        threshold: int,
        candidate_name: Optional[str] = None
    ) -> bool:
        """
        Send rejection email with constructive feedback
        
        Args:
            to_email: Candidate email
            job_title: Job title
            score: CV evaluation score
            threshold: Required threshold score
            
        Returns:
            bool: True if sent successfully
        """
        subject = f"Application Update - {job_title} Position"
        
        # Use the full candidate_name if provided
        if candidate_name and candidate_name.strip():
            greeting_name = candidate_name.strip()
        else:
            # Fallback: try to extract name from email address
            email_local = to_email.split('@')[0] if '@' in to_email else to_email
            name_parts = []
            for part in email_local.split('.'):
                if part and part.isalpha():
                    name_parts.append(part.capitalize())
            if len(name_parts) >= 1:
                greeting_name = ' '.join(name_parts[:3])
            else:
                greeting_name = "Candidate"
        
        body = f"""
Dear {greeting_name},

Thank you for your interest in the {job_title} position and for taking the time to submit your application. We genuinely appreciate the effort you put into your submission.

EVALUATION RESULTS:
═══════════════════════════════════
    Your Score: {score}/100
    Required Score: {threshold}/100
    Decision: Not selected for this round

FEEDBACK FOR GROWTH:
While your application didn't meet the specific requirements for this role, we want to emphasize that this is just one opportunity among many. Your skills and experience have value, and with continued development, you can achieve great success.

SUGGESTIONS FOR FUTURE SUCCESS:
    •  Consider developing skills that align with the job requirements
    •  Gain additional relevant experience
    •  Explore learning opportunities in key areas
    •  Keep refining and updating your CV

ENCOURAGEMENT:
Every successful professional has faced setbacks along their journey. What matters most is how you use this experience to grow and improve. We believe in your potential and encourage you to keep pursuing your goals.

FUTURE OPPORTUNITIES:
Please don't hesitate to apply for other positions with us in the future as you continue to develop your skills. We'd love to see your professional growth!

FINAL THOUGHTS:
Remember, this "no" is just redirecting you toward the right opportunity that's meant for you. Stay positive, keep learning, and keep moving forward!

We wish you all the best in your career journey.

With warm regards and encouragement,
The {job_title} Hiring Team

---
This evaluation was conducted fairly using advanced AI technology
We encourage you to apply again in the future as you grow professionally
"""
        
        return await self.send_email_async(
            to_email,
            subject,
            body,
            notification_type="REJECTION"
        )
    
    # Alias methods for test compatibility
    async def send_evaluation_email(self, email_data: dict) -> bool:
        """
        Send evaluation email (test compatibility method)
        
        Args:
            email_data: Dictionary with email data
            
        Returns:
            bool: True if sent successfully
        """
        return await self.send_evaluation_notification(
            to_email=email_data.get("applicant_email", ""),
            filename=email_data.get("filename", "CV"),
            decision=email_data.get("decision", "UNKNOWN"),
            score=email_data.get("score", 0),
            evaluation_text=email_data.get("evaluation_text", ""),
            candidate_name=email_data.get("candidate_name", None)
        )
    
    async def send_hr_notification(self, email_data: dict) -> bool:
        """
        Send HR notification (test compatibility method)
        
        Args:
            email_data: Dictionary with email data
            
        Returns:
            bool: True if sent successfully
        """
        return await self.send_email_async(
            to_email="hr@company.com",
            subject="HR Review Required",
            body=f"Candidate {email_data.get('name', 'Unknown')} requires manual review",
            notification_type="HR_NOTIFICATION"
        )
    
    async def send_batch_evaluation_emails(self, email_list: list) -> int:
        """
        Send batch evaluation emails (test compatibility method)
        
        Args:
            email_list: List of email data dictionaries
            
        Returns:
            int: Number of emails sent successfully
        """
        results = await self.send_bulk_notifications(email_list)
        return results["sent"]
    
    async def send_interview_invitation_email(
        self,
        to_email: str,
        interview_date: "datetime",
        quiz_score: int,
        total_questions: int,
        candidate_name: Optional[str] = None
    ) -> bool:
        """
        Send interview invitation email for candidates who passed the quiz
        
        Args:
            to_email: Candidate email address
            interview_date: Scheduled interview date and time
            quiz_score: Quiz score achieved
            total_questions: Total quiz questions
            
        Returns:
            bool: True if sent successfully
        """
        from datetime import datetime
        
        percentage = (quiz_score / total_questions) * 100 if total_questions > 0 else 0
        formatted_date = interview_date.strftime("%A, %B %d, %Y")
        formatted_time = interview_date.strftime("%I:%M %p")
        
        subject = f" Interview Invitation - Congratulations on Your Quiz Performance!"
        
        # Use the full candidate_name if provided
        if candidate_name and candidate_name.strip():
            greeting_name = candidate_name.strip()
        else:
            # Fallback: try to extract name from email address
            email_local = to_email.split('@')[0] if '@' in to_email else to_email
            name_parts = []
            for part in email_local.split('.'):
                if part and part.isalpha():
                    name_parts.append(part.capitalize())
            if len(name_parts) >= 1:
                greeting_name = ' '.join(name_parts[:3])
            else:
                greeting_name = "Candidate"
        
        body = f"""
Dear {greeting_name},

We are absolutely thrilled to extend you an interview invitation! Your exceptional performance on our skills assessment quiz has earned you a spot in the final round of our selection process.

YOUR EXCEPTIONAL RESULTS:
═══════════════════════════════════
    Quiz Score: {quiz_score}/{total_questions} ({percentage:.1f}%)
    Achievement: PASSED with distinction!
    Next Step: Personal Interview
    Status: Top Candidate

INTERVIEW DETAILS:
    Date: {formatted_date}
    Time: {formatted_time} 
    Location: To be confirmed by our HR team
    Duration: Approximately 45-60 minutes

WHAT TO EXPECT:
    • Welcome and introductions
    • Discussion about your skills and experience
    • Overview of the role and our company culture
    • Technical discussion relevant to the position
    • Your opportunity to ask questions
    • Next steps in the process

INTERVIEW PREPARATION TIPS:
    • Review your CV and be ready to discuss your experience
    • Prepare specific examples of your work and achievements
    • Research our company and the role
    • Think of thoughtful questions about the position and team
    • Bring copies of your resume and any relevant documents
    • Arrive 5-10 minutes early

CONFIRMATION REQUIRED:
Please reply to this email within 24 hours to confirm your availability. If the scheduled time doesn't work for you, let us know and we'll find an alternative that suits both parties.

EXCITING JOURNEY AHEAD:
Your quiz performance demonstrated exactly the kind of knowledge and problem-solving skills we're looking for. We're genuinely excited about the possibility of you joining our team and can't wait to meet you in person!

CONTACT INFORMATION:
If you have any questions or need to reschedule, please don't hesitate to reach out. Our HR team is here to support you through this process.

Congratulations again on your outstanding quiz performance, and we look forward to our conversation!

With great anticipation,
The Hiring Team

P.S. Your quiz score places you in the top tier of candidates. Well done! 

---
    This interview invitation is the result of your exceptional quiz performance
    Reply to confirm your attendance or to request schedule changes
    Questions? We're here to help - just reply to this email
"""
        
        return await self.send_email_async(
            to_email,
            subject,
            body,
            notification_type="INTERVIEW_INVITATION"
        )
    
    async def send_quiz_result_email(
        self,
        to_email: str,
        score: int,
        total: int,
        status: str,
        quiz_result_id: Optional[str] = None,
        candidate_name: Optional[str] = None
    ) -> bool:
        """
        Send quiz result email notification
        
        Args:
            to_email: Candidate email
            score: Quiz score
            total: Total questions
            status: PASSED or FAILED
            quiz_result_id: Reference to quiz result
            
        Returns:
            bool: True if sent successfully
        """
        return await self.send_quiz_notification(
            to_email=to_email,
            score=score,
            total=total,
            status=status,
            quiz_result_id=quiz_result_id,
            candidate_name=candidate_name
        )