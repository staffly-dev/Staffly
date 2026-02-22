import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axiosInstance";
import axios from "axios";
import { useAuth } from "./useAuth";

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
  application_id?: string;
  questions: QuizQuestion[];
  total_questions: number;
  time_limit_seconds: number;
  pass_threshold: number;
  job_title?: string;
  job_description?: string;
  started_at?: string | Date;
  completed_at?: string | Date;
  candidate_email?: string;
  status: string;
  created_at?: string;
}

function normalizeQuizData(raw: Record<string, unknown>): QuizData {
  return {
    quiz_session_id: String(raw.quiz_session_id ?? ""),
    application_id: raw.application_id != null ? String(raw.application_id) : undefined,
    questions: Array.isArray(raw.questions) ? raw.questions as QuizQuestion[] : [],
    total_questions: Number(raw.total_questions) || 0,
    time_limit_seconds: Number(raw.time_limit_seconds) || 0,
    pass_threshold: Number(raw.pass_threshold) ?? 7,
    job_title: raw.job_title != null ? String(raw.job_title) : undefined,
    job_description: raw.job_description != null ? String(raw.job_description) : undefined,
    started_at: raw.started_at != null ? String(raw.started_at) : undefined,
    completed_at: raw.completed_at != null ? String(raw.completed_at) : undefined,
    candidate_email: raw.candidate_email != null ? String(raw.candidate_email) : undefined,
    status: String(raw.status ?? "IN_PROGRESS"),
    created_at: raw.created_at != null ? String(raw.created_at) : undefined,
  };
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

export interface InterviewDetails {
  interview_date: string;
  interview_time: string;
  interview_type: string;
  location: string;
  notes: string;
}

export interface ScheduleInterviewData {
  interview_date: string;
  interview_time: string;
  interview_type: string;
  location: string;
  notes: string;
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
  interview?: InterviewDetails | null;
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

const ATS_DIRECT_URL =
  "https://ats-system-checker-backend-production.up.railway.app";

// Fetch all jobs (no Authorization - uses direct ATS URL, sends X-User-Id)
export const useJobs = () => {
  const { userId } = useAuth();

  return useQuery({
    queryKey: [...jobKeys.lists(), userId],
    queryFn: async (): Promise<Job[]> => {
      if (!userId) return [];
      const response = await axios.get(`${ATS_DIRECT_URL}/ats-checker/jobs`, {
        headers: {
          "X-User-Id": userId,
        },
      });
      return (response.data.jobs ?? []) as Job[];
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Fetch job by ID (no Authorization - uses direct ATS URL)
export const useJob = (id: string) => {
  return useQuery({
    queryKey: jobKeys.detail(id),
    queryFn: async (): Promise<Job> => {
      const response = await axios.get(
        `${ATS_DIRECT_URL}/ats-checker/jobs/${id}`,
      );
      return response.data;
    },
    enabled: !!id,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Create job (no Authorization - uses direct ATS URL, sends X-User-Id)
export const useCreateJob = () => {
  const queryClient = useQueryClient();
  const { userId } = useAuth();

  return useMutation({
    mutationFn: async (jobData: CreateJobData): Promise<Job> => {
      const response = await axios.post(
        `${ATS_DIRECT_URL}/ats-checker/jobs`,
        jobData,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "X-User-Id": userId ?? "",
          },
        },
      );
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

// Apply for job (no auth - uses direct ATS URL, public endpoint)
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
        `${ATS_DIRECT_URL}/ats-checker/jobs/${jobId}/apply`,
        application,
      );
      return response.data;
    },
  });
};

// Get quiz by session ID (no auth - uses direct ATS URL, public/candidate-facing)
export const useQuizBySessionId = (quizSessionId: string) => {
  return useQuery({
    queryKey: [...jobKeys.all, "quiz", quizSessionId],
    queryFn: async (): Promise<QuizData> => {
      const response = await axios.get(
        `${ATS_DIRECT_URL}/ats-checker/quiz/${quizSessionId}`,
      );
      const raw = response.data?.data ?? response.data;
      if (!raw) throw new Error("No quiz data");
      return normalizeQuizData(raw);
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

// Get candidates (no Authorization - uses direct ATS URL, sends X-User-Id)
export const useCandidates = () => {
  const { userId } = useAuth();

  return useQuery({
    queryKey: [...jobKeys.candidates(), userId],
    queryFn: async (): Promise<CandidateResponse> => {
      if (!userId) return { applications: [], total_applications: 0 };
      const response = await axios.get<CandidateResponse>(
        `${ATS_DIRECT_URL}/ats-checker/applications`,
        {
          headers: {
            "X-User-Id": userId,
          },
          // created_by: userId,
        },
        // {
        //   headers: {
        //     "X-User-Id": userId,
        //     "Content-Type": "application/json",
        //   },
        // },
      );
      return response.data;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Get candidate by ID (no Authorization - uses direct ATS URL, sends X-User-Id)
export const useCandidate = (applicationId: string) => {
  const { userId } = useAuth();

  return useQuery({
    queryKey: [...jobKeys.candidates(), "detail", applicationId],
    queryFn: async (): Promise<Candidate> => {
      const response = await axios.get(
        `${ATS_DIRECT_URL}/ats-checker/applications/${applicationId}`,
        {
          headers: {
            "X-User-Id": userId ?? "",
          },
        },
      );
      return response.data;
    },
    enabled: !!applicationId && !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};

// Schedule interview for application (no Authorization - uses direct ATS URL, sends X-User-Id)
export const useScheduleInterview = () => {
  const queryClient = useQueryClient();
  const { userId } = useAuth();

  return useMutation({
    mutationFn: async ({
      applicationId,
      data,
    }: {
      applicationId: string;
      data: ScheduleInterviewData;
    }): Promise<Candidate> => {
      const response = await axios.post(
        `${ATS_DIRECT_URL}/ats-checker/applications/${applicationId}/schedule-interview`,
        data,
        {
          headers: {
            "X-User-Id": userId ?? "",
            "Content-Type": "application/json",
          },
        },
      );
      return response.data;
    },
    onSuccess: (_, { applicationId }) => {
      queryClient.invalidateQueries({ queryKey: jobKeys.candidates() });
      queryClient.invalidateQueries({
        queryKey: [...jobKeys.candidates(), "detail", applicationId],
      });
    },
  });
};

// Get admin statistics (no Authorization - uses direct ATS URL, sends X-User-Id)
export const useAdminStatistics = () => {
  const { userId } = useAuth();

  return useQuery({
    queryKey: [...jobKeys.statistics(), userId],
    queryFn: async (): Promise<AdminStatistics> => {
      if (!userId) return {} as AdminStatistics;
      const response = await axios.get(
        `${ATS_DIRECT_URL}/ats-checker/user-statistics`,
        {
          headers: {
            "X-User-Id": userId,
          },
        },
      );
      return response.data;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Submit quiz (no auth - uses direct ATS URL, public/candidate-facing)
export const useSubmitQuiz = () => {
  return useMutation({
    mutationFn: async (params: QuizSubmitData): Promise<QuizResult> => {
      const response = await axios.post(
        `${ATS_DIRECT_URL}/ats-checker/quiz/submit`,
        {
          answers: params.answers,
          quiz_session_id: params.quiz_session_id,
          email: params.email,
        },
        {
          headers: {
            "Content-Type": "application/json",
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

// Delete application (no Authorization - uses direct ATS URL, sends X-User-Id)
export const useDeleteApplication = () => {
  const queryClient = useQueryClient();
  const { userId } = useAuth();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      if (!userId) throw new Error("User not authenticated");
      await axios.delete(`${ATS_DIRECT_URL}/ats-checker/applications/${id}`, {
        data: {
          candidate_id: id,
        },
        headers: {
          "X-User-Id": userId,
        },
      });
    },
    onSuccess: () => {
      // Invalidate candidates query to refetch data
      queryClient.invalidateQueries({ queryKey: jobKeys.candidates() });
    },
  });
};

// Delete job (no Authorization - uses direct ATS URL, sends X-User-Id)
export const useDeleteJob = () => {
  const queryClient = useQueryClient();
  const { userId } = useAuth();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      if (!userId) throw new Error("User not authenticated");
      await axios.delete(`${ATS_DIRECT_URL}/ats-checker/jobs/${id}`, {
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
