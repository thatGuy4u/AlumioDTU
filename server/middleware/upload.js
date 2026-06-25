import multer from 'multer';
import cloudinary from '../config/cloudinary.js';

// Use memory storage — files stay in memory buffer, then we upload to Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (allowedTypes) => (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} not allowed. Accepted: ${allowedTypes.join(', ')}`), false);
  }
};

/**
 * Upload buffer to Cloudinary.
 */
export const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
    stream.end(buffer);
  });
};

// Avatar upload middleware
export const uploadAvatar = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: fileFilter(['image/jpeg', 'image/png', 'image/webp']),
});

// Resume upload middleware
export const uploadResume = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: fileFilter([
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ]),
});

// Chat attachment upload middleware
export const uploadAttachment = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: fileFilter([
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ]),
});

// Event cover upload middleware
export const uploadEventCover = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter(['image/jpeg', 'image/png', 'image/webp']),
});
