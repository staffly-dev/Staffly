import { StatusCards } from "@/components/dash-ui/StatusCards";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function page() {
  return (
    <div>
      <div className="dashboard-grid">
        <div className="dashboard-stats">
          <StatusCards />
        </div>

        <DashboardCard title="Attendance Charts" className="dashboard-activity">
          <div>blabla</div>
        </DashboardCard>

        <DashboardCard title="My Schedule" className="dashboard-chart">
          <div>blabla</div>
        </DashboardCard>

        <DashboardCard title="Attendance Overview" className="dashboard-table">
          <div>blabla</div>
        </DashboardCard>
      </div>
    </div>
  );
}

function DashboardCard({
  title,
  className,
  children,
}: {
  title: string;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <Card className={cn(className, "border-hrms-gray/20 bg-transparent")}>
      <div className="p-3">
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
        {children}
      </div>
    </Card>
  );
}
