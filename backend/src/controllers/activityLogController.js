const { ActivityLog, User } = require("../models");
const { Op } = require("sequelize");

/**
 * Get activity logs with filters
 * Admin only endpoint
 */
exports.getActivityLogs = async (req, res) => {
  try {
    // Check if ActivityLog model is available
    if (!ActivityLog) {
      console.error("ActivityLog model is not available");
      return res.status(500).json({
        success: false,
        error: "ActivityLog model not initialized",
        message: "Please ensure DB_AUTO_SYNC=true and restart the server",
      });
    }

    const {
      eventType,
      userId,
      entityType,
      entityId,
      dateFrom,
      dateTo,
      page = 1,
      limit = 50,
    } = req.query;

    // Build where clause
    const where = {};

    if (eventType) {
      where.eventType = eventType;
    }

    if (userId) {
      where.userId = userId;
    }

    if (entityType) {
      where.entityType = entityType;
    }

    if (entityId) {
      where.entityId = entityId;
    }

    // Date range filter
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt[Op.gte] = new Date(dateFrom);
      }
      if (dateTo) {
        where.createdAt[Op.lte] = new Date(dateTo);
      }
    }

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Fetch logs with user information
    let count, logs;
    try {
      const result = await ActivityLog.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [["createdAt", "DESC"]],
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "email", "firstName", "lastName"],
            required: false,
          },
        ],
      });
      count = result.count;
      logs = result.rows;
    } catch (dbError) {
      // If table doesn't exist, provide helpful error
      if (
        dbError.name === "SequelizeDatabaseError" &&
        dbError.message.includes("doesn't exist")
      ) {
        return res.status(500).json({
          success: false,
          error: "Database table not found",
          message:
            "activity_logs table does not exist. Please set DB_AUTO_SYNC=true in .env and restart the server.",
        });
      }
      throw dbError; // Re-throw other errors
    }

    // Format response
    const formattedLogs = logs.map((log) => {
      let metadata = null;
      try {
        if (log.metadata) {
          metadata =
            typeof log.metadata === "string"
              ? JSON.parse(log.metadata)
              : log.metadata;
        }
      } catch (parseError) {
        console.error("Failed to parse metadata for log", log.id, parseError);
        metadata = { error: "Failed to parse metadata" };
      }

      return {
        id: log.id,
        eventType: log.eventType,
        entityType: log.entityType,
        entityId: log.entityId,
        metadata,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        user: log.user
          ? {
              id: log.user.id,
              email: log.user.email,
              firstName: log.user.firstName,
              lastName: log.user.lastName,
            }
          : null,
        createdAt: log.createdAt,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        logs: formattedLogs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error("Get activity logs error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
};

/**
 * Get activity log statistics
 * Admin only endpoint
 */
exports.getActivityLogStats = async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;

    const where = {};
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt[Op.gte] = new Date(dateFrom);
      }
      if (dateTo) {
        where.createdAt[Op.lte] = new Date(dateTo);
      }
    }

    // Get total logs
    const totalLogs = await ActivityLog.count({ where });

    // Get logs by event type
    const logsByEventType = await ActivityLog.findAll({
      where,
      attributes: [
        "eventType",
        [
          ActivityLog.sequelize.fn(
            "COUNT",
            ActivityLog.sequelize.col("ActivityLog.id")
          ),
          "count",
        ],
      ],
      group: ["ActivityLog.eventType"],
      raw: true,
    });

    // Get logs by entity type
    const logsByEntityType = await ActivityLog.findAll({
      where,
      attributes: [
        "entityType",
        [
          ActivityLog.sequelize.fn(
            "COUNT",
            ActivityLog.sequelize.col("ActivityLog.id")
          ),
          "count",
        ],
      ],
      group: ["ActivityLog.entityType"],
      raw: true,
    });

    // Get unique users count (using subquery for better compatibility)
    const uniqueUsersQuery = await ActivityLog.sequelize.query(
      `SELECT COUNT(DISTINCT userId) as count FROM activity_logs WHERE userId IS NOT NULL`,
      { type: ActivityLog.sequelize.QueryTypes.SELECT }
    );
    const uniqueUsers = uniqueUsersQuery[0]?.count || 0;

    res.status(200).json({
      success: true,
      data: {
        totalLogs,
        uniqueUsers: parseInt(uniqueUsers) || 0,
        byEventType: logsByEventType.map((item) => ({
          eventType: item.eventType,
          count: parseInt(item.count || 0),
        })),
        byEntityType: logsByEntityType.map((item) => ({
          entityType: item.entityType,
          count: parseInt(item.count || 0),
        })),
      },
    });
  } catch (error) {
    console.error("Get activity log stats error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
};
