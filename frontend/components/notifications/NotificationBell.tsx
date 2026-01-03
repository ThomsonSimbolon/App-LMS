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
import {
  initializeSocket,
  disconnectSocket,
  isSocketConnected,
} from "@/lib/socket";

const NotificationBell: React.FC = () => {
  const dispatch = useAppDispatch();
  const { notifications, unreadCount, loading } = useAppSelector(
    (state) => state.notification
  );
  const [isOpen, setIsOpen] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);

  // Initialize socket connection
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      const socket = initializeSocket(token, dispatch);
      if (socket) {
        socket.on("connect", () => {
          setSocketConnected(true);
        });
        socket.on("disconnect", () => {
          setSocketConnected(false);
        });
        // Check initial connection status
        setSocketConnected(socket.connected);
      }
    }

    return () => {
      disconnectSocket();
    };
  }, [dispatch]);

  // Initial fetch
  useEffect(() => {
    dispatch(fetchUnreadCount());
    dispatch(fetchNotifications(10));

    // Poll for updates - use longer interval if socket is connected
    const pollInterval = socketConnected ? 60000 : 30000; // 60s if socket connected, 30s if not

    const interval = setInterval(() => {
      // Only poll if socket is not connected or dropdown is open
      if (!socketConnected || isOpen) {
        dispatch(fetchUnreadCount());
        if (isOpen) {
          dispatch(fetchNotifications(10));
        }
      }
    }, pollInterval);

    return () => clearInterval(interval);
  }, [dispatch, isOpen, socketConnected]);

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
        className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-primary-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
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
