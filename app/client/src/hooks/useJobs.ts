import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axiosInstance";
import axios from "axios";
import { useAuth } from "./useAuth";
import { tokenStore } from "@/lib/token";

// Job type definition
export interface Job {
  job_id: string;
  title: string;
  created_at: Date;
  description: string;
  required_skills: string[];
  is_active: boolean;
  shareable_link: string;
  created_by: string;
}

export interface JobResponse {
  jobs: Job[];
  total_jobs: number;
}

export interface CreateJobData {
  title: string;
  description: string;
  required_skills: string;
  hr_email?: string;
  additional_details?: string;
  hr_name?: string;
  evaluation_threshold?: number;
  quiz_required?: boolean;
  quiz_pass_threshold?: number;
  is_active?: boolean;
  user_id: string;
  access_token: string;
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

export interface S3Params {
  key: string;
}

// Query keys
export const jobKeys = {
  all: ["jobs"] as const,
  lists: () => [...jobKeys.all, "list"] as const,
  list: (filters?: string) => [...jobKeys.lists(), { filters }] as const,
  details: () => [...jobKeys.all, "detail"] as const,
  detail: (id: string) => [...jobKeys.details(), id] as const,
  candidates: () => [...jobKeys.all, "candidates"] as const,
  statistics: () => [...jobKeys.all, "statistics"] as const,
  quizUsers: () => [...jobKeys.all, "quizUsers"] as const,
};

const ATS_URL = process.env.NEXT_PUBLIC_ATS_ERL;
const ATS_DIRECT_URL =
  "https://ats-system-checker-backend-production.up.railway.app";

// Fetch all jobs (no auth required - uses direct ATS URL)
export const useJobs = () => {
  return useQuery({
    queryKey: jobKeys.lists(),
    queryFn: async (): Promise<Job[]> => {
      const response = await axios.get(`${ATS_DIRECT_URL}/ats-checker/jobs`);
      return (response.data.jobs ?? []) as Job[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Fetch job by ID
export const useJob = (id: string) => {
  return useQuery({
    queryKey: jobKeys.detail(id),
    queryFn: async (): Promise<Job> => {
      const response = await axios.get(`${ATS_URL}/ats-checker/jobs/${id}`);
      return response.data;
    },
    enabled: !!id,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Create job
export const useCreateJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jobData: CreateJobData): Promise<Job> => {
      const response = await axiosInstance.post(`/ats-checker/jobs`, jobData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      return response.data;
    },
    onSuccess: (newJob) => {
      // Invalidate and refetch jobs list
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });

      // Update the cache with the new job
      queryClient.setQueryData(jobKeys.lists(), (old: Job[] | undefined) => {
        return old ? [...old, newJob] : [newJob];
      });
    },
  });
};

// Apply for job
export const useApplyForJob = () => {
  return useMutation({
    mutationFn: async ({
      jobId,
      application,
    }: {
      jobId: string;
      application: JobApplicationData;
    }): Promise<unknown> => {
      const response = await axios.post(
        `${ATS_URL}/ats-checker/jobs/${jobId}/apply`,
        application,
      );
      return response.data;
    },
  });
};

// Get quiz by session ID
export const useQuizBySessionId = (quizSessionId: string) => {
  return useQuery({
    queryKey: [...jobKeys.all, "quiz", quizSessionId],
    queryFn: async (): Promise<QuizData> => {
      const response = await axiosInstance.get(
        `/ats-checker/quiz/${quizSessionId}`,
      );
      return response.data?.data;
    },
    enabled: !!quizSessionId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Get all quiz users
export const useQuizUsers = () => {
  return useQuery({
    queryKey: jobKeys.quizUsers(),
    queryFn: async (): Promise<QuizUser[]> => {
      const response = await axiosInstance.get(`/ats-checker/quiz/users`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Get candidates (backend expects POST for list, not GET)
export const useCandidates = () => {
  const { userId, isLoadingUser } = useAuth();

  return useQuery({
    queryKey: [...jobKeys.candidates(), userId],
    queryFn: async (): Promise<CandidateResponse> => {
      if (!userId) return { applications: [], total_applications: 0 };
      const accessToken = tokenStore.getAccessToken();
      const response = await axiosInstance.post<CandidateResponse>(
        `/ats-checker/applications`,
        {
          user_id: userId,
          created_by: userId,
          access_token: accessToken ?? "",
        },
        {
          headers: {
            "X-User-Id": userId,
            "Content-Type": "application/json",
          },
        },
      );
      return response.data;
    },
    enabled: !!userId && !isLoadingUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Get admin statistics
export const useAdminStatistics = () => {
  return useQuery({
    queryKey: jobKeys.statistics(),
    queryFn: async (): Promise<AdminStatistics> => {
      const response = await axiosInstance.get(`/ats-checker/statistics`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Submit quiz
export const useSubmitQuiz = () => {
  return useMutation({
    mutationFn: async (params: QuizSubmitData): Promise<QuizResult> => {
      const response = await axiosInstance.post(
        `/ats-checker/quiz/submit`,
        {
          answers: params.answers,
          quiz_session_id: params.quiz_session_id,
          email: params.email,
        },
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Accept: "*/*",
          },
        },
      );
      return response.data;
    },
  });
};

// Get S3 params
export const useS3Params = (key: string) => {
  return useQuery({
    queryKey: [...jobKeys.all, "s3", key],
    queryFn: async (): Promise<S3Params> => {
      const response = await axiosInstance.get(`/ats-checker/s3/file/${key}`);
      return response.data;
    },
    enabled: !!key,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Delete application
export const useDeleteApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await axiosInstance.delete(`/ats-checker/applications/${id}`, {
        data: {
          candidate_id: id,
        },
      });
    },
    onSuccess: () => {
      // Invalidate candidates query to refetch data
      queryClient.invalidateQueries({ queryKey: jobKeys.candidates() });
    },
  });
};

// Delete job
export const useDeleteJob = () => {
  const queryClient = useQueryClient();
  const { userId } = useAuth();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      if (!userId) throw new Error("User not authenticated");
      await axiosInstance.delete(`/ats-checker/jobs/${id}`, {
        headers: {
          "X-User-Id": userId,
        },
      });
    },
    onSuccess: (_, id) => {
      // Invalidate and refetch jobs list
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });

      // Remove the job from the list cache
      queryClient.setQueryData(jobKeys.lists(), (old: Job[] | undefined) => {
        return old ? old.filter((job) => job.job_id !== id) : old;
      });

      // Remove the specific job from cache
      queryClient.removeQueries({ queryKey: jobKeys.detail(id) });
    },
  });
};
