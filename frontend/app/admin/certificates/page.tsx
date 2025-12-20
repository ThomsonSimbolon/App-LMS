'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import { useRequireRole } from '@/hooks/useAuth';
import { getAccessToken } from '@/lib/auth';

export default function AdminCertificatesPage() {
  const router = useRouter();
  const { loading: authLoading } = useRequireRole(['ADMIN', 'SUPER_ADMIN', 'ASSESSOR']);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      fetchPendingCertificates();
    }
  }, [authLoading]);

  const fetchPendingCertificates = async () => {
    const token = getAccessToken();
    if (!token) {
      router.push('/login');
      return;
    }
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/certificates/pending/list`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (response.ok) {
        setCertificates(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    const token = getAccessToken();
    if (!token) {
      router.push('/login');
      return;
    }
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/certificates/${id}/approve`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setCertificates(certificates.filter(c => c.id !== id));
        alert('Certificate approved successfully');
      }
    } catch (error) {
      console.error('Approval error:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          Certificate Management
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400">
          Review and approve pending certificate requests
        </p>
      </div>

      <Card className="overflow-hidden">
        {authLoading || loading ? (
          <div className="p-8 text-center text-neutral-500">Loading certificates...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
                <tr>
                  <th className="px-6 py-4 font-semibold text-neutral-900 dark:text-white">Student</th>
                  <th className="px-6 py-4 font-semibold text-neutral-900 dark:text-white">Course</th>
                  <th className="px-6 py-4 font-semibold text-neutral-900 dark:text-white">Requested Date</th>
                  <th className="px-6 py-4 font-semibold text-neutral-900 dark:text-white">Completion</th>
                  <th className="px-6 py-4 font-semibold text-neutral-900 dark:text-white text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                {certificates.length > 0 ? (
                  certificates.map((cert) => (
                    <tr key={cert.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-neutral-900 dark:text-white">
                          {cert.student?.firstName} {cert.student?.lastName}
                        </div>
                        <div className="text-xs text-neutral-500">{cert.student?.email}</div>
                      </td>
                      <td className="px-6 py-4 text-neutral-600 dark:text-neutral-300">
                        {cert.course?.title}
                      </td>
                      <td className="px-6 py-4 text-neutral-600 dark:text-neutral-300">
                        {formatDate(cert.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="warning">Pending Approval</Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button 
                          variant="success" 
                          size="sm"
                          onClick={() => handleApprove(cert.id)}
                        >
                          Approve
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-neutral-500">
                      No pending certificates found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
