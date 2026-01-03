'use client';

import { Check, Info, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

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

interface NotificationItemProps {
  notification: Notification;
  onClick: () => void;
  onMarkAsRead: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onClick,
  onMarkAsRead
}) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'SUCCESS':
        return <CheckCircle className="w-5 h-5 text-success" />;
      case 'WARNING':
        return <AlertTriangle className="w-5 h-5 text-warning" />;
      case 'ERROR':
        return <XCircle className="w-5 h-5 text-error" />;
      default:
        return <Info className="w-5 h-5 text-primary-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div
      className={cn(
        'p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer relative group',
        !notification.isRead && 'bg-primary-50/50 dark:bg-primary-900/10'
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className={cn(
              'text-sm font-medium',
              !notification.isRead ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'
            )}>
              {notification.title}
            </h4>
            {!notification.isRead && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkAsRead();
                }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                title="Mark as read"
              >
                <Check className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
              </button>
            )}
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
            {notification.message}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
            {formatDate(notification.createdAt)}
          </p>
        </div>
      </div>

      {/* Unread indicator */}
      {!notification.isRead && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-600 rounded-l" />
      )}
    </div>
  );
};

export default NotificationItem;

