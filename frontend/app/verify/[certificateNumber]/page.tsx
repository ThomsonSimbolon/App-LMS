'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header, Footer } from '@/components/layouts';

export default function VerifyCertificatePage({ params }: { params: { certificateNumber: string } }) {
  const router = useRouter();
  const [certificate, setCertificate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    verifyCertificate();
  }, [params.certificateNumber]);

  const verifyCertificate = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/certificates/verify/${params.certificateNumber}`
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Certificate not found');
      }

      setCertificate(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-16">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-2">
                Certificate Verification
              </h1>
              <p className="text-lg text-neutral-600 dark:text-neutral-400">
                Verify the authenticity of a certificate
              </p>
            </div>

            {loading ? (
              <div className="card p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-neutral-600 dark:text-neutral-400">Verifying certificate...</p>
              </div>
            ) : error || !certificate ? (
              <div className="card p-12 text-center">
                <div className="text-6xl mb-4">❌</div>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                  Invalid Certificate
                </h2>
                <p className="text-neutral-600 dark:text-neutral-400 mb-2">
                  {error || 'This certificate could not be verified.'}
                </p>
                <p className="text-sm text-neutral-500 dark:text-neutral-500">
                  Certificate Number: {params.certificateNumber}
                </p>
              </div>
            ) : (
              <>
                <div className="card overflow-hidden mb-8">
                  <div className="bg-gradient-to-r from-accent-500 to-accent-600 p-6 text-white text-center">
                    <div className="text-5xl mb-2">✓</div>
                    <h2 className="text-2xl font-bold">Certificate Verified!</h2>
                    <p className="text-accent-100 mt-1">This is an authentic certificate</p>
                  </div>

                  <div className="relative bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-primary-900/20 dark:via-neutral-900 dark:to-accent-900/20 p-12">
                    <div className="text-center">
                      <div className="text-6xl mb-6">🏆</div>
                      <h3 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
                        Certificate of Completion
                      </h3>
                      <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-2">
                        This certifies that
                      </p>
                      <p className="text-2xl font-bold text-neutral-900 dark:text-white mb-6">
                        {certificate.user?.firstName} {certificate.user?.lastName}
                      </p>
                      <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-2">
                        has successfully completed
                      </p>
                      <p className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-8">
                        {certificate.course?.title}
                      </p>
                      <div className="grid md:grid-cols-2 gap-6 max-w-md mx-auto">
                        <div>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">Issue Date</p>
                          <p className="font-semibold text-neutral-900 dark:text-white">
                            {formatDate(certificate.issuedAt)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">Certificate Number</p>
                          <p className="font-semibold text-neutral-900 dark:text-white">
                            {certificate.certificateNumber}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card p-8">
                  <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                    Certificate Details
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Recipient</p>
                      <p className="font-medium text-neutral-900 dark:text-white">
                        {certificate.user?.firstName} {certificate.user?.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Course</p>
                      <p className="font-medium text-neutral-900 dark:text-white">
                        {certificate.course?.title}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Instructor</p>
                      <p className="font-medium text-neutral-900 dark:text-white">
                        {certificate.course?.instructor?.firstName} {certificate.course?.instructor?.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Verification</p>
                      <p className="font-medium text-accent-600 dark:text-accent-400">
                        ✓ Verified
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
