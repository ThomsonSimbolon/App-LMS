"use client";

import React, { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { formatDate } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchPendingCertificates,
  approveCertificate,
  clearError,
  clearMessage,
} from "@/store/slices/certificateSlice";

export default function AdminCertificatesPage() {
  const dispatch = useAppDispatch();
  // Note: Role protection is handled by AdminLayout

  const { certificates, loading, message } = useAppSelector(
    (state) => state.certificate
  );

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedCertificateId, setSelectedCertificateId] = useState<
    number | null
  >(null);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    dispatch(fetchPendingCertificates());
  }, [dispatch]);

  useEffect(() => {
    // Clear message after component unmounts
    return () => {
      dispatch(clearMessage());
    };
  }, [dispatch]);

  const handleApprove = async (id: number) => {
    dispatch(clearError());
    const result = await dispatch(
      approveCertificate({
        certificateId: id,
        status: "APPROVED",
      })
    );
    if (approveCertificate.fulfilled.match(result)) {
      // Refresh certificates list
      dispatch(fetchPendingCertificates());
    } else {
      alert((result.payload as string) || "Failed to approve certificate");
    }
  };

  const handleRejectClick = (id: number) => {
    setSelectedCertificateId(id);
    setRejectionReason("");
    setRejectModalOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!selectedCertificateId || !rejectionReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }

    dispatch(clearError());
    const result = await dispatch(
      approveCertificate({
        certificateId: selectedCertificateId,
        status: "REJECTED",
        rejectionReason: rejectionReason.trim(),
      })
    );

    if (approveCertificate.fulfilled.match(result)) {
      setRejectModalOpen(false);
      setSelectedCertificateId(null);
      setRejectionReason("");
      // Refresh certificates list
      dispatch(fetchPendingCertificates());
    } else {
      alert((result.payload as string) || "Failed to reject certificate");
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
        {loading ? (
          <div className="p-8 text-center text-neutral-500">
            Loading certificates...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
                <tr>
                  <th className="px-6 py-4 font-semibold text-neutral-900 dark:text-white">
                    Student
                  </th>
                  <th className="px-6 py-4 font-semibold text-neutral-900 dark:text-white">
                    Course
                  </th>
                  <th className="px-6 py-4 font-semibold text-neutral-900 dark:text-white">
                    Requested Date
                  </th>
                  <th className="px-6 py-4 font-semibold text-neutral-900 dark:text-white">
                    Completion
                  </th>
                  <th className="px-6 py-4 font-semibold text-neutral-900 dark:text-white text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                {certificates.length > 0 ? (
                  certificates.map((cert) => (
                    <tr
                      key={cert.id}
                      className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-neutral-900 dark:text-white">
                          {cert.user?.firstName} {cert.user?.lastName}
                        </div>
                        <div className="text-xs text-neutral-500">
                          {cert.user?.email}
                        </div>
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
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleApprove(cert.id)}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleRejectClick(cert.id)}
                          >
                            Reject
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-neutral-500"
                    >
                      {message || "No pending certificates found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Reject Certificate Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => {
          setRejectModalOpen(false);
          setSelectedCertificateId(null);
          setRejectionReason("");
        }}
        title="Reject Certificate"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-neutral-600 dark:text-neutral-400">
            Please provide a reason for rejecting this certificate request. This
            reason will be sent to the student.
          </p>
          <div className="w-full space-y-1.5">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Rejection Reason
            </label>
            <textarea
              className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              placeholder="Enter reason for rejection..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="ghost"
              onClick={() => {
                setRejectModalOpen(false);
                setSelectedCertificateId(null);
                setRejectionReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleRejectConfirm}
              disabled={!rejectionReason.trim()}
            >
              Reject Certificate
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
