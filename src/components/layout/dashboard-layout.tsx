import { Navbar } from "./navbar";
import { Sidebar } from "./sidebar";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <div className="fixed">
        <Sidebar />
      </div>
      <main className="ml-56 flex-1 lg:px-6 px-4">
        <Navbar />
        <div className="py-4">{children}</div>
      </main>
    </div>
  );
}
//  <div className="flex min-h-screen">
//    {/* Sidebar (Fixed) */}
//    <aside className="w-64 bg-white shadow-lg fixed h-full">
//      <Sidebar />
//    </aside>

//    {/* Main Content (Takes Remaining Space) */}
//    <main className="ml-64 flex-1 p-6 bg-gray-100">{children}</main>
//  </div>;
