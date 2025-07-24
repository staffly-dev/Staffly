"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import axios from "axios";

// Job type definition
export interface Job {
  id: string;
  title: string;
  department: string;
  description: string;
  status: "active" | "in-active" | "completed";
  location: string;
  tags: string[];
  salary: number;
}

export interface CreateJobData {
  title: string;
  department: string;
  description: string;
  location: string;
  tags?: string[];
  salary: number;
  status?: "active" | "in-active" | "completed";
}

export interface JobApplicationData {
  name: string;
  email: string;
  resumeUrl: string;
  [key: string]: unknown;
}

interface JobContextType {
  jobs: Job[];
  loading: boolean;
  error: string | null;
  getAllJobs: () => Promise<Job[]>;
  getJobById: (id: string) => Promise<Job>;
  createJob: (jobData: CreateJobData) => Promise<Job>;
  applyForJob: (
    jobId: string,
    application: JobApplicationData
  ) => Promise<unknown>;
  clearError: () => void;
}

const JobContext = createContext<JobContextType | undefined>(undefined);

const JOBS_API_BASE = process.env.NEXT_PUBLIC_API_JOBS;

export function JobProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const getAllJobs = useCallback(async (): Promise<Job[]> => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${JOBS_API_BASE}/api/jobs`);
      setJobs(response.data.jobs || response.data);
      return response.data.jobs || response.data;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch jobs";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const getJobById = useCallback(async (id: string): Promise<Job> => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${JOBS_API_BASE}/api/jobs/${id}`);
      return response.data.job || response.data;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch job details";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const createJob = useCallback(
    async (jobData: CreateJobData): Promise<Job> => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.post(`${JOBS_API_BASE}/api/jobs`, jobData);
        const newJob = response.data.job || response.data;
        setJobs((prev) => [...prev, newJob]);
        return newJob;
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create job";
        setError(errorMessage);
        throw new Error(errorMessage);
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
        const response = await axios.post(
          `${JOBS_API_BASE}/api/jobs/${jobId}/apply`,
          application
        );
        return response.data;
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to apply for job";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const value: JobContextType = {
    jobs,
    loading,
    error,
    getAllJobs,
    getJobById,
    createJob,
    applyForJob,
    clearError,
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
