const cloudinary = require('../config/cloudinary');

// Upload image (thumbnail, profile pic, etc.)
exports.uploadImage = async (file, folder = 'images') => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: `lms/${folder}`,
      resource_type: 'image',
      transformation: [
        { width: 1200, height: 630, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      size: result.bytes
    };
  } catch (error) {
    console.error('Image upload error:', error);
    throw new Error('Failed to upload image');
  }
};

// Upload video
exports.uploadVideo = async (file, folder = 'videos') => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: `lms/${folder}`,
      resource_type: 'video',
      chunk_size: 6000000 // 6MB chunks for large files
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      duration: result.duration,
      size: result.bytes
    };
  } catch (error) {
    console.error('Video upload error:', error);
    throw new Error('Failed to upload video');
  }
};

// Upload PDF
exports.uploadPDF = async (file, folder = 'pdfs') => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: `lms/${folder}`,
      resource_type: 'raw',
      format: 'pdf'
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      size: result.bytes
    };
  } catch (error) {
    console.error('PDF upload error:', error);
    throw new Error('Failed to upload PDF');
  }
};

// Delete file from Cloudinary
exports.deleteFile = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });
    return result;
  } catch (error) {
    console.error('File delete error:', error);
    throw new Error('Failed to delete file');
  }
};
