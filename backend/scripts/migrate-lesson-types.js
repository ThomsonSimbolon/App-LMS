/**
 * Lesson Types Migration Script
 *
 * Safely migrates existing lessons from old types (PDF/TEXT) to new types (MATERIAL)
 * and converts content from TEXT to JSON format.
 *
 * Usage:
 *   node scripts/migrate-lesson-types.js --dry-run    # Preview changes
 *   node scripts/migrate-lesson-types.js                # Execute migration
 *   node scripts/migrate-lesson-types.js --rollback    # Rollback migration
 */

require("dotenv").config();
const mysql = require("mysql2/promise");
const fs = require("fs").promises;
const path = require("path");

// Configuration
const DRY_RUN = process.argv.includes("--dry-run");
const ROLLBACK = process.argv.includes("--rollback");
const BACKUP_DIR = path.join(__dirname, "../migration-backups");

// Migration report
const report = {
  startTime: new Date(),
  endTime: null,
  mode: DRY_RUN ? "DRY_RUN" : ROLLBACK ? "ROLLBACK" : "MIGRATION",
  stats: {
    totalLessons: 0,
    migratedLessons: 0,
    skippedLessons: 0,
    errors: [],
  },
  changes: [],
};

/**
 * Create database connection
 */
async function createConnection() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "lms_db",
    multipleStatements: true,
  });

  return connection;
}

/**
 * Create backup directory
 */
async function ensureBackupDir() {
  try {
    await fs.mkdir(BACKUP_DIR, { recursive: true });
  } catch (error) {
    if (error.code !== "EEXIST") {
      throw error;
    }
  }
}

/**
 * Backup existing data
 */
async function backupData(connection) {
  console.log("📦 Creating backup...\n");

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupFile = path.join(BACKUP_DIR, `lessons-backup-${timestamp}.sql`);

  // Get all lessons data
  const [lessons] = await connection.query(`
    SELECT id, section_id, title, type, content, duration, \`order\`, is_required, is_free, created_at, updated_at
    FROM lessons
    ORDER BY id
  `);

  const backupData = {
    timestamp: new Date().toISOString(),
    totalLessons: lessons.length,
    lessons: lessons,
  };

  await fs.writeFile(backupFile, JSON.stringify(backupData, null, 2));
  console.log(`✅ Backup created: ${backupFile}\n`);

  return backupFile;
}

/**
 * Get lessons that need migration
 */
async function getLessonsToMigrate(connection) {
  // Get lessons with old types (PDF, TEXT) or content that's not JSON
  const [lessons] = await connection.query(`
    SELECT id, section_id, title, type, content, duration, \`order\`, is_required, is_free
    FROM lessons
    WHERE type IN ('PDF', 'TEXT')
       OR (type NOT IN ('PDF', 'TEXT') AND content IS NOT NULL AND content NOT LIKE '{%')
    ORDER BY id
  `);

  return lessons;
}

/**
 * Convert content to JSON format based on type
 */
function convertContentToJSON(lesson) {
  const { type, content, duration } = lesson;

  // If content is already JSON object (starts with {), return as is
  if (
    content &&
    typeof content === "string" &&
    content.trim().startsWith("{")
  ) {
    try {
      return JSON.parse(content);
    } catch (e) {
      // If parse fails, treat as string
    }
  }

  // If content is already an object, return as is
  if (content && typeof content === "object") {
    return content;
  }

  // Convert based on type
  switch (type) {
    case "VIDEO":
      return {
        videoUrl: content || "",
        duration: duration || 0,
        minWatchPercentage: 80,
      };

    case "PDF":
    case "MATERIAL":
      if (content && (content.includes(".pdf") || content.includes(".PDF"))) {
        return {
          fileUrl: content,
          fileType: "PDF",
        };
      } else {
        return {
          content: content || "",
        };
      }

    case "TEXT":
      return {
        content: content || "",
      };

    case "LIVE_SESSION":
      return {
        meetingUrl: content || "",
        scheduledAt: null,
        duration: duration || 0,
      };

    case "ASSIGNMENT":
      return {
        instructions: content || "",
        submissionType: "ANY",
        deadline: null,
        maxScore: 100,
      };

    case "QUIZ":
    case "EXAM":
      return {
        quizId: null,
        passingScore: 70,
        timeLimit: null,
      };

    case "DISCUSSION":
      return {
        topic: "",
        instructions: content || "",
      };

    default:
      return {
        content: content || "",
      };
  }
}

/**
 * Execute migration
 */
async function executeMigration(connection) {
  console.log("🔄 Starting migration...\n");

  const lessons = await getLessonsToMigrate(connection);
  report.stats.totalLessons = lessons.length;

  if (lessons.length === 0) {
    console.log(
      "✅ No lessons need migration. All lessons are already in the new format.\n"
    );
    return;
  }

  console.log(`Found ${lessons.length} lessons to migrate:\n`);

  for (const lesson of lessons) {
    try {
      const oldType = lesson.type;
      const oldContent = lesson.content;

      // Determine new type
      let newType = oldType;
      if (oldType === "PDF" || oldType === "TEXT") {
        newType = "MATERIAL";
      }

      // Convert content to JSON
      const newContent = convertContentToJSON({
        ...lesson,
        type: newType,
      });

      // Preview change
      const change = {
        lessonId: lesson.id,
        title: lesson.title,
        oldType,
        newType,
        oldContent:
          typeof oldContent === "string"
            ? oldContent.substring(0, 100)
            : oldContent,
        newContent: JSON.stringify(newContent).substring(0, 100),
      };

      report.changes.push(change);

      if (DRY_RUN) {
        console.log(
          `[DRY-RUN] Would migrate lesson #${lesson.id}: "${lesson.title}"`
        );
        console.log(`  Type: ${oldType} → ${newType}`);
        console.log(
          `  Content: ${
            typeof oldContent === "string"
              ? oldContent.substring(0, 50) + "..."
              : "Object"
          } → JSON\n`
        );
      } else {
        // Execute migration
        await connection.query(
          `
          UPDATE lessons
          SET type = ?,
              content = ?,
              updated_at = NOW()
          WHERE id = ?
        `,
          [newType, JSON.stringify(newContent), lesson.id]
        );

        console.log(
          `✅ Migrated lesson #${lesson.id}: "${lesson.title}" (${oldType} → ${newType})`
        );
        report.stats.migratedLessons++;
      }
    } catch (error) {
      console.error(
        `❌ Error migrating lesson #${lesson.id}: ${error.message}`
      );
      report.stats.errors.push({
        lessonId: lesson.id,
        error: error.message,
      });
      report.stats.skippedLessons++;
    }
  }

  console.log("\n");
}

/**
 * Rollback migration
 */
async function rollbackMigration(connection) {
  console.log("⏪ Starting rollback...\n");

  // Find latest backup
  const files = await fs.readdir(BACKUP_DIR);
  const backupFiles = files
    .filter((f) => f.startsWith("lessons-backup-") && f.endsWith(".sql"))
    .sort()
    .reverse();

  if (backupFiles.length === 0) {
    console.error("❌ No backup files found. Cannot rollback.\n");
    return;
  }

  const latestBackup = backupFiles[0];
  const backupPath = path.join(BACKUP_DIR, latestBackup);
  console.log(`📦 Loading backup: ${latestBackup}\n`);

  const backupData = JSON.parse(await fs.readFile(backupPath, "utf8"));

  console.log(`Found ${backupData.lessons.length} lessons in backup\n`);

  for (const lesson of backupData.lessons) {
    try {
      if (DRY_RUN) {
        console.log(
          `[DRY-RUN] Would restore lesson #${lesson.id}: "${lesson.title}"`
        );
      } else {
        // Restore lesson
        await connection.query(
          `
          UPDATE lessons
          SET type = ?,
              content = ?,
              duration = ?,
              \`order\` = ?,
              is_required = ?,
              is_free = ?,
              updated_at = ?
          WHERE id = ?
        `,
          [
            lesson.type,
            typeof lesson.content === "object"
              ? JSON.stringify(lesson.content)
              : lesson.content,
            lesson.duration,
            lesson.order,
            lesson.is_required,
            lesson.is_free,
            lesson.updated_at,
            lesson.id,
          ]
        );

        console.log(`✅ Restored lesson #${lesson.id}: "${lesson.title}"`);
        report.stats.migratedLessons++;
      }
    } catch (error) {
      console.error(
        `❌ Error restoring lesson #${lesson.id}: ${error.message}`
      );
      report.stats.errors.push({
        lessonId: lesson.id,
        error: error.message,
      });
    }
  }

  console.log("\n");
}

/**
 * Validate migration
 */
async function validateMigration(connection) {
  console.log("🔍 Validating migration...\n");

  // Check for old types
  const [oldTypes] = await connection.query(`
    SELECT COUNT(*) as count
    FROM lessons
    WHERE type IN ('PDF', 'TEXT')
  `);

  if (oldTypes[0].count > 0) {
    console.log(
      `⚠️  Warning: ${oldTypes[0].count} lessons still have old types (PDF/TEXT)\n`
    );
  } else {
    console.log("✅ No lessons with old types found\n");
  }

  // Check for invalid JSON content
  const [invalidJson] = await connection.query(`
    SELECT COUNT(*) as count
    FROM lessons
    WHERE content IS NOT NULL 
      AND content NOT LIKE '{%'
      AND content != ''
  `);

  if (invalidJson[0].count > 0) {
    console.log(
      `⚠️  Warning: ${invalidJson[0].count} lessons have non-JSON content\n`
    );
  } else {
    console.log("✅ All lesson content is in JSON format\n");
  }

  // Check total lessons
  const [total] = await connection.query(
    `SELECT COUNT(*) as count FROM lessons`
  );
  console.log(`📊 Total lessons in database: ${total[0].count}\n`);
}

/**
 * Generate migration report
 */
async function generateReport() {
  report.endTime = new Date();
  const duration = (report.endTime - report.startTime) / 1000;

  const reportFile = path.join(
    BACKUP_DIR,
    `migration-report-${Date.now()}.json`
  );
  await fs.writeFile(reportFile, JSON.stringify(report, null, 2));

  console.log("📊 Migration Report:");
  console.log("=".repeat(50));
  console.log(`Mode: ${report.mode}`);
  console.log(`Duration: ${duration.toFixed(2)}s`);
  console.log(`Total Lessons: ${report.stats.totalLessons}`);
  console.log(`Migrated: ${report.stats.migratedLessons}`);
  console.log(`Skipped: ${report.stats.skippedLessons}`);
  console.log(`Errors: ${report.stats.errors.length}`);
  console.log(`Report saved: ${reportFile}\n`);

  if (report.stats.errors.length > 0) {
    console.log("❌ Errors:");
    report.stats.errors.forEach((err) => {
      console.log(`  - Lesson #${err.lessonId}: ${err.error}`);
    });
    console.log("");
  }
}

/**
 * Main function
 */
async function main() {
  console.log("🚀 Lesson Types Migration Script\n");
  console.log(
    `Mode: ${
      DRY_RUN ? "DRY-RUN (Preview Only)" : ROLLBACK ? "ROLLBACK" : "MIGRATION"
    }\n`
  );

  let connection;

  try {
    connection = await createConnection();
    console.log("✅ Connected to database\n");

    await ensureBackupDir();

    if (ROLLBACK) {
      await rollbackMigration(connection);
    } else {
      // Backup data first
      if (!DRY_RUN) {
        await backupData(connection);
      }

      // Execute migration
      await executeMigration(connection);

      // Validate migration
      if (!DRY_RUN) {
        await validateMigration(connection);
      }
    }

    await generateReport();

    if (DRY_RUN) {
      console.log("💡 This was a dry-run. No changes were made.");
      console.log("   Run without --dry-run to execute the migration.\n");
    } else if (!ROLLBACK) {
      console.log("✅ Migration completed successfully!\n");
    } else {
      console.log("✅ Rollback completed successfully!\n");
    }
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run migration
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
