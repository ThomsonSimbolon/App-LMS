"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName?: string;
  role: {
    id: number;
    name: "SUPER_ADMIN" | "ADMIN" | "INSTRUCTOR" | "STUDENT" | "ASSESSOR";
  };
}

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  hasRole: (roles: string[]) => boolean;
}

/**
 * Custom hook untuk authentication dan role checking
 */
export function useAuth(): UseAuthReturn {
  // Initialize user from localStorage synchronously to avoid cascading renders
  const [user] = useState<User | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const token = localStorage.getItem("accessToken");
      const userStr = localStorage.getItem("user");
      if (token && userStr) {
        return JSON.parse(userStr);
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    }
    return null;
  });

  // Loading is false since we read synchronously from localStorage
  const loading = false;

  const hasRole = (roles: string[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role.name);
  };

  return {
    user,
    loading,
    isAuthenticated: !!user,
    hasRole,
  };
}

/**
 * Hook untuk require authentication
 * Redirect ke login jika tidak authenticated
 */
export function useRequireAuth() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [loading, isAuthenticated, router]);

  return { user, loading, isAuthenticated };
}

/**
 * Hook untuk require specific role(s)
 * Redirect ke dashboard jika role tidak sesuai
 */
export function useRequireRole(
  allowedRoles: string[],
  redirectTo: string = "/dashboard"
) {
  const router = useRouter();
  const { user, loading, isAuthenticated, hasRole } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push("/login");
        return;
      }

      if (!hasRole(allowedRoles)) {
        router.push(redirectTo);
        return;
      }
    }
  }, [loading, isAuthenticated, hasRole, allowedRoles, redirectTo, router]);

  return { user, loading, isAuthenticated: hasRole(allowedRoles) };
}
