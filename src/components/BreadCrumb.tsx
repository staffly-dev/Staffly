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

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const title = segments[segments.length - 1].split("-").join(" ");
  const subtitle = title == "dashboard" ? `Good ${getGreeting()}` : null;

  return (
    <>
      {subtitle ? (
        <>
          <h2 className="font-bold">Hello Mazin 👋🏻</h2>
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
