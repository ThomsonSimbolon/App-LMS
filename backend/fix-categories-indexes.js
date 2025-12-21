/**
 * Script to cleanup duplicate indexes in categories and roles tables
 * Run: node fix-categories-indexes.js
 */

require("dotenv").config();
const mysql = require("mysql2/promise");

async function cleanupIndexesForTable(connection, tableName, keepIndexes) {
  try {
    console.log(`🔍 Checking indexes on ${tableName} table...\n`);

    // Get all indexes
    const [indexes] = await connection.query(`SHOW INDEXES FROM ${tableName}`);

    console.log(`Found ${indexes.length} total indexes\n`);

    // Find duplicate indexes (name_2, name_3, etc.)
    const duplicates = indexes.filter((idx) => {
      const name = idx.Key_name;
      // Match patterns: name_2, name_3, slug_2, slug_3, etc.
      const isDuplicate =
        name.match(/^\w+_\d+$/) ||
        (tableName === "categories" &&
          name.match(/^categories_(name|slug)_\d+$/)) ||
        (tableName === "roles" && name.match(/^roles_name_\d+$/));
      const isKeep = keepIndexes.includes(name);
      return isDuplicate && !isKeep;
    });

    if (duplicates.length === 0) {
      console.log("✅ No duplicate indexes found. Table is clean!");
      return;
    }

    console.log(
      `⚠️  Found ${duplicates.length} duplicate indexes to remove:\n`
    );
    duplicates.forEach((idx) => {
      console.log(`   - ${idx.Key_name} on ${idx.Column_name}`);
    });

    console.log("\n🗑️  Dropping duplicate indexes...\n");

    // Group by index name to avoid dropping same index multiple times
    const uniqueIndexNames = [
      ...new Set(duplicates.map((idx) => idx.Key_name)),
    ];

    // Drop duplicates
    let dropped = 0;
    let failed = 0;

    for (const indexName of uniqueIndexNames) {
      try {
        await connection.query(`DROP INDEX \`${indexName}\` ON ${tableName}`);
        console.log(`✅ Dropped index: ${indexName}`);
        dropped++;
      } catch (err) {
        console.log(`❌ Failed to drop ${indexName}:`, err.message);
        failed++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   - Dropped: ${dropped}`);
    console.log(`   - Failed: ${failed}`);

    // Verify final indexes
    console.log(`\n🔍 Verifying final indexes on ${tableName}...\n`);
    const [finalIndexes] = await connection.query(
      `SHOW INDEXES FROM ${tableName}`
    );
    console.log(`Final indexes (${finalIndexes.length}):\n`);

    const indexMap = {};
    finalIndexes.forEach((idx) => {
      if (!indexMap[idx.Key_name]) {
        indexMap[idx.Key_name] = {
          name: idx.Key_name,
          columns: [],
          unique: idx.Non_unique === 0,
        };
      }
      indexMap[idx.Key_name].columns.push(idx.Column_name);
    });

    Object.values(indexMap).forEach((idx) => {
      console.log(
        `   - ${idx.name} on (${idx.columns.join(", ")}) ${
          idx.unique ? "[UNIQUE]" : ""
        }`
      );
    });

    if (finalIndexes.length > 64) {
      console.log(
        `\n⚠️  WARNING: ${tableName} still has more than 64 indexes. Manual cleanup may be needed.`
      );
    } else {
      console.log(
        `\n✅ Cleanup complete for ${tableName}! Table is now ready.`
      );
    }

    return { dropped, failed, finalCount: finalIndexes.length };
  } catch (error) {
    console.error(`\n❌ Error processing ${tableName}:`, error.message);
    return { dropped: 0, failed: 1, finalCount: 0 };
  }
}

async function cleanupIndexes() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "lms_db",
  });

  try {
    const tables = [
      {
        name: "categories",
        keep: [
          "PRIMARY",
          "name",
          "slug",
          "categories_slug",
          "categories_name_unique",
          "categories_slug_unique",
        ],
      },
      {
        name: "roles",
        keep: ["PRIMARY", "name", "roles_name", "roles_name_unique"],
      },
      {
        name: "users",
        keep: [
          "PRIMARY",
          "email",
          "users_email_unique",
          "roleId",
          "isEmailVerified",
        ],
      },
      {
        name: "courses",
        keep: [
          "PRIMARY",
          "slug",
          "courses_slug_unique",
          "categoryId",
          "instructorId",
          "isPublished",
          "version",
        ],
      },
      {
        name: "certificates",
        keep: [
          "PRIMARY",
          "certificateNumber",
          "certificates_certificateNumber_unique",
          "userId",
          "courseId",
          "status",
          "courseVersion",
        ],
      },
      {
        name: "permissions",
        keep: ["PRIMARY", "name", "permissions_name_unique", "resource"],
      },
    ];

    for (const table of tables) {
      await cleanupIndexesForTable(connection, table.name, table.keep);
      console.log("\n" + "=".repeat(60) + "\n");
    }

    console.log("✅ All cleanup operations completed!\n");
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

cleanupIndexes();
