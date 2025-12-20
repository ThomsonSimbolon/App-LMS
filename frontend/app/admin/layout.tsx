'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layouts';
import { SidebarProvider, useSidebar } from '@/components/layouts/SidebarContext';
import AdminHeader from '@/components/layouts/AdminHeader';
import { useRequireRole } from '@/hooks/useAuth';
import { getCurrentUser, getUserRole } from '@/lib/auth';
import { cn } from '@/lib/utils';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading } = useRequireRole(['ADMIN', 'SUPER_ADMIN']);
  const [sidebarRole, setSidebarRole] = useState<'admin' | 'super_admin' | 'assessor' | 'student'>('admin');

  // Determine sidebar role on client-side only to avoid hydration mismatch
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const user = getCurrentUser();
      const role = getUserRole(user);
      const roleValue = role === 'SUPER_ADMIN' ? 'super_admin' : 
                       role === 'ADMIN' ? 'admin' : 
                       role === 'ASSESSOR' ? 'assessor' : 'admin';
      setSidebarRole(roleValue);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
        {/* Sidebar - Full height from top to bottom */}
        <Sidebar role={sidebarRole} />
        
        {/* Header - Connected to sidebar (starts from right of sidebar) */}
        <AdminHeader />
        
        {/* Main Content - With margin for sidebar and padding for header */}
        <AdminContent>
          {children}
        </AdminContent>
      </div>
    </SidebarProvider>
  );
}

// Separate component to use sidebar context
function AdminContent({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();
  
  return (
    <main 
      className={cn(
        "pt-16 min-h-screen transition-all duration-300 ease-in-out",
        collapsed ? "ml-16" : "ml-64"
      )}
    >
      <div className={cn(
        "py-8 transition-all duration-300 ease-in-out",
        collapsed 
          ? "w-full px-4 sm:px-6 lg:px-8" 
          : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      )}>
        {children}
      </div>
    </main>
  );
}
