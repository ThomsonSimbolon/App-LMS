"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  getCurrentUser,
  getUserDisplayName,
  getUserInitials,
  getUserRole,
  type Role,
} from "@/lib/auth";
import { useSidebar } from "./SidebarContext";
import {
  LayoutDashboard,
  BookOpen,
  FileCheck,
  Award,
  Users,
  BarChart,
  Settings,
  GraduationCap,
  Activity,
  FolderTree,
} from "lucide-react";

interface SidebarProps {
  role?: "student" | "instructor" | "admin" | "super_admin" | "assessor";
}

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName?: string;
  role: {
    id: number;
    name: Role;
  };
}

const Sidebar: React.FC<SidebarProps> = ({ role: propRole }) => {
  const pathname = usePathname();
  const { collapsed } = useSidebar();
  const [user, setUser] = React.useState<User | null>(null);

  // Only get user from localStorage on client-side to avoid hydration mismatch
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setUser(getCurrentUser());
    }
  }, []);

  // Determine role: use prop if provided (preferred to avoid hydration issues)
  let role: "student" | "instructor" | "admin" | "super_admin" | "assessor" =
    "student";

  if (propRole) {
    role = propRole;
  } else if (typeof window !== "undefined") {
    // Only check localStorage on client-side if propRole not provided
    const userRole = getUserRole(user);
    if (userRole) {
      // Map backend role to sidebar role
      switch (userRole) {
        case "SUPER_ADMIN":
          role = "super_admin";
          break;
        case "ADMIN":
          role = "admin";
          break;
        case "INSTRUCTOR":
          role = "instructor";
          break;
        case "ASSESSOR":
          role = "assessor";
          break;
        default:
          role = "student";
      }
    }
  }

  const displayName = getUserDisplayName(user);
  const initials = getUserInitials(user);

  const studentNavigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "My Courses", href: "/dashboard/courses", icon: BookOpen },
    {
      name: "Browse Courses",
      href: "/dashboard/browse-courses",
      icon: GraduationCap,
    },
    { name: "Quizzes", href: "/dashboard/quizzes", icon: FileCheck },
    { name: "Certificates", href: "/dashboard/certificates", icon: Award },
  ];

  const instructorNavigation = [
    { name: "Dashboard", href: "/instructor/dashboard", icon: LayoutDashboard },
    { name: "My Courses", href: "/instructor/courses", icon: BookOpen },
    { name: "Students", href: "/instructor/students", icon: GraduationCap },
    { name: "Analytics", href: "/instructor/analytics", icon: BarChart },
  ];

  const adminNavigation = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Courses", href: "/admin/courses", icon: BookOpen },
    { name: "Categories", href: "/admin/categories", icon: FolderTree },
    { name: "Certificates", href: "/admin/certificates", icon: Award },
    { name: "Activity Logs", href: "/admin/activity-logs", icon: Activity },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  const assessorNavigation = [
    { name: "Dashboard", href: "/assessor/dashboard", icon: LayoutDashboard },
    { name: "Certificates", href: "/assessor/certificates", icon: Award },
  ];

  const navigation =
    role === "admin" || role === "super_admin"
      ? adminNavigation
      : role === "instructor"
      ? instructorNavigation
      : role === "assessor"
      ? assessorNavigation
      : studentNavigation;

  return (
    <aside
      className={cn(
        // Nuxt UI style surface - elevated card surface
        "fixed left-0 top-0 h-screen bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 shadow-soft transition-all duration-300 ease-in-out z-40 flex flex-col",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Brand Section - Height sama dengan header (h-16) */}
      <div
        className={cn(
          "h-16 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center justify-center flex-shrink-0",
          collapsed ? "px-0" : "px-4"
        )}
      >
        <Link
          href="/"
          className={cn(
            "flex items-center group transition-all",
            collapsed ? "justify-center w-full" : "gap-2 w-full justify-center"
          )}
        >
          <div
            className={cn(
              "rounded-lg bg-primary-600 dark:bg-primary-600 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0",
              collapsed ? "w-10 h-10" : "w-8 h-8"
            )}
          >
            <span
              className={cn(
                "text-white font-bold",
                collapsed ? "text-xl" : "text-lg"
              )}
            >
              L
            </span>
          </div>
          {!collapsed && (
            <span className="text-xl font-bold text-primary-600 dark:text-primary-400 whitespace-nowrap">
              LMS Platform
            </span>
          )}
        </Link>
      </div>

      {/* Navigation - Flex grow untuk mengambil sisa space */}
      <nav
        className={cn(
          "flex-1 overflow-y-auto",
          collapsed ? "p-2 space-y-1" : "p-4 space-y-2"
        )}
      >
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center rounded-lg transition-all",
                "hover:bg-primary-50 dark:hover:bg-primary-900/20",
                isActive &&
                  "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 font-medium",
                !isActive && "text-neutral-700 dark:text-neutral-300",
                collapsed ? "justify-center w-full py-2.5" : "gap-3 px-3 py-2.5"
              )}
              title={collapsed ? item.name : undefined}
            >
              <Icon
                className={cn(
                  "flex-shrink-0",
                  collapsed ? "w-5 h-5" : "w-5 h-5"
                )}
              />
              {!collapsed && <span className="text-sm">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Section - Fixed di bottom */}
      {user && (
        <div
          className={cn(
            "border-t border-neutral-200 dark:border-neutral-800 flex-shrink-0",
            collapsed ? "p-2" : "p-4"
          )}
        >
          {collapsed ? (
            <div className="flex items-center justify-center w-full">
              <div className="w-10 h-10 rounded-full bg-primary-600 dark:bg-primary-600 flex items-center justify-center text-white font-semibold">
                {initials}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-10 h-10 rounded-full bg-primary-600 dark:bg-primary-600 flex items-center justify-center text-white font-semibold">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                  {displayName}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 capitalize">
                  {role.replace("_", " ")}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
