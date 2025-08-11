import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js'; // Import the CONFIGURED instance

// This is the entire file. There is no cloudinary.config() here.
// It uses the already-configured instance from your config file.

const storage = new CloudinaryStorage({
  cloudinary: cloudinary, // Use the imported, pre-configured instance
  params: {
    folder: 'user_documents',
    allowed_formats: ['jpg', 'jpeg', 'png'],
  },
});

const upload = multer({ storage: storage });

// --- MODIFICATION START ---
// NEW storage configuration specifically for profile images
const profileImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'profile_images', // Store profile images in a separate folder
    allowed_formats: ['jpg', 'png', 'jpeg'],
    // Optional: add a transformation to resize images
    transformation: [{ width: 500, height: 500, crop: 'limit' }] 
  },
});
// --- MODIFICATION END ---

// --- NEW: Storage configuration specifically for videos ---
const videoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'videos', // Store videos in a dedicated 'videos' folder
    resource_type: 'video', // Must specify 'video' for video files
    allowed_formats: ['mp4', 'mov', 'avi', 'mkv'], // Define allowed video formats
    
    // Optional: For large files, this helps in more reliable uploads.
    // The value is in bytes (e.g., 6,000,000 = 6MB).
    chunk_size: 6000000, 
  },
});


export const documentUpload = upload.fields([
  { name: 'pancard', maxCount: 1 },
  { name: 'adharFront', maxCount: 1 },
  { name: 'adharBack', maxCount: 1 },
]);

export const profileImageUpload = multer({ storage: profileImageStorage }).single('profileImage');

export const videoUpload = multer({ storage: videoStorage }).single('video')