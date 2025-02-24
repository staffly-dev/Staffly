import { Navbar } from "./navbar";
import { Sidebar } from "./sidebar";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 lg:px-6 px-4">
          <Navbar />
          <div className="py-4">{children}</div>
        </main>
      </div>
    </div>
  );
}
