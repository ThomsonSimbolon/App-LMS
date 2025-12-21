'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Award, Clock, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchPendingCertificates } from '@/store/slices/certificateSlice';
import Badge from '@/components/ui/Badge';
import { useAuth } from '@/hooks/useAuth';

export default function AssessorDashboardPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { certificates, loading } = useAppSelector((state) => state.certificate);

  useEffect(() => {
    // Note: Role protection is handled by AssessorLayout
    dispatch(fetchPendingCertificates());
  }, [dispatch]);

  // Calculate stats
  const stats = {
    pending: certificates.length,
    totalAssigned: certificates.length, // This will be filtered by assigned courses in the future
  };

  // Get recent pending certificates (last 5)
  const recentCertificates = certificates.slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
          Assessor Dashboard
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Welcome back, {user?.firstName}! Review and approve certificate requests.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-warning-100 dark:bg-warning-900/20 flex items-center justify-center">
              <Clock className="w-6 h-6 text-warning-600 dark:text-warning-400" />
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Pending Review</p>
              <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.pending}</h3>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
              <Award className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Assigned</p>
              <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.totalAssigned}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Certificates */}
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="lg:col-span-2">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                  Pending Certificates
                </h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                  Review certificate requests that need your approval
                </p>
              </div>
              <button
                onClick={() => router.push('/assessor/certificates')}
                className="btn bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 flex items-center gap-2"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {recentCertificates.length > 0 ? (
              <div className="space-y-4">
                {recentCertificates.map((cert) => (
                  <div
                    key={cert.id}
                    className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-neutral-900 dark:text-white">
                            {cert.user?.firstName} {cert.user?.lastName}
                          </h3>
                          <Badge variant="warning">Pending</Badge>
                        </div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                          {cert.course?.title}
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-500">
                          Requested on {new Date(cert.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => router.push('/assessor/certificates')}
                        className="btn bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 text-sm"
                      >
                        Review
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Award className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
                <p className="text-neutral-600 dark:text-neutral-400">
                  No pending certificates at the moment
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <button
              onClick={() => router.push('/assessor/certificates')}
              className="p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                  <Award className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <p className="font-medium text-neutral-900 dark:text-white">Review Certificates</p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Approve or reject pending requests
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

