"""
Logging utilities for AI services
"""

import os
import json
import logging
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from models.evaluation_models import EvaluationDecision


def setup_ai_logger(name: str, log_file: str = "ats_ai.log", level: str = "INFO") -> logging.Logger:
    """
    Set up a logger for AI services
    
    Args:
        name (str): Logger name
        log_file (str): Log file path
        level (str): Logging level
        
    Returns:
        logging.Logger: Configured logger
    """
    logger = logging.getLogger(name)
    logger.setLevel(getattr(logging, level.upper()))
    
    # Avoid adding multiple handlers
    if logger.handlers:
        return logger
    
    # Create file handler
    file_handler = logging.FileHandler(log_file, encoding='utf-8')
    file_handler.setLevel(getattr(logging, level.upper()))
    file_handler.setFormatter(
        logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    )
    
    # Create console handler
    console_handler = logging.StreamHandler()
    console_handler.setLevel(getattr(logging, level.upper()))
    console_handler.setFormatter(
        logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    )
    
    # Add handlers to logger
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)
    
    return logger


def save_evaluation_log(
    filename: str,
    job_description: str,
    cv_text: str,
    evaluation_result: str,
    decision: str,
    score: int,
    email: Optional[str] = None,
    log_folder: str = "evaluations"
) -> bool:
    """
    Save evaluation details to log file
    
    Args:
        filename (str): CV filename
        job_description (str): Job description
        cv_text (str): CV text content
        evaluation_result (str): AI evaluation result
        decision (str): Evaluation decision
        score (int): Evaluation score
        email (Optional[str]): Extracted email
        log_folder (str): Folder to save logs
        
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        os.makedirs(log_folder, exist_ok=True)
        
        # Create evaluation log entry as a dictionary
        log_entry = {
            "filename": filename,
            "job_description_preview": job_description[:200] + "..." if len(job_description) > 200 else job_description,
            "cv_text_length": len(cv_text),
            "decision": EvaluationDecision(decision) if decision in ["ACCEPTED", "REJECTED"] else EvaluationDecision.UNKNOWN,
            "score": score,
            "email": email,
            "evaluation_preview": evaluation_result[:500] + "..." if len(evaluation_result) > 500 else evaluation_result
        }
        
        log_filename = os.path.join(
            log_folder, 
            f"evaluation_log_{datetime.now().strftime('%Y%m%d')}.json"
        )
        
        # Load existing logs or create new list
        logs = []
        if os.path.exists(log_filename):
            try:
                with open(log_filename, 'r', encoding='utf-8') as f:
                    logs = json.load(f)
            except (json.JSONDecodeError, FileNotFoundError):
                logs = []
        
        # Add new log entry
        logs.append(log_entry)
        
        # Save updated logs
        with open(log_filename, 'w', encoding='utf-8') as f:
            json.dump(logs, f, indent=2, ensure_ascii=False, default=str)
        
        return True
        
    except Exception as e:
        logging.error(f"Error saving evaluation log: {e}")
        return False


def get_evaluation_statistics(log_folder: str = "evaluations") -> Dict[str, Any]:
    """
    Get statistics from evaluation logs
    
    Args:
        log_folder (str): Folder containing log files
        
    Returns:
        Dict[str, Any]: Statistics dictionary
    """
    try:
        stats = {
            "total_evaluations": 0,
            "total_accepted": 0,
            "total_rejected": 0,
            "average_score": 0.0,
            "acceptance_rate": 0.0,
            "daily_counts": {},
            "score_distribution": {
                "0-20": 0,
                "21-40": 0,
                "41-60": 0,
                "61-80": 0,
                "81-100": 0
            }
        }
        
        if not os.path.exists(log_folder):
            return stats
        
        all_scores = []
        
        # Process all log files
        for filename in os.listdir(log_folder):
            if filename.startswith("evaluation_log_") and filename.endswith(".json"):
                log_path = os.path.join(log_folder, filename)
                try:
                    with open(log_path, 'r', encoding='utf-8') as f:
                        logs = json.load(f)
                    
                    date = filename.replace("evaluation_log_", "").replace(".json", "")
                    stats["daily_counts"][date] = len(logs)
                    
                    for log_entry in logs:
                        stats["total_evaluations"] += 1
                        
                        decision = log_entry.get("decision", "UNKNOWN")
                        if decision == "ACCEPTED":
                            stats["total_accepted"] += 1
                        elif decision == "REJECTED":
                            stats["total_rejected"] += 1
                        
                        score = log_entry.get("score", 0)
                        all_scores.append(score)
                        
                        # Score distribution
                        if score <= 20:
                            stats["score_distribution"]["0-20"] += 1
                        elif score <= 40:
                            stats["score_distribution"]["21-40"] += 1
                        elif score <= 60:
                            stats["score_distribution"]["41-60"] += 1
                        elif score <= 80:
                            stats["score_distribution"]["61-80"] += 1
                        else:
                            stats["score_distribution"]["81-100"] += 1
                
                except (json.JSONDecodeError, KeyError, FileNotFoundError):
                    continue
        
        # Calculate rates and averages
        if stats["total_evaluations"] > 0:
            stats["acceptance_rate"] = (stats["total_accepted"] / stats["total_evaluations"]) * 100
            stats["average_score"] = sum(all_scores) / len(all_scores)
        
        return stats
        
    except Exception as e:
        logging.error(f"Error getting evaluation statistics: {e}")
        return {}


def cleanup_old_logs(log_folder: str = "evaluations", days_to_keep: int = 30) -> bool:
    """
    Clean up old log files
    
    Args:
        log_folder (str): Folder containing log files
        days_to_keep (int): Number of days to keep logs
        
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        if not os.path.exists(log_folder):
            return True
        
        cutoff_date = datetime.now() - timedelta(days=days_to_keep)
        deleted_count = 0
        
        for filename in os.listdir(log_folder):
            if filename.startswith("evaluation_log_") and filename.endswith(".json"):
                try:
                    date_str = filename.replace("evaluation_log_", "").replace(".json", "")
                    file_date = datetime.strptime(date_str, "%Y%m%d")
                    
                    if file_date < cutoff_date:
                        log_path = os.path.join(log_folder, filename)
                        os.remove(log_path)
                        deleted_count += 1
                        
                except (ValueError, OSError):
                    continue
        
        logging.info(f"Cleaned up {deleted_count} old log files")
        return True
        
    except Exception as e:
        logging.error(f"Error cleaning up old logs: {e}")
        return False 