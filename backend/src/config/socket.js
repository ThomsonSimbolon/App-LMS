const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { jwtConfig } = require('./jwt');
const { User, Role } = require('../models');

/**
 * Socket.IO Configuration
 * 
 * Handles real-time communication for notifications and other events.
 * Uses JWT authentication for socket connections.
 */

let io = null;

/**
 * Initialize Socket.IO server
 * @param {Object} httpServer - HTTP server instance
 * @returns {Object} Socket.IO server instance
 */
const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5174",
      credentials: true,
      methods: ["GET", "POST"]
    },
    transports: ['websocket', 'polling']
  });

  // Authentication middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return next(new Error('Authentication token required'));
      }

      // Verify JWT token
      let decoded;
      try {
        decoded = jwt.verify(token, jwtConfig.accessSecret);
      } catch (err) {
        if (err.name === 'TokenExpiredError') {
          return next(new Error('Token expired'));
        }
        return next(new Error('Invalid token'));
      }

      // Verify user exists and is active
      const user = await User.findByPk(decoded.userId, {
        include: [{
          model: Role,
          as: 'role',
          attributes: ['id', 'name']
        }]
      });

      if (!user || !user.isActive) {
        return next(new Error('User not found or inactive'));
      }

      // Attach user info to socket
      socket.userId = user.id;
      socket.userEmail = user.email;
      socket.roleName = user.role.name;

      next();
    } catch (error) {
      console.error('[Socket] Authentication error:', error);
      next(new Error('Authentication failed'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    const userId = socket.userId;
    const roomName = `user:${userId}`;

    // Join user-specific room
    socket.join(roomName);
    console.log(`[Socket] User ${userId} connected and joined room ${roomName}`);

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log(`[Socket] User ${userId} disconnected: ${reason}`);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error(`[Socket] Error for user ${userId}:`, error);
    });
  });

  return io;
};

/**
 * Get Socket.IO instance
 * @returns {Object|null} Socket.IO instance or null if not initialized
 */
const getIO = () => {
  return io;
};

/**
 * Emit notification to specific user
 * @param {number} userId - User ID to notify
 * @param {Object} notification - Notification object
 */
const emitNotification = (userId, notification) => {
  if (!io) {
    console.warn('[Socket] Socket.IO not initialized, skipping real-time notification');
    return;
  }

  try {
    io.to(`user:${userId}`).emit('notification', notification);
    console.log(`[Socket] Notification emitted to user ${userId}`);
  } catch (error) {
    console.error(`[Socket] Failed to emit notification to user ${userId}:`, error);
  }
};

/**
 * Emit unread count update to specific user
 * @param {number} userId - User ID
 * @param {number} unreadCount - Unread notification count
 */
const emitUnreadCount = (userId, unreadCount) => {
  if (!io) {
    return;
  }

  try {
    io.to(`user:${userId}`).emit('unread_count', { unreadCount });
  } catch (error) {
    console.error(`[Socket] Failed to emit unread count to user ${userId}:`, error);
  }
};

module.exports = {
  initializeSocket,
  getIO,
  emitNotification,
  emitUnreadCount
};

