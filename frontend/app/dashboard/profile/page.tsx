"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchCurrentUser,
  updateProfile,
  changePassword,
  clearError,
} from "@/store/slices/userSlice";
import { setUser } from "@/store/slices/authSlice";

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user: authUser } = useAppSelector((state) => state.auth);
  const { currentUser, loading } = useAppSelector((state) => state.user);

  // Initialize form data with lazy initialization
  const [formData, setFormData] = useState(() => {
    const user = currentUser || authUser;
    return {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
    };
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (!authUser) {
      router.push("/login");
      return;
    }

    dispatch(fetchCurrentUser());
  }, [dispatch, authUser, router]);

  // Update form data when currentUser changes - using setTimeout to defer update
  useEffect(() => {
    if (currentUser) {
      const timeoutId = setTimeout(() => {
        setFormData({
          firstName: currentUser.firstName || "",
          lastName: currentUser.lastName || "",
          email: currentUser.email || "",
        });
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [currentUser]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    dispatch(clearError());

    const result = await dispatch(updateProfile(formData));

    if (updateProfile.fulfilled.match(result)) {
      // Update auth user in store
      dispatch(setUser(result.payload));
      alert("Profile updated successfully!");
    } else {
      alert((result.payload as string) || "Failed to update profile");
    }
    setSaving(false);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    setChangingPassword(true);
    dispatch(clearError());

    const result = await dispatch(
      changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })
    );

    if (changePassword.fulfilled.match(result)) {
      alert("Password changed successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } else {
      alert((result.payload as string) || "Failed to change password");
    }
    setChangingPassword(false);
  };

  if (loading) {
    return (
      <div>
        <div className="max-w-2xl mx-auto">
          <div className="card p-8 animate-pulse">
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded mb-6"></div>
            <div className="space-y-4">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
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
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
              Profile Settings
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Manage your account information
            </p>
          </div>

          {/* Profile Information */}
          <div className="card p-8 mb-6">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6">
              Personal Information
            </h2>
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="input"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="btn bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>

          {/* Change Password */}
          <div className="card p-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6">
              Change Password
            </h2>
            <form onSubmit={handlePasswordChange} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value,
                    })
                  }
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="input"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={changingPassword}
                className="btn bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 disabled:opacity-50"
              >
                {changingPassword ? "Changing..." : "Change Password"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
