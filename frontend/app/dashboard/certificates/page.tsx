"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchMyCertificates } from "@/store/slices/certificateSlice";
import { getApiUrl } from "@/lib/api";

export default function CertificatesPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { myCertificates: certificates, loading } = useAppSelector(
    (state) => state.certificate
  );
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    dispatch(fetchMyCertificates());
  }, [dispatch, user, router]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-2">
          My Certificates
        </h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400">
          View and download your earned certificates
        </p>
      </div>

      {/* Certificates Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-48 bg-neutral-200 dark:bg-neutral-700 rounded mb-4"></div>
              <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded mb-2"></div>
              <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
            </div>
          ))}
        </div>
      ) : certificates.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((certificate) => (
            <div key={certificate.id} className="card overflow-hidden">
              {/* Certificate Preview */}
              <div className="relative h-48 bg-gradient-to-br from-primary-500 to-accent-500 p-6 flex items-center justify-center text-center">
                <div className="text-white">
                  <div className="text-4xl mb-2">🏆</div>
                  <h3 className="font-bold text-lg">
                    Certificate of Completion
                  </h3>
                  <p className="text-sm opacity-90 mt-2">
                    {certificate.certificateNumber}
                  </p>
                </div>
              </div>

              {/* Certificate Info */}
              <div className="p-6">
                <h4 className="font-semibold text-neutral-900 dark:text-white mb-2 line-clamp-2">
                  {certificate.course?.title || "Course Title"}
                </h4>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                  Issued:{" "}
                  {formatDate(certificate.issuedAt || certificate.createdAt)}
                </p>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      window.open(
                        `/verify/${certificate.certificateNumber}`,
                        "_blank"
                      )
                    }
                    className="flex-1 btn bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 text-sm"
                  >
                    View
                  </button>
                  <button
                    onClick={() => {
                      window.open(
                        getApiUrl(`certificates/${certificate.id}/download`),
                        "_blank"
                      );
                    }}
                    className="flex-1 btn bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white px-4 py-2 text-sm"
                  >
                    Download
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <div className="text-6xl mb-4">🏆</div>
          <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
            No certificates yet
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            Complete a course to earn your first certificate
          </p>
          <button
            onClick={() => router.push("/dashboard/courses")}
            className="btn bg-primary-600 hover:bg-primary-700 text-white px-6 py-3"
          >
            View My Courses
          </button>
        </div>
      )}
    </div>
  );
}
