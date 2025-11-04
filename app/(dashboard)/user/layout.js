import UserSidebar from "@/components/dashboard/shared/UserSidebar";
import { UserHeader } from "@/components/dashboard/user/user-header";

export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen bg-gray-100">
      <UserSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <UserHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
