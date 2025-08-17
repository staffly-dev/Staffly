"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import axiosInstance from "@/lib/axiosInstance";

// Job type definition
export interface Job {
  job_id: string;
  title: string;
  created_at: Date;
  description: string;
  required_skills: string[];
  is_active: boolean;
  shareable_link: string;
}

export interface CreateJobData {
  [key: string]: string | number | boolean | File;
}

export interface JobApplicationData {
  candidate_name: string;
  candidate_email: string;
  cv_file: File;
  job_id: string;
}

export interface ResponseError {
  detail: [{ msg: string }];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct_answer: number;
}

export interface QuizData {
  quiz_session_id: string;
  application_id: string;
  questions: QuizQuestion[];
  total_questions: number;
  time_limit_seconds: number;
  pass_threshold: number;
  job_title: string;
  job_description: string;
  started_at: Date;
  completed_at: Date;
  candidate_email: string;
  status: string;
}

// export interface QuizResponse {
//   success: boolean;
//   message: string;
//   data: QuizData;
// }

interface QuizUser {
  quiz_session_id: string;
  candidate_email: string;
  quiz_link: string;
  job_info: Job;
  status: string;
  score: number | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
}

interface QuizResult {
  score: number;
  passed: boolean;
  [key: string]: unknown;
}
export interface QuizSubmitData {
  answers: string;
  quiz_session_id: string;
  email: string;
}

export interface Candidate {
  candidate_name: string;
  candidate_email: string;
  application_id: string;
  job_id: string;
  status: string;
  cv_score: number;
  created_at: string;
  quiz_score: number;
  decision: string;
  cv_filename: string;
}
export interface CandidateResponse {
  applications: Candidate[];
  total_applications: number;
}

export interface AdminStatistics {
  total_applications: number;
  total_evaluations: number;
  acceptance_rate: number;
  average_score: number;
  quiz_pass_rate: number;
  daily_stats: {
    [key: string]: number;
  };
}

interface JobContextType {
  candidates: Candidate[];
  total_applications: number;
  jobs: Job[];
  loading: boolean;
  error: string | null;
  deleteLoading: boolean;
  getAllJobs: () => Promise<Job[]>;
  getJobById: (id: string) => Promise<Job>;
  createJob: (jobData: CreateJobData) => Promise<Job>;
  applyForJob: (
    jobId: string,
    application: JobApplicationData
  ) => Promise<unknown>;
  clearError: () => void;
  getQuizBySessionId: (quizSessionId: string) => Promise<QuizData>;
  getAllQuizUsers: () => Promise<QuizUser[]>;
  submitQuiz: (params: QuizSubmitData) => Promise<QuizResult>;
  getCandidates: () => Promise<CandidateResponse>;
  getAdminStatistics: () => Promise<AdminStatistics>;
  deleteApplication: (id: string) => Promise<unknown>;
  deleteJob: (id: string) => Promise<unknown>;
}

const JobContext = createContext<JobContextType | undefined>(undefined);

export function JobProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total_applications, setTotalApplications] = useState(0);
  const clearError = useCallback(() => setError(null), []);

  const getAllJobs = useCallback(async (): Promise<Job[]> => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(`/jobs`);
      setJobs(response.data);
      return response.data;
    } catch (err: unknown) {
      const errorMessage =
        (err as unknown as { response: { data: { message: string } } }).response
          ?.data.message || "Failed to Get jobs";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const getJobById = useCallback(async (id: string): Promise<Job> => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(`/jobs/${id}`);
      return response.data;
    } catch (err: unknown) {
      const errorMessage =
        (err as unknown as { response: { data: { message: string } } }).response
          ?.data.message || "Failed to Get job";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const createJob = useCallback(
    async (jobData: CreateJobData): Promise<Job> => {
      setLoading(true);
      setError(null);
      try {
        const response = await axiosInstance.post(`/jobs`, jobData);
        const newJob = response.data;
        setJobs((prev) => [...prev, newJob]);
        return newJob;
      } catch (err: unknown) {
        const errorMessage =
          (err as unknown as { response: { data: { message: string } } })
            .response?.data.message || "Failed to create job";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const applyForJob = useCallback(
    async (
      jobId: string,
      application: JobApplicationData
    ): Promise<unknown> => {
      setLoading(true);
      setError(null);
      try {
        const response = await axiosInstance.post(
          `/jobs/${jobId}/apply`,
          application
        );
        return response.data;
      } catch (err: unknown) {
        const errorMessage =
          (err as unknown as { response: { data: { message: string } } })
            .response?.data.message || "Failed to apply for job";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Quiz functions
  const getQuizBySessionId = useCallback(
    async (quizSessionId: string): Promise<QuizData> => {
      setLoading(true);
      setError(null);
      try {
        const response = await axiosInstance.get(`/quiz/${quizSessionId}`);
        return response.data?.data;
      } catch (err: unknown) {
        const errorMessage =
          (err as unknown as { response: { data: { message: string } } })
            .response?.data.message || "Failed to get quiz";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getAllQuizUsers = useCallback(async (): Promise<QuizUser[]> => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(`/quiz/users`);
      return response.data;
    } catch (err: unknown) {
      const errorMessage =
        (err as unknown as { response: { data: { message: string } } }).response
          ?.data.message || "Failed to get quiz users";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const getCandidates = useCallback(async (): Promise<CandidateResponse> => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(`/applications`);
      setCandidates(response.data.applications);
      setTotalApplications(response.data.total_applications);
      return response.data;
    } catch (err: unknown) {
      const errorMessage =
        (err as unknown as { response: { data: { message: string } } }).response
          ?.data.message || "Failed to get candidates";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const getAdminStatistics = useCallback(async (): Promise<AdminStatistics> => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(`/statistics`);
      return response.data;
    } catch (err: unknown) {
      const errorMessage =
        (err as unknown as { response: { data: { message: string } } }).response
          ?.data.message || "Failed to get admin statistics";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const submitQuiz = useCallback(
    async ({
      answers,
      quiz_session_id,
      email,
    }: QuizSubmitData): Promise<QuizResult> => {
      setLoading(true);
      setError(null);
      try {
        const response = await axiosInstance.post(
          `/quiz/submit`,
          {
            answers,
            quiz_session_id,
            email,
          },
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Accept: "*/*",
            },
          }
        );
        return response.data;
      } catch (err: unknown) {
        const errorMessage =
          (err as unknown as { response: { data: { message: string } } })
            .response?.data.message || "Failed to submit quiz";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteApplication = useCallback(async (id: string): Promise<void> => {
    setDeleteLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.delete(`/applications/${id}`, {
        data: {
          candidate_id: id,
        },
      });
      return response.data;
    } catch (err: unknown) {
      const errorMessage =
        (err as unknown as { response: { data: { message: string } } }).response
          ?.data.message || "Failed to delete application";
      setError(errorMessage);
    } finally {
      setDeleteLoading(false);
    }
  }, []);

  const deleteJob = useCallback(async (id: string): Promise<void> => {
    setDeleteLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.delete(`/jobs/${id}`);
      setJobs((prev) => prev.filter((job) => job.job_id !== id));
      return response.data;
    } catch (err: unknown) {
      const errorMessage =
        (err as unknown as { response: { data: { message: string } } }).response
          ?.data.message || "Failed to delete job";
      setError(errorMessage);
    } finally {
      setDeleteLoading(false);
    }
  }, []);

  const value: JobContextType = {
    candidates,
    total_applications,
    jobs,
    loading,
    error,
    deleteLoading,
    getAllJobs,
    getJobById,
    createJob,
    applyForJob,
    clearError,
    getQuizBySessionId,
    getAllQuizUsers,
    submitQuiz,
    getCandidates,
    getAdminStatistics,
    deleteApplication,
    deleteJob,
  };

  return <JobContext.Provider value={value}>{children}</JobContext.Provider>;
}

export function useJob() {
  const context = useContext(JobContext);
  if (!context) {
    throw new Error("useJob must be used within a JobProvider");
  }
  return context;
}
