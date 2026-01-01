import { io, Socket } from "socket.io-client";
import { AppDispatch } from "@/store/store";
import { addNotification, updateUnreadCount } from "@/store/slices/notificationSlice";

let socket: Socket | null = null;
let dispatch: AppDispatch | null = null;

/**
 * Initialize Socket.IO connection
 * @param token - JWT access token
 * @param appDispatch - Redux dispatch function
 */
export const initializeSocket = (token: string, appDispatch: AppDispatch): Socket | null => {
  if (!token) {
    console.warn("[Socket] No token provided, skipping socket connection");
    return null;
  }

  // Close existing connection if any
  if (socket?.connected) {
    socket.disconnect();
  }

  dispatch = appDispatch;

  // Get backend URL and remove /api if present (Socket.IO is at root, not /api)
  let backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5040";
  // Remove /api suffix if present for socket connection
  backendUrl = backendUrl.replace(/\/api\/?$/, "");

  console.log("[Socket] Connecting to:", backendUrl);

  socket = io(backendUrl, {
    auth: {
      token: token,
    },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
    autoConnect: true,
  });

  // Connection event handlers
  socket.on("connect", () => {
    console.log("[Socket] Connected to server");
  });

  socket.on("disconnect", (reason) => {
    console.log("[Socket] Disconnected:", reason);
  });

  socket.on("connect_error", (error) => {
    console.error("[Socket] Connection error:", error);
    // Log more details for debugging
    if (error.message) {
      console.error("[Socket] Error message:", error.message);
    }
  });

  // Notification event handlers
  socket.on("notification", (notification) => {
    if (dispatch) {
      // addNotification reducer already handles unread count increment
      dispatch(addNotification(notification));
    }
  });

  socket.on("unread_count", (data: { unreadCount: number }) => {
    if (dispatch) {
      // Set unread count directly (absolute value)
      dispatch(updateUnreadCount(data.unreadCount));
    }
  });

  return socket;
};

/**
 * Disconnect Socket.IO connection
 */
export const disconnectSocket = () => {
  if (socket?.connected) {
    socket.disconnect();
    socket = null;
    dispatch = null;
    console.log("[Socket] Disconnected");
  }
};

/**
 * Get current socket instance
 */
export const getSocket = (): Socket | null => {
  return socket;
};

/**
 * Check if socket is connected
 */
export const isSocketConnected = (): boolean => {
  return socket?.connected || false;
};

