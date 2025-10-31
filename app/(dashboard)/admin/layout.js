'use client';

import { useState } from 'react';
import { AdminSidebar } from "@/components/dashboard/admin/admin-sidebar";
import { AdminHeader } from "@/components/dashboard/admin/admin-header";

export default function AdminDashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true); // Initial state for sidebar

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <AdminHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
