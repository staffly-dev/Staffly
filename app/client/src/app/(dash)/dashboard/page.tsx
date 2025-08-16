import { StatusCards } from "@/components/dash-ui/StatusCards";
import { AttendanceOverview } from "./components/AttendanceOverview";
import { RecruitmentStatusCard } from "./components/RecruitmentStatusCard";

export default function page() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid lg:grid-cols-2 gap-2">
        <StatusCards />
        <RecruitmentStatusCard />
      </div>
      <AttendanceOverview />
    </div>
  );
}
