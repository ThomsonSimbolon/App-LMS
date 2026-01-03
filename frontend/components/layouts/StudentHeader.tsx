"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  getCurrentUser,
  getUserDisplayName,
  getUserInitials,
} from "@/lib/auth";
import { useSidebar } from "./SidebarContext";
import ThemeToggle from "../ui/ThemeToggle";
import NotificationBell from "../notifications/NotificationBell";
import { LogOut, Menu, X, ChevronRight, User, ChevronDown } from "lucide-react";
import { useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";

const StudentHeader: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const { collapsed, setCollapsed } = useSidebar();
  const [displayName, setDisplayName] = useState("Guest");
  const [initials, setInitials] = useState("GU");

  // Update displayName and initials after hydration to avoid mismatch
  useEffect(() => {
    const updateUserInfo = () => {
      const user = getCurrentUser();
      setDisplayName(getUserDisplayName(user));
      setInitials(getUserInitials(user));
    };
    // Use setTimeout to defer update, avoiding synchronous setState warning
    const timeoutId = setTimeout(updateUserInfo, 0);
    return () => clearTimeout(timeoutId);
  }, []);

  // Close profile menu when clicking outside (only for click, not for hover)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Only close on click outside, not on mouse leave (hover handles that)
      if (
        profileMenuOpen &&
        !target.closest(".profile-menu-container") &&
        event.type === "mousedown"
      ) {
        setProfileMenuOpen(false);
      }
    };

    // Only add click listener, hover is handled by onMouseEnter/onMouseLeave
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileMenuOpen]);

  const handleLogout = () => {
    // Dispatch logout action to clear Redux state
    dispatch(logout());
    // Clear localStorage
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    // Use window.location.href for immediate hard redirect to login
    // This prevents showing homepage or other pages during redirect
    window.location.href = "/login";
  };

  return (
    <header
      className={cn(
        // Crypto/SaaS style surface - clean card surface
        "fixed top-0 right-0 z-50 h-16 border-b border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 transition-all duration-300 ease-in-out",
        collapsed ? "left-16" : "left-64"
      )}
    >
      <div className="flex h-full items-center justify-between px-4 md:px-6">
        {/* Left side - Toggle Button */}
        <div className="flex items-center">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Right Side - User Info & Actions */}
        <div className="flex items-center gap-4">
          <NotificationBell />
          <ThemeToggle />

          {/* Profile Dropdown */}
          <div
            className="hidden md:block relative profile-menu-container"
            onMouseEnter={() => setProfileMenuOpen(true)}
            onMouseLeave={() => setProfileMenuOpen(false)}
          >
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="flex items-center gap-3 px-3 py-1.5 rounded-lg transition-colors bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {/* Profile Avatar */}
              <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                {initials}
              </div>
              <div className="text-left">
                <p
                  className="text-sm font-medium text-slate-900 dark:text-white"
                  suppressHydrationWarning
                >
                  {displayName}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Student Dashboard
                </p>
              </div>
              <ChevronDown
                className={cn(
                  "w-4 h-4 text-slate-500 dark:text-slate-400 transition-transform",
                  profileMenuOpen && "rotate-180"
                )}
              />
            </button>

            {/* Dropdown Menu */}
            {profileMenuOpen && (
              <div
                className="absolute right-0 top-full pt-2 w-48 bg-transparent z-50"
                onMouseEnter={() => setProfileMenuOpen(true)}
                onMouseLeave={() => setProfileMenuOpen(false)}
              >
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-soft-lg border border-slate-200 dark:border-slate-600 py-2">
                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      router.push("/dashboard/profile");
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </button>
                  <div className="border-t border-slate-200 dark:border-slate-600 my-1"></div>
                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-error hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden btn bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 p-2"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          className={cn(
            "md:hidden absolute top-16 right-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-600 py-4 px-4 space-y-2 animate-slide-down",
            collapsed ? "left-16" : "left-64"
          )}
        >
          <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-600 mb-2 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
              {initials}
            </div>
            <div>
              <p
                className="text-sm font-medium text-slate-900 dark:text-white"
                suppressHydrationWarning
              >
                {displayName}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Student Dashboard
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              router.push("/dashboard/profile");
            }}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <User className="w-4 h-4" />
            <span>Profile</span>
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              handleLogout();
            }}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </header>
  );
};

export default StudentHeader;
