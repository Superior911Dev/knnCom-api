const { v2: cloudinary } = require('cloudinary');

// ลบไฟล์จาก Cloudinary
const deleteFromCloudinary = async (publicId) => {
  if (!publicId || typeof publicId !== 'string' || publicId.trim() === '') {
      throw new Error(`Invalid Public ID: ${publicId}`);
  }

  try {
      const result = await cloudinary.uploader.destroy(publicId);
      console.log(`Successfully deleted: ${publicId}`, result);
      return result;
  } catch (error) {
      console.error(`Failed to delete Public ID: ${publicId}`, error);
      throw error;
  }
};


module.exports = { deleteFromCloudinary };
