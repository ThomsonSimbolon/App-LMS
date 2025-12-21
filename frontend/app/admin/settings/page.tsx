"use client";

import React, { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useRequireRole } from "@/hooks/useAuth";

export default function AdminSettingsPage() {
  const { loading } = useRequireRole(["ADMIN", "SUPER_ADMIN"]);
  const [settings, setSettings] = useState({
    siteName: "LMS Platform",
    supportEmail: "support@lms-platform.com",
    maintenanceMode: false,
    allowRegistration: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement backend save
    alert("Settings saved successfully (Mock)");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          Platform Settings
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400">
          Configure general platform options
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="p-6 space-y-6">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white border-b border-neutral-200 dark:border-neutral-800 pb-4">
            General Configuration
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            <Input
              label="Site Name"
              value={settings.siteName}
              onChange={(e) =>
                setSettings({ ...settings, siteName: e.target.value })
              }
            />
            <Input
              label="Support Email"
              type="email"
              value={settings.supportEmail}
              onChange={(e) =>
                setSettings({ ...settings, supportEmail: e.target.value })
              }
            />
          </div>

          <div className="space-y-4 pt-4">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white border-b border-neutral-200 dark:border-neutral-800 pb-4">
              System Status
            </h3>

            <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
              <div>
                <div className="font-medium text-neutral-900 dark:text-white">
                  Maintenance Mode
                </div>
                <div className="text-sm text-neutral-500">
                  Disable all access for non-admin users
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.maintenanceMode}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      maintenanceMode: e.target.checked,
                    })
                  }
                />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
              <div>
                <div className="font-medium text-neutral-900 dark:text-white">
                  Allow Registration
                </div>
                <div className="text-sm text-neutral-500">
                  Allow new users to create accounts
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.allowRegistration}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      allowRegistration: e.target.checked,
                    })
                  }
                />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit">Save Changes</Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
