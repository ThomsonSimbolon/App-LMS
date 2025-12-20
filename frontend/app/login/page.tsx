'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store tokens
      localStorage.setItem('accessToken', data.data.tokens.accessToken);
      localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.data.user));

      // Redirect based on role
      const user = data.data.user;
      if (user.role.name === 'STUDENT') {
        router.push('/dashboard');
      } else if (user.role.name === 'INSTRUCTOR') {
        router.push('/instructor/dashboard');
      } else if (user.role.name === 'ADMIN' || user.role.name === 'SUPER_ADMIN') {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-white font-bold text-2xl">L</span>
            </div>
            <span className="text-2xl font-bold gradient-text">LMS Platform</span>
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-neutral-900 dark:text-neutral-50">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            Sign in to continue your learning
          </p>
        </div>

        {/* Form Card */}
        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-error-light/10 border border-error text-error-dark dark:text-error-light rounded-lg p-4 text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="input"
                placeholder="john.doe@example.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Password
                </label>
                <Link href="/forgot-password" className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="input"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-neutral-700 dark:text-neutral-300">
                Remember me
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Don't have an account?{' '}
              <Link href="/register" className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
