import { Suspense } from "react";
import { Navbar } from "./navbar";
import { Sidebar } from "./sidebar";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <div className="fixed">
        <Sidebar />
      </div>
      <main className="ml-56 flex-1 lg:px-6 px-4">
        <Suspense fallback={<div>Loading...</div>}>
          <Navbar />
        </Suspense>
        <div className="pb-4 ">{children}</div>
      </main>
    </div>
  );
}
