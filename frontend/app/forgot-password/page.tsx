"use client";

import { useState } from "react";
import Link from "next/link";
import { Header, Footer } from "@/components/layouts";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send reset email");
      }

      setSuccess(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background dark:bg-base-dark flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <div className="w-12 h-12 rounded-lg bg-primary-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-white font-bold text-2xl">L</span>
              </div>
              <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                LMS Platform
              </span>
            </Link>
            <h2 className="mt-6 text-3xl font-bold text-slate-900 dark:text-slate-50">
              Forgot Password?
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Enter your email and we&apos;ll send you a reset link
            </p>
          </div>

          <div className="card p-8">
            {success ? (
              <div className="text-center">
                <div className="text-6xl mb-4">✉️</div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  Check your email
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  We&apos;ve sent a password reset link to{" "}
                  <strong>{email}</strong>
                </p>
                <Link
                  href="/login"
                  className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
                >
                  Back to login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-error/10 border border-error text-error rounded-lg p-4 text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                  >
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input"
                    placeholder="john.doe@example.com"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn btn-primary px-6 py-3 text-base font-semibold disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>

                <div className="text-center">
                  <Link
                    href="/login"
                    className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
                  >
                    ← Back to login
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
