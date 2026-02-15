import fs from "fs";
import path from "path";

const LOG_LEVELS: Record<string, number> = {
  'DEBUG': 0,
  'INFO': 1,
  'WARNING': 2,
  'ERROR': 3,
  'CRITICAL': 4
};

export function setup_logging(log_level: string = "INFO", log_file: string = "ats_system.log"): void {
  const level = LOG_LEVELS[log_level.toUpperCase()] ?? 1;
  
  // Create logs directory if it doesn't exist
  const log_dir = path.dirname(log_file);
  if (log_dir !== "." && !fs.existsSync(log_dir)) {
    fs.mkdirSync(log_dir, { recursive: true });
  }
  
  // Note: In Node.js, we typically use winston or another logging library
  // For now, we'll use console with basic formatting
  console.log(`Logging configured - Level: ${log_level}, File: ${log_file}`);
}

export function get_logger(name: string): Console {
  // Return console for now - can be replaced with winston or another logger
  return console;
}

