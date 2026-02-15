"use client";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useDashboard } from "@/hooks/useAttendance";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import {
  IoPersonOutline,
  IoBriefcaseOutline,
  IoTimeOutline,
  IoFolderOpenOutline,
} from "react-icons/io5";
import LoadingComponent from "../LoadingComponent";
import ErrorComponent from "../ErrorComponent";

interface StatusCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  change: {
    value: string;
    isPositive: boolean;
  };
}

function StatusCard({ title, value, icon, change }: StatusCardProps) {
  return (
    <Card className="border-hrms-gray/20 bg-transparent">
      <div className="space-y-4">
        <div className="flex items-center justify-between px-4 pt-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 grid place-items-center text-primary">
              {icon}
            </div>
            <p className="text-sm text-muted-foreground mt-1">{title}</p>
          </div>
        </div>

        <div className="flex items-center justify-between px-4">
          <h3 className="text-3xl font-semibold">{value}</h3>
          <span
            className={cn(
              "flex items-center gap-1 p-1 rounded-md text-sm font-medium",
              change.isPositive
                ? "text-green-500 bg-green-500/30"
                : "text-red-500 bg-red-500/30"
            )}
          >
            {change.isPositive ? (
              <ArrowUpIcon className="h-4 w-4" />
            ) : (
              <ArrowDownIcon className="h-4 w-4" />
            )}
            {change.value}
          </span>
        </div>
        <div className="h-[1px] w-full bg-hrms-gray/20" />
        <p className="text-xs text-muted-foreground px-4 pb-2">
          Update: {new Date().toLocaleDateString()}
        </p>
      </div>
    </Card>
  );
}

const statusData = [
  {
    title: "Total Employees",
    icon: <IoPersonOutline className="h-5 w-5" />,
    value: "0",
    change: {
      value: "12%",
      isPositive: true,
    },
  },
  {
    title: "Total Applicants",
    icon: <IoBriefcaseOutline className="h-5 w-5" />,
    value: "0",
    change: {
      value: "5%",
      isPositive: true,
    },
  },
  {
    title: "Today's Attendance",
    icon: <IoTimeOutline className="h-5 w-5" />,
    value: "0",
    change: {
      value: "8%",
      isPositive: false,
    },
  },
  {
    title: "Total Jobs Posted",
    icon: <IoFolderOpenOutline className="h-5 w-5" />,
    value: "0",
    change: {
      value: "12%",
      isPositive: true,
    },
  },
];

export function StatusCards() {
  const {
    data: dashboardData,
    isLoading: isLoadingDashboard,
    error,
  } = useDashboard();

  if (isLoadingDashboard) {
    return <LoadingComponent className="h-[320px]" />;
  }

  if (error) {
    return (
      <ErrorComponent
        error="Failed to load dashboard data"
        clearError={() => {}}
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      <StatusCard
        {...statusData[0]}
        value={dashboardData?.totalEmployees || 0}
      />
      <StatusCard
        {...statusData[1]}
        value={dashboardData?.totelApplicant || 0}
      />
      <StatusCard
        {...statusData[2]}
        value={dashboardData?.totalAttendance || 0}
      />
      <StatusCard
        {...statusData[3]}
        value={dashboardData?.totalProjects || 0}
      />
    </div>
  );
}
