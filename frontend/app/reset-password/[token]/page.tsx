'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header, Footer } from '@/components/layouts';

export default function ResetPasswordPage({ params }: { params: { token: string } }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password/${params.token}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: formData.password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      alert('Password reset successful! Please login with your new password.');
      router.push('/login');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
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
            <h2 className="mt-6 text-3xl font-bold text-neutral-900 dark:text-neutral-50">
              Reset Password
            </h2>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              Enter your new password
            </p>
          </div>

          <div className="card p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-error-light/10 border border-error text-error-dark dark:text-error-light rounded-lg p-4 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  New Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="input"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 text-base font-semibold disabled:opacity-50"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
