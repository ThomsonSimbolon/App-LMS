'use client';

import { useRouter } from 'next/navigation';
import { X, Check, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import NotificationItem from './NotificationItem';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  isRead: boolean;
  entityType?: string;
  entityId?: number;
  createdAt: string;
}

interface NotificationDropdownProps {
  notifications: Notification[];
  loading: boolean;
  onClose: () => void;
  onMarkAsRead: (id: number) => void;
  onMarkAllAsRead: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  notifications,
  loading,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead
}) => {
  const router = useRouter();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleNotificationClick = (notification: Notification) => {
    // Navigate based on entity type
    if (notification.entityType && notification.entityId) {
      if (notification.entityType === 'COURSE') {
        router.push(`/courses/${notification.entityId}`);
      } else if (notification.entityType === 'QUIZ') {
        router.push(`/dashboard/quizzes`);
      } else if (notification.entityType === 'CERTIFICATE') {
        router.push(`/dashboard/certificates`);
      }
    }

    // Mark as read if unread
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }

    onClose();
  };

  return (
    <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white dark:bg-neutral-900 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-800 z-50 max-h-96 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
            Notifications
          </h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-xs font-medium rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              title="Mark all as read"
            >
              <CheckCheck className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="overflow-y-auto flex-1">
        {loading ? (
          <div className="p-8 text-center text-neutral-500 dark:text-neutral-400">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-neutral-500 dark:text-neutral-400">
            No notifications
          </div>
        ) : (
          <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClick={() => handleNotificationClick(notification)}
                onMarkAsRead={() => onMarkAsRead(notification.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;

