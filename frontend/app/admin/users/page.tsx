'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Badge from '@/components/ui/Badge';
import { useRequireRole } from '@/hooks/useAuth';
import { getAccessToken } from '@/lib/auth';

export default function UserManagementPage() {
  const router = useRouter();
  const { loading: authLoading } = useRequireRole(['ADMIN', 'SUPER_ADMIN']);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading) {
      fetchUsers();
    }
  }, [authLoading]);

  const fetchUsers = async () => {
    const token = getAccessToken();
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      setUsers(data.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: number, newRoleId: number) => {
    const token = getAccessToken();
    if (!token) {
      router.push('/login');
      return;
    }
    setUpdating(userId);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ roleId: newRoleId })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      // Update local state
      setUsers(users.map(u => 
        u.id === userId ? { ...u, role: { ...u.role, id: newRoleId, name: getRoleName(newRoleId) } } : u
      ));
      
      alert('Role updated successfully');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdating(null);
    }
  };

  const getRoleName = (id: number) => {
    switch (id) {
      case 1: return 'SUPER_ADMIN';
      case 2: return 'ADMIN';
      case 3: return 'INSTRUCTOR';
      case 4: return 'STUDENT';
      default: return 'UNKNOWN';
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    const token = getAccessToken();
    if (!token) {
      router.push('/login');
      return;
    }
    setUpdating(userId);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setUsers(users.filter(u => u.id !== userId));
      alert('User deleted successfully');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdating(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
            User Management
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Manage system users and their roles
          </p>
        </div>
        <div className="bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 px-4 py-2 rounded-lg font-mono text-sm">
          Total Users: {users.length}
        </div>
      </div>

      {error && (
        <div className="bg-error-light/10 border border-error text-error-dark dark:text-error-light rounded-lg p-4 mb-6">
          {error}
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
              <tr>
                <th className="px-6 py-4 font-semibold text-neutral-900 dark:text-white">User</th>
                <th className="px-6 py-4 font-semibold text-neutral-900 dark:text-white">Email</th>
                <th className="px-6 py-4 font-semibold text-neutral-900 dark:text-white">Role</th>
                <th className="px-6 py-4 font-semibold text-neutral-900 dark:text-white">Joined</th>
                <th className="px-6 py-4 font-semibold text-neutral-900 dark:text-white text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neutral-200 to-neutral-300 dark:from-neutral-700 dark:to-neutral-600 flex items-center justify-center text-xs font-bold text-neutral-700 dark:text-neutral-300">
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </div>
                      <div>
                        <div className="font-medium text-neutral-900 dark:text-white">
                          {user.firstName} {user.lastName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-neutral-600 dark:text-neutral-400">
                    {user.email}
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={user.role?.id}
                      onChange={(e) => handleRoleChange(user.id, parseInt(e.target.value))}
                      disabled={updating === user.id || user.role?.name === 'SUPER_ADMIN'} // Basic protection
                      className="bg-transparent border border-neutral-200 dark:border-neutral-700 rounded px-2 py-1 text-xs focus:ring-2 focus:ring-primary-500"
                    >
                      <option value={2}>ADMIN</option>
                      <option value={3}>INSTRUCTOR</option>
                      <option value={4}>STUDENT</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-neutral-600 dark:text-neutral-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={updating === user.id}
                      className="text-error hover:text-error-dark dark:hover:text-error-light font-medium text-xs disabled:opacity-50"
                    >
                      {updating === user.id ? '...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
