const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinary'); // Import cloudinary configuration

// Cloudinary Storage Configuration
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'product_images', // Specify folder name in Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg'], // Allowed file formats
    public_id: (req, file) => {
      // Generate unique file name
      return `product_${Date.now()}_${file.originalname.split('.')[0]}`;
    },
  },
});

// File Filter to restrict file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (!allowedTypes.includes(file.mimetype)) {
    const error = new Error('รองรับเฉพาะไฟล์ภาพ (JPEG, PNG)');
    error.code = 'INVALID_FILE_TYPE';
    return cb(error, false);
  }
  cb(null, true);
};

// Multer Upload Configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Set maximum file size to 5MB
  },
});

// Middleware for handling errors
upload.handleErrors = (err, req, res, next) => {
  if (err.code === 'INVALID_FILE_TYPE') {
    return res.status(400).json({ error: 'ชนิดไฟล์ไม่ถูกต้อง' });
  }
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'ไฟล์มีขนาดใหญ่เกินไป' });
  }
  // Forward other errors
  next(err);
};

module.exports = upload;
