export enum EvaluationDecision {
  ACCEPT = "ACCEPT",
  REJECT = "REJECT",
  REVIEW = "REVIEW",
  ACCEPTED = "ACCEPTED", // Keep for backward compatibility
  REJECTED = "REJECTED", // Keep for backward compatibility
  UNKNOWN = "UNKNOWN"    // Keep for backward compatibility
}

export interface EvaluationResult {
  decision: EvaluationDecision;
  score: number; // 0-100
  reasoning: string;
  extracted_skills: string[];
  experience_years?: number;
  match_percentage?: number;
  strengths: string[];
  weaknesses: string[];
  recommendations?: string;
}

export interface FileUploadInfo {
  filename: string;
  size_bytes: number;
  size_mb: number;
  extension: string;
  is_allowed: boolean;
  timestamp: Date;
}

export interface APIResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  timestamp: Date;
}

export interface ErrorResponse {
  error: string;
  detail?: string;
  timestamp: Date;
}

