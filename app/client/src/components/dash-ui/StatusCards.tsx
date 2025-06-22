import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import {
  IoPersonOutline,
  IoBriefcaseOutline,
  IoTimeOutline,
  IoFolderOpenOutline,
} from "react-icons/io5";

interface StatusCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  change: {
    value: string;
    isPositive: boolean;
  };
  lastUpdate: string;
}

function StatusCard({
  title,
  value,
  icon,
  change,
  lastUpdate,
}: StatusCardProps) {
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
          Update: {lastUpdate}
        </p>
      </div>
    </Card>
  );
}

const statusData = [
  {
    title: "Total Employee",
    value: "560",
    icon: <IoPersonOutline className="h-5 w-5" />,
    change: {
      value: "12%",
      isPositive: true,
    },
    lastUpdate: "July 16, 2023",
  },
  {
    title: "Total Applicant",
    value: "1050",
    icon: <IoBriefcaseOutline className="h-5 w-5" />,
    change: {
      value: "5%",
      isPositive: true,
    },
    lastUpdate: "July 14, 2023",
  },
  {
    title: "Today Attendance",
    value: "470",
    icon: <IoTimeOutline className="h-5 w-5" />,
    change: {
      value: "8%",
      isPositive: false,
    },
    lastUpdate: "July 14, 2023",
  },
  {
    title: "Total Projects",
    value: "250",
    icon: <IoFolderOpenOutline className="h-5 w-5" />,
    change: {
      value: "12%",
      isPositive: true,
    },
    lastUpdate: "July 10, 2023",
  },
];

export function StatusCards() {
  return (
    <div className="grid grid-cols-2 gap-2">
      {statusData.map((data, index) => (
        <StatusCard key={index} {...data} />
      ))}
    </div>
  );
}
