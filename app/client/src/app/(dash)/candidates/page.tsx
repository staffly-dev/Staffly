"use client";
import { SearchInput } from "@/components/searchInput";
import { Card, CardHeader } from "@/components/ui/card";
import React, { useEffect, useState } from "react";
import { CustomTableContainer } from "../all-employees/components/CustomTableContainer";
import { Pagination } from "@/components/Pagination";
// import { Checkbox } from "@/components/ui/checkbox";
import { Candidate, Job, useJob } from "@/context/JobContext";
import LoadingComponent from "@/components/LoadingComponent";
import { Button } from "@/components/ui/button";

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
      candidateData.slice(
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
        totalPages={Math.ceil(candidateData.length / itemsPerPage)}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        totalItems={candidateData.length}
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
  // const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // const allSelected =
  //   candidates.length > 0 && selectedIds.length === candidates.length;
  // const someSelected =
  //   selectedIds.length > 0 && selectedIds.length < candidates.length;

  // const toggleAll = (checked: boolean) => {
  //   setSelectedIds(
  //     checked ? candidates.map((cand) => cand.application_id) : []
  //   );
  // };

  // const toggleOne = (id: string, checked: boolean) => {
  //   setSelectedIds((prev) =>
  //     checked ? [...prev, id] : prev.filter((selectedId) => selectedId !== id)
  //   );
  // };

  return (
    <CustomTableContainer>
      <thead className="sticky top-0 bg-background shadow-sm">
        <tr className="*:px-6 *:py-4 *:text-left *:text-xs *:font-medium *:text-gray-500 *:uppercase border-b border-hrms-gray/20">
          {/* <th>
            <Checkbox
              className="border-hrms-gray"
              checked={someSelected ? "indeterminate" : allSelected}
              onCheckedChange={toggleAll}
            />
          </th> */}
          <th>Name</th>
          <th>Applied For</th>
          <th>CV File Name </th>
          <th>Email</th>
          <th className="w-32">ATS Score</th>
          <th className="text-center">Quiz Score</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-hrms-gray/20">
        {candidates.map((cand) => (
          <tr
            key={cand.application_id}
            className="hover:bg-hrms-gray/20 *:text-sm *:px-6 *:py-3 *:capitalize"
          >
            {/* <td>
              <Checkbox
                className="border-hrms-gray"
                checked={selectedIds.includes(cand.application_id)}
                onCheckedChange={(checked) =>
                  toggleOne(cand.application_id, Boolean(checked))
                }
              />
            </td> */}
            <td>{cand.candidate_name}</td>
            <td>{jobs.find((job) => job.job_id === cand.job_id)?.title}</td>
            <td>{cand.cv_filename}</td>
            <td>{cand.candidate_email}</td>
            <td className="text-center">
              {cand.cv_score ? cand.cv_score : "-"}
            </td>
            <td className="text-center">
              {cand.quiz_score ? cand.quiz_score : "-"}
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
          </tr>
        ))}
      </tbody>
    </CustomTableContainer>
  );
}
