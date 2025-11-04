import {VendorSidebar} from "@/components/dashboard/shared/VendorSidebar";
import { VendorHeader } from "@/components/dashboard/vendor/vendor-header";

export default function VendorDashboardLayout({ children }) {
  return (
    <div className="flex h-screen bg-gray-100">
    <VendorSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <VendorHeader />
        <main className="flex-1 overflow-y-auto bg-gray-200 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
