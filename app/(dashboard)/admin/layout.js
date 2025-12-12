'use client';

import { useState } from 'react';
import { AdminSidebar } from "@/components/dashboard/shared/AdminSidebar";
import { AdminHeader } from "@/components/dashboard/admin/admin-header";

export default function AdminDashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile drawer state (closed by default)

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar overlay"
        />
      )}

      {/* Sidebar - Fixed on Desktop, Drawer on Mobile */}
      <div className={`
        fixed inset-y-0 left-0 z-50
        w-64 bg-gradient-to-b from-[#0a1628] to-[#1b263b] shadow-lg transform
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
      `}>
        <AdminSidebar
          sidebarOpen={typeof window !== 'undefined' && window.innerWidth >= 1024 ? true : sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          mobileMode={typeof window !== 'undefined' && window.innerWidth < 1024}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
