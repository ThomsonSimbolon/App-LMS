"use client";

import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { useRequireRole } from "@/hooks/useAuth";
import { Activity, Filter, User, RefreshCw } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchActivityLogs,
  fetchActivityLogStats,
  clearError,
} from "@/store/slices/activityLogSlice";

export default function ActivityLogsPage() {
  const dispatch = useAppDispatch();
  const { loading: authLoading } = useRequireRole(["ADMIN", "SUPER_ADMIN"]);
  const { logs, stats, loading, error, pagination } = useAppSelector(
    (state) => state.activityLog
  );

  // Filters
  const [filters, setFilters] = useState({
    eventType: "",
    userId: "",
    entityType: "",
    dateFrom: "",
    dateTo: "",
    page: 1,
    limit: 20,
  });

  useEffect(() => {
    if (!authLoading) {
      dispatch(
        fetchActivityLogs({
          eventType: filters.eventType || undefined,
          userId: filters.userId || undefined,
          entityType: filters.entityType || undefined,
          dateFrom: filters.dateFrom || undefined,
          dateTo: filters.dateTo || undefined,
          page: filters.page,
          limit: filters.limit,
        })
      );
      dispatch(
        fetchActivityLogStats({
          dateFrom: filters.dateFrom || undefined,
          dateTo: filters.dateTo || undefined,
        })
      );
    }
  }, [authLoading, filters, dispatch]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
    dispatch(clearError());
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const clearFilters = () => {
    setFilters({
      eventType: "",
      userId: "",
      entityType: "",
      dateFrom: "",
      dateTo: "",
      page: 1,
      limit: 20,
    });
  };

  const getEventTypeColor = (eventType: string) => {
    const colors: Record<string, string> = {
      USER_LOGIN:
        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      COURSE_ENROLL:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      LESSON_COMPLETE:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      QUIZ_SUBMIT:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      CERT_REQUESTED:
        "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
      CERT_APPROVED:
        "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
      CERT_REJECTED:
        "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    };
    return (
      colors[eventType] ||
      "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
    );
  };

  const formatEventType = (eventType: string) => {
    return eventType
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Activity Logs
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Monitor and audit system activities
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              dispatch(
                fetchActivityLogs({
                  eventType: filters.eventType || undefined,
                  userId: filters.userId || undefined,
                  entityType: filters.entityType || undefined,
                  dateFrom: filters.dateFrom || undefined,
                  dateTo: filters.dateTo || undefined,
                  page: filters.page,
                  limit: filters.limit,
                })
              );
              dispatch(
                fetchActivityLogStats({
                  dateFrom: filters.dateFrom || undefined,
                  dateTo: filters.dateTo || undefined,
                })
              );
            }}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Total Logs
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stats.totalLogs.toLocaleString()}
                </p>
              </div>
              <Activity className="w-8 h-8 text-primary-600" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Unique Users
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stats.uniqueUsers}
                </p>
              </div>
              <User className="w-8 h-8 text-green-600" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Event Types
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stats.byEventType.length}
                </p>
              </div>
              <Filter className="w-8 h-8 text-purple-600" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Entity Types
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stats.byEntityType.length}
                </p>
              </div>
              <Activity className="w-8 h-8 text-blue-600" />
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-slate-500" />
          <h3 className="font-semibold text-slate-900 dark:text-white">
            Filters
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Event Type
            </label>
            <select
              value={filters.eventType}
              onChange={(e) => handleFilterChange("eventType", e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="">All Events</option>
              <option value="USER_LOGIN">User Login</option>
              <option value="COURSE_ENROLL">Course Enroll</option>
              <option value="LESSON_COMPLETE">Lesson Complete</option>
              <option value="QUIZ_SUBMIT">Quiz Submit</option>
              <option value="CERT_REQUESTED">Cert Requested</option>
              <option value="CERT_APPROVED">Cert Approved</option>
              <option value="CERT_REJECTED">Cert Rejected</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Entity Type
            </label>
            <select
              value={filters.entityType}
              onChange={(e) => handleFilterChange("entityType", e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="">All Entities</option>
              <option value="USER">User</option>
              <option value="COURSE">Course</option>
              <option value="QUIZ">Quiz</option>
              <option value="CERTIFICATE">Certificate</option>
              <option value="SYSTEM">System</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              User ID
            </label>
            <Input
              type="number"
              placeholder="User ID"
              value={filters.userId}
              onChange={(e) => handleFilterChange("userId", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Date From
            </label>
            <Input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Date To
            </label>
            <Input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange("dateTo", e.target.value)}
            />
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <Button variant="outline" onClick={clearFilters} className="text-sm">
            Clear Filters
          </Button>
        </div>
      </Card>

      {/* Error Message */}
      {error && (
        <div className="bg-error/10 border border-error text-error rounded-lg p-4 mb-4">
          {error}
        </div>
      )}

      {/* Activity Logs Table */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-error">
            {error}
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">
            No activity logs found
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Entity
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      IP Address
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {logs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <td className="px-4 py-3 text-sm text-slate-900 dark:text-white">
                        {formatDate(log.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {log.user ? (
                          <div>
                            <div className="font-medium text-slate-900 dark:text-white">
                              {log.user.firstName} {log.user.lastName}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {log.user.email}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-500 dark:text-slate-400 italic">
                            System
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Badge className={getEventTypeColor(log.eventType)}>
                          {formatEventType(log.eventType)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div>
                          <span className="font-medium text-slate-900 dark:text-white">
                            {log.entityType}
                          </span>
                          {log.entityId && (
                            <span className="text-slate-500 dark:text-slate-400 ml-1">
                              #{log.entityId}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400 font-mono">
                        {log.ipAddress || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {log.metadata && (
                          <details className="cursor-pointer">
                            <summary className="text-primary-600 dark:text-primary-400 hover:underline text-xs">
                              View Details
                            </summary>
                            <pre className="mt-2 p-2 bg-slate-100 dark:bg-slate-900 rounded text-xs overflow-x-auto max-h-40 overflow-y-auto">
                              {JSON.stringify(log.metadata, null, 2)}
                            </pre>
                          </details>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total
                  )}{" "}
                  of {pagination.total} results
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="text-sm"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.pages}
                    className="text-sm"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
