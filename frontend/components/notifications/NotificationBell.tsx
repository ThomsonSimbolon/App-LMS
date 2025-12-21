"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import NotificationDropdown from "./NotificationDropdown";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchNotifications,
  fetchUnreadCount,
  markAsRead,
  markAllAsRead,
} from "@/store/slices/notificationSlice";

const NotificationBell: React.FC = () => {
  const dispatch = useAppDispatch();
  const { notifications, unreadCount, loading } = useAppSelector(
    (state) => state.notification
  );
  const [isOpen, setIsOpen] = useState(false);

  // Initial fetch
  useEffect(() => {
    dispatch(fetchUnreadCount());
    dispatch(fetchNotifications(10));

    // Poll for updates every 30 seconds
    const interval = setInterval(() => {
      dispatch(fetchUnreadCount());
      if (isOpen) {
        dispatch(fetchNotifications(10));
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [dispatch, isOpen]);

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchNotifications(10));
    }
  }, [dispatch, isOpen]);

  const handleMarkAsRead = async (id: number) => {
    dispatch(markAsRead(id));
  };

  const handleMarkAllAsRead = async () => {
    dispatch(markAllAsRead());
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-primary-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <NotificationDropdown
          notifications={notifications}
          loading={loading}
          onClose={() => setIsOpen(false)}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
        />
      )}
    </div>
  );
};

export default NotificationBell;
