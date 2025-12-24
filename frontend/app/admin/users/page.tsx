"use client";

import { useState, useEffect } from "react";
import { useRequireRole } from "@/hooks/useAuth";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchUsers,
  updateUserRole,
  deleteUser,
} from "@/store/slices/userSlice";

export default function UserManagementPage() {
  const dispatch = useAppDispatch();
  const { loading: authLoading } = useRequireRole(["ADMIN", "SUPER_ADMIN"]);
  const { users, loading, error } = useAppSelector((state) => state.user);
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading) {
      dispatch(fetchUsers());
    }
  }, [authLoading, dispatch]);

  const handleRoleChange = async (userId: number, newRoleId: number) => {
    setUpdating(userId);
    const result = await dispatch(
      updateUserRole({ userId, roleId: newRoleId })
    );

    if (updateUserRole.fulfilled.match(result)) {
      alert("Role updated successfully");
    } else {
      alert((result.payload as string) || "Failed to update role");
    }
    setUpdating(null);
  };

  const handleDeleteUser = async (userId: number) => {
    if (
      !confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    )
      return;

    setUpdating(userId);
    const result = await dispatch(deleteUser(userId));

    if (deleteUser.fulfilled.match(result)) {
      alert("User deleted successfully");
    } else {
      alert((result.payload as string) || "Failed to delete user");
    }
    setUpdating(null);
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
            User Management
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Manage system users and their roles
          </p>
        </div>
        <div className="bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 px-4 py-2 rounded-lg font-mono text-sm">
          Total Users: {users.length}
        </div>
      </div>

      {error && (
        <div className="bg-error-light/10 border border-error text-error-dark dark:text-error-light rounded-lg p-4 mb-6">
          {error}
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
              <tr>
                <th className="px-6 py-4 font-semibold text-neutral-900 dark:text-white">
                  User
                </th>
                <th className="px-6 py-4 font-semibold text-neutral-900 dark:text-white">
                  Email
                </th>
                <th className="px-6 py-4 font-semibold text-neutral-900 dark:text-white">
                  Role
                </th>
                <th className="px-6 py-4 font-semibold text-neutral-900 dark:text-white">
                  Joined
                </th>
                <th className="px-6 py-4 font-semibold text-neutral-900 dark:text-white text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-border dark:bg-[#1E293B] flex items-center justify-center text-xs font-bold text-text-primary dark:text-[#E5E7EB]">
                        {user.firstName?.[0]}
                        {user.lastName?.[0]}
                      </div>
                      <div>
                        <div className="font-medium text-neutral-900 dark:text-white">
                          {user.firstName} {user.lastName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-neutral-600 dark:text-neutral-400">
                    {user.email}
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={user.role?.id}
                      onChange={(e) =>
                        handleRoleChange(user.id, parseInt(e.target.value))
                      }
                      disabled={
                        updating === user.id ||
                        user.role?.name === "SUPER_ADMIN"
                      } // Basic protection
                      className="bg-transparent border border-neutral-200 dark:border-neutral-700 rounded px-2 py-1 text-xs focus:ring-2 focus:ring-primary-500"
                    >
                      <option value={2}>ADMIN</option>
                      <option value={3}>INSTRUCTOR</option>
                      <option value={4}>STUDENT</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-neutral-600 dark:text-neutral-400">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={updating === user.id}
                      className="text-error hover:text-error-dark dark:hover:text-error-light font-medium text-xs disabled:opacity-50"
                    >
                      {updating === user.id ? "..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
