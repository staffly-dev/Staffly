"use client";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

function getGreeting() {
  const date = new Date();
  const hours = date.getHours();
  if (hours < 12) return "Morning";
  if (hours >= 12 && hours < 17) return "Afternoon";
  return "Evening";
}
function getSubTitle(pathname: string, name?: string) {
  const pages = {
    dashboard: {
      title: `Hello ${name} 👋🏻`,
      subtitle: "Good " + getGreeting(),
    },
    "all-departments": {
      title: "All Departments",
      subtitle: "All Department info",
    },
    "all-employees": {
      title: "All Employees",
      subtitle: "All Employees info",
    },
    attendance: {
      title: "Attendance",
      subtitle: "All Employees Attendance",
    },
    holidays: {
      title: "Holidays",
      subtitle: "All Holidays info",
    },
    jobs: {
      title: "Jobs",
      subtitle: "All Jobs Listed",
    },
    leaves: {
      title: "Leaves",
      subtitle: "All Leave info",
    },
    payroll: {
      title: "Payroll",
      subtitle: "All Employees Payroll",
    },
    settings: {
      title: "Settings",
      subtitle: "All Settings Report",
    },
    notifications: {
      title: "Notifications",
      subtitle: "All Notifications",
    },
    candidates: {
      title: "Candidates",
      subtitle: "Show All Candidates",
    },
  };
  return pages[pathname as keyof typeof pages];
}

export function Breadcrumbs({ name }: { name?: string }) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const unhandeldTitle = segments[segments.length - 1];
  const subtitle = getSubTitle(unhandeldTitle, name)?.subtitle;
  const title =
    getSubTitle(unhandeldTitle, name)?.title ||
    unhandeldTitle.split("-").join(" ");

  return (
    <>
      {subtitle ? (
        <>
          <h2 className="font-bold capitalize">{title}</h2>
          <p className="text-muted-foreground text-sm">{subtitle}</p>
        </>
      ) : (
        <>
          <h2 className="font-bold capitalize">{title}</h2>
          <Breadcrumb>
            <BreadcrumbList>
              {segments.map((segment, index) => {
                const href = `/${segments.slice(0, index + 1).join("/")}`;
                const isLast = index === segments.length - 1;
                const segmentURL = decodeURIComponent(segment);
                const segmentTitle = segmentURL.split("-").join(" ");

                return (
                  <BreadcrumbItem key={`${segment}-${index}`}>
                    {index > 0 && <p> {"/"} </p>}
                    {isLast ? (
                      <BreadcrumbPage className="capitalize">
                        {segmentTitle}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink className="capitalize" href={href}>
                        {segmentTitle}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
        </>
      )}
    </>
  );
}
