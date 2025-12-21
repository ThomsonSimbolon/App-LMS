'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header, Footer } from '@/components/layouts';

export default function VerifyEmailPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    verifyEmail();
  }, [token]);

  useEffect(() => {
    if (status === 'success' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (status === 'success' && countdown === 0) {
      router.push('/login');
    }
  }, [status, countdown, router]);

  const verifyEmail = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-email/${token}`,
        { method: 'GET' }
      );

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message || 'Email verified successfully!');
      } else {
        setStatus('error');
        setMessage(data.error || 'Verification failed');
      }
    } catch (err: any) {
      setStatus('error');
      setMessage('An error occurred during verification. Please try again.');
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-white font-bold text-2xl">L</span>
              </div>
              <span className="text-2xl font-bold gradient-text">LMS Platform</span>
            </Link>
          </div>

          <div className="card p-8">
            {status === 'loading' && (
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-6"></div>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                  Verifying Your Email
                </h2>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Please wait while we verify your email address...
                </p>
              </div>
            )}

            {status === 'success' && (
              <div className="text-center">
                <div className="w-16 h-16 bg-accent-100 dark:bg-accent-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-accent-600 dark:text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                  Email Verified!
                </h2>
                <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                  {message}
                </p>
                <div className="bg-accent-50 dark:bg-accent-900/10 border border-accent-200 dark:border-accent-900/30 rounded-lg p-4 mb-6">
                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    Redirecting to login in <span className="font-bold text-accent-600 dark:text-accent-400">{countdown}</span> seconds...
                  </p>
                </div>
                <Link
                  href="/login"
                  className="inline-block w-full btn bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 text-center"
                >
                  Go to Login Now
                </Link>
              </div>
            )}

            {status === 'error' && (
              <div className="text-center">
                <div className="w-16 h-16 bg-error-light/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-error dark:text-error-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                  Verification Failed
                </h2>
                <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                  {message}
                </p>
                
                <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-4 mb-6">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                    Common reasons for verification failure:
                  </p>
                  <ul className="text-sm text-neutral-700 dark:text-neutral-300 text-left space-y-1">
                    <li>• Link has expired (24 hours validity)</li>
                    <li>• Email already verified</li>
                    <li>• Invalid verification link</li>
                  </ul>
                </div>

                <div className="flex flex-col gap-3">
                  <Link
                    href="/register"
                    className="btn bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 text-center"
                  >
                    Register Again
                  </Link>
                  <Link
                    href="/login"
                    className="btn bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white px-6 py-3 text-center"
                  >
                    Go to Login
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
