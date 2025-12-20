'use client';

import { Sidebar, SidebarProvider, useSidebar } from '@/components/layouts';
import StudentHeader from '@/components/layouts/StudentHeader';
import { useRequireRole } from '@/hooks/useAuth';
import { getCurrentUser, getUserRole } from '@/lib/auth';
import { cn } from '@/lib/utils';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading } = useRequireRole(['STUDENT']);
  const user = getCurrentUser();
  const role = getUserRole(user);

  // Map role name to sidebar role prop
  const sidebarRole = 'student';

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
        <StudentHeader />
        
        {/* Main Content - With margin for sidebar and padding for header */}
        <StudentContent>
          {children}
        </StudentContent>
      </div>
    </SidebarProvider>
  );
}

// Separate component to use sidebar context
function StudentContent({ children }: { children: React.ReactNode }) {
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

