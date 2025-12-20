'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const token = localStorage.getItem('accessToken');
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/me`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);

      setUser(data.data);
      setFormData({
        firstName: data.data.firstName || '',
        lastName: data.data.lastName || '',
        email: data.data.email || '',
      });
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('accessToken');
    setSaving(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/me`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      alert('Profile updated successfully!');
      localStorage.setItem('user', JSON.stringify(data.data));
      fetchUserData();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    const token = localStorage.getItem('accessToken');
    setChangingPassword(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/me/password`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      alert('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      alert(error.message);
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div>
        <div className="max-w-2xl mx-auto">
          <div className="card p-8 animate-pulse">
            <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded mb-6"></div>
            <div className="space-y-4">
              <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
              <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
              <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="max-w-2xl mx-auto">
          <div className="max-w-2xl mx-auto">
            <div className="mb-10">
              <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-2">
                Profile Settings
              </h1>
              <p className="text-lg text-neutral-600 dark:text-neutral-400">
                Manage your account information
              </p>
            </div>

            {/* Profile Information */}
            <div className="card p-8 mb-6">
              <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white mb-6">
                Personal Information
              </h2>
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="btn bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>

            {/* Change Password */}
            <div className="card p-8">
              <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white mb-6">
                Change Password
              </h2>
              <form onSubmit={handlePasswordChange} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="input"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={changingPassword}
                  className="btn bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 disabled:opacity-50"
                >
                  {changingPassword ? 'Changing...' : 'Change Password'}
                </button>
              </form>
            </div>
          </div>
        </div>
    </div>
  );
}
