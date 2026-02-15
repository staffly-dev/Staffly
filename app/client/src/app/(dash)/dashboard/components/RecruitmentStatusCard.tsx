"use client";
import ErrorComponent from "@/components/ErrorComponent";
import LoadingComponent from "@/components/LoadingComponent";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FaCheckCircle } from "react-icons/fa";
import { IoPersonAdd } from "react-icons/io5";
import { SiSpeedtest } from "react-icons/si";
import { TbAlarmAverage } from "react-icons/tb";
import { RiPassValidFill } from "react-icons/ri";
import { useAdminStatistics } from "@/hooks/useJobs";

export const RecruitmentStatusCard = () => {
  const { data, isLoading, error } = useAdminStatistics();

  console.log("data from useAdminStatistics in RecruitmentStatusCard", data);

  if (isLoading) {
    return <LoadingComponent className="h-[320px]" />;
  }

  if (error) {
    return <ErrorComponent error={error.message} clearError={() => {}} />;
  }

  return (
    <Card className="bg-transparent border-hrms-gray/20">
      <CardHeader>
        <CardTitle className="md:text-2xl">Recruitment Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center border-b border-hrms-gray/20">
            <p>Total Applications</p>
            <div className="text-foreground bg-primary/25 py-2 px-4 rounded-md text-center flex items-center gap-2">
              {data?.total_applications}
              <IoPersonAdd />
            </div>
          </div>
          <div className="flex justify-between items-center border-b border-hrms-gray/20">
            <p>Total Evaluations</p>
            <div className="text-foreground bg-primary/25 py-2 px-4 rounded-md text-center flex items-center gap-2">
              {data?.total_evaluations}
              <SiSpeedtest />
            </div>
          </div>
          <div className="flex justify-between items-center border-b border-hrms-gray/20">
            <p>Acceptance Rate</p>
            <div className="bg-primary/25 py-2 px-4 rounded-md text-center flex items-center gap-2">
              {data?.acceptance_rate}
              <FaCheckCircle />
            </div>
          </div>
          <div className="flex justify-between items-center border-b border-hrms-gray/20">
            <p>Average Score</p>
            <div className="bg-primary/25 py-2 px-4 rounded-md text-center flex items-center gap-2">
              {data?.average_score}
              <RiPassValidFill />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <p>Quiz Pass Rate</p>
            <div className="bg-primary/25 py-2 px-4 rounded-md text-center flex items-center gap-2">
              {data?.quiz_pass_rate}
              <TbAlarmAverage />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
