require("dotenv").config();
const http = require("http");
const app = require("./src/app");
const { sequelize, testConnection } = require("./src/config/database");
const { initializeSocket } = require("./src/config/socket");

const PORT = process.env.PORT || 5040;

const startServer = async () => {
  try {
    // Import models to register them with Sequelize
    require("./src/models");
    console.log("📦 Models loaded successfully");

    // Test database connection
    await testConnection();

    // Sync database models based on DB_AUTO_SYNC environment variable
    const autoSync = process.env.DB_AUTO_SYNC === "true";

    if (autoSync) {
      console.log(
        "🔄 Auto-sync is ENABLED - Tables will be created/updated automatically"
      );

      // Use 'alter' in development to update existing tables
      // Use 'force' ONLY if you want to drop and recreate tables (DANGEROUS!)
      const syncMode = process.env.NODE_ENV === "development" ? "alter" : false;

      if (syncMode === "alter") {
        await sequelize.sync({ alter: true });
        console.log(
          "✅ Database tables synced successfully (ALTER mode - safe updates)"
        );
      } else {
        await sequelize.sync();
        console.log("✅ Database tables synced successfully (CREATE mode)");
      }
    } else {
      console.log("⏸️  Auto-sync is DISABLED - No automatic table changes");
      console.log("💡 Set DB_AUTO_SYNC=true in .env to enable auto-sync");
    }

    // Create HTTP server
    const httpServer = http.createServer(app);

    // Initialize Socket.IO
    const io = initializeSocket(httpServer);
    console.log("🔌 Socket.IO initialized");

    // Make io available globally via app.locals for use in controllers/services
    app.locals.io = io;

    // Start server
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`📍 API available at: http://localhost:${PORT}/api`);
      console.log(`🔧 Auto-sync: ${autoSync ? "ON ✅" : "OFF ⏸️"}`);
      console.log(`🔌 Socket.IO: Enabled`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
