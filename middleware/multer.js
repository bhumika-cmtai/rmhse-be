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

export const documentUpload = upload.fields([
  { name: 'pancard', maxCount: 1 },
  { name: 'adharFront', maxCount: 1 },
  { name: 'adharBack', maxCount: 1 },
]);