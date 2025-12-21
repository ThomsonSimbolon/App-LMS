const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Ensure course-thumbnails subdirectory exists
const thumbnailsDir = path.join(uploadsDir, "course-thumbnails");
if (!fs.existsSync(thumbnailsDir)) {
  fs.mkdirSync(thumbnailsDir, { recursive: true });
}

/**
 * Upload image to local storage
 * @param {Object} file - Multer file object
 * @param {String} folder - Subfolder within uploads (e.g., 'course-thumbnails')
 * @returns {Object} Upload result with URL and filename
 */
exports.uploadImage = async (file, folder = "images") => {
  try {
    if (!file) {
      throw new Error("No file provided");
    }

    // Get file extension
    const ext = path.extname(file.originalname);

    // Generate unique filename
    const filename = `${uuidv4()}${ext}`;

    // Create folder path
    const folderPath = path.join(uploadsDir, folder);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    // Destination path
    const destPath = path.join(folderPath, filename);

    // Move file from temp location to destination
    fs.renameSync(file.path, destPath);

    // Return URL path (will be served by express.static)
    const url = `/uploads/${folder}/${filename}`;

    return {
      url,
      filename,
      path: destPath,
      size: file.size,
      mimetype: file.mimetype,
    };
  } catch (error) {
    console.error("Local image upload error:", error);
    throw new Error("Failed to upload image to local storage");
  }
};

/**
 * Delete file from local storage
 * @param {String} filePath - Relative path to file (e.g., '/uploads/course-thumbnails/filename.jpg')
 */
exports.deleteFile = async (filePath) => {
  try {
    // Remove leading slash and convert to absolute path
    const relativePath = filePath.startsWith("/")
      ? filePath.slice(1)
      : filePath;
    const absolutePath = path.join(__dirname, "../../", relativePath);

    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Local file delete error:", error);
    throw new Error("Failed to delete file from local storage");
  }
};
