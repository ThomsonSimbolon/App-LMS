"use client";

import { useState } from "react";
import { Sidebar, SidebarProvider, useSidebar } from "@/components/layouts";
import InstructorHeader from "@/components/layouts/InstructorHeader";
import { useRequireRole } from "@/hooks/useAuth";
import { getCurrentUser, getUserRole } from "@/lib/auth";
import { cn } from "@/lib/utils";

export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading } = useRequireRole(["INSTRUCTOR", "ADMIN", "SUPER_ADMIN"]);

  // Determine sidebar role on client-side only to avoid hydration mismatch
  // Using lazy initialization to avoid setState in effect
  const [sidebarRole] = useState<"instructor" | "admin" | "student">(() => {
    if (typeof window !== "undefined") {
      const user = getCurrentUser();
      const role = getUserRole(user);
      return role === "INSTRUCTOR"
        ? "instructor"
        : role === "ADMIN" || role === "SUPER_ADMIN"
        ? "admin"
        : "instructor";
    }
    return "instructor";
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        {/* Sidebar - Full height from top to bottom */}
        <Sidebar role={sidebarRole} />

        {/* Header - Connected to sidebar (starts from right of sidebar) */}
        <InstructorHeader />

        {/* Main Content - With margin for sidebar and padding for header */}
        <InstructorContent>{children}</InstructorContent>
      </div>
    </SidebarProvider>
  );
}

// Separate component to use sidebar context
function InstructorContent({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();

  return (
    <main
      className={cn(
        "pt-16 min-h-screen transition-all duration-300 ease-in-out",
        collapsed ? "ml-16" : "ml-64"
      )}
    >
      <div
        className={cn(
          "py-8 transition-all duration-300 ease-in-out",
          collapsed
            ? "w-full px-4 sm:px-6 lg:px-8"
            : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        )}
      >
        {children}
      </div>
    </main>
  );
}
