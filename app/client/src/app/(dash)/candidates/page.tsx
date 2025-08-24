"use client";
import { SearchInput } from "@/components/searchInput";
import { Card, CardHeader } from "@/components/ui/card";
import React, { useEffect, useState } from "react";
import { CustomTableContainer } from "../all-employees/components/CustomTableContainer";
import { Pagination } from "@/components/Pagination";
import { Candidate, Job, useJob } from "@/context/JobContext";
import LoadingComponent from "@/components/LoadingComponent";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FaEye, FaFilePdf, FaTrash } from "react-icons/fa";
import { CandidateInfoModal } from "./CandidateInfoModel";
import { toast } from "sonner";
import { FaSpinner } from "react-icons/fa6";
import { handleCVLink } from "@/lib/utils";

export default function CandidatesPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const {
    getCandidates,
    getAllJobs,
    jobs,
    total_applications,
    candidates: candidateData,
    loading,
    error,
    clearError,
  } = useJob();

  useEffect(() => {
    getAllJobs();
    getCandidates();
  }, [getCandidates, getAllJobs]);

  useEffect(() => {
    setCandidates(
      candidateData?.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      )
    );
  }, [candidateData, currentPage, itemsPerPage]);

  if (loading) {
    return <LoadingComponent />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="text-red-500 text-lg font-bold">Error: {error}</div>
        <Button variant="outline" onClick={() => clearError()}>
          Clear Error
        </Button>
      </div>
    );
  }

  return (
    <Card className="p-4">
      <CardHeader className="flex flex-row justify-between items-center">
        <SearchInput />
        <span className="font-bold text-gray-500">
          {total_applications} Candidates
        </span>
      </CardHeader>
      <CandidatesTable candidates={candidates} jobs={jobs} />
      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(candidateData?.length / itemsPerPage)}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        totalItems={candidateData?.length}
        onItemsPerPageChange={setItemsPerPage}
      />
    </Card>
  );
}

const colors = {
  REJECTED: "bg-red-500/20 text-red-500",
  QUIZ_SENT: "bg-yellow-500/20 text-yellow-500",
  QUIZ_COMPLETED: "bg-blue-500/20 text-blue-500",
  INTERVIEW_SCHEDULED: "bg-green-500/20 text-green-500",
};

const getText = (status: string) => {
  switch (status) {
    case "REJECTED":
      return "Rejected";
    case "QUIZ_SENT":
      return "Quiz Sent";
    case "QUIZ_COMPLETED":
      return "Quiz Completed";
    case "INTERVIEW_SCHEDULED":
      return "Interview Scheduled";
    default:
      return status;
  }
};

function CandidatesTable({
  candidates,
  jobs,
}: {
  candidates: Candidate[];
  jobs: Job[];
}) {
  const [open, setOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
    null
  );
  const [jobTitle, setJobTitle] = useState<string | undefined>(undefined);
  const { deleteApplication, deleteLoading } = useJob();

  const handleDelete = (id: string) => {
    toast.warning("Are you sure you want to delete this candidate?", {
      position: "top-center",
      action: {
        label: "Delete",
        onClick: () => {
          deleteApplication(id);
          toast.success("Candidate deleted successfully");
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
    });
  };

  return (
    <CustomTableContainer>
      <thead className="sticky top-0 bg-background shadow-sm">
        <tr className="*:px-6 *:py-4 *:text-left *:text-xs *:font-medium *:text-gray-500 *:uppercase border-b border-hrms-gray/20">
          <th>Candidate Name</th>
          <th>Applied For</th>
          <th>Resume Link</th>
          <th>CV Score</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-hrms-gray/20">
        {candidates?.map((cand) => (
          <tr
            key={cand.application_id}
            className="hover:bg-hrms-gray/20 *:text-sm *:px-6 *:py-3 "
          >
            <td className="capitalize">{cand.candidate_name}</td>
            <td className="capitalize">
              {jobs.find((job) => job.job_id === cand.job_id)?.title}
            </td>
            <td className="capitalize">
              <Link
                href={handleCVLink(cand.cv_filename)}
                className="flex items-center gap-2 hover:text-primary"
                target="_blank"
              >
                <FaFilePdf className="w-4 h-4 " />
                <span className="">Resume Link</span>
              </Link>
            </td>
            <td className="text-center">
              {cand.cv_score ? cand.cv_score : "-"}
            </td>
            <td className="px-4 py-2 w-52">
              <span
                className={`rounded-lg text-xs px-2 py-1 ${
                  colors[cand.status as keyof typeof colors]
                }`}
              >
                {getText(cand.status)}
              </span>
            </td>
            <td className="flex gap-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSelectedCandidate(cand);
                  setOpen(true);
                  setJobTitle(
                    jobs.find((job) => job.job_id === cand.job_id)?.title ||
                      null
                  );
                }}
              >
                <FaEye />
              </Button>
              <Button
                variant="outline"
                className="w-full"
                disabled={deleteLoading}
                onClick={() => {
                  handleDelete(cand.application_id);
                }}
              >
                {deleteLoading ? (
                  <FaSpinner className="w-4 h-4 animate-spin" />
                ) : (
                  <FaTrash />
                )}
              </Button>
            </td>
          </tr>
        ))}
        {!candidates ||
          (candidates?.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center pt-4 text-yellow-500">
                No candidates yet
              </td>
            </tr>
          ))}
      </tbody>
      <CandidateInfoModal
        open={open}
        onOpenChange={setOpen}
        candidate={selectedCandidate}
        jobTitle={jobTitle}
      />
    </CustomTableContainer>
  );
}
