import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Your Cloudinary configuration should already be in a file like `config/cloudinary.js`
// and imported, but we'll re-state it here for clarity. This code assumes your
// .env variables are loaded correctly.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure the Cloudinary storage engine
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'user_documents', // The name of the folder in your Cloudinary account
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'], // Restrict file types
  },
});

// Initialize Multer with the new Cloudinary storage engine
const upload = multer({ storage: storage });

// Create and export the middleware for your specific form fields
export const documentUpload = upload.fields([
  { name: 'pancard', maxCount: 1 },
  { name: 'adharFront', maxCount: 1 },
  { name: 'adharBack', maxCount: 1 },
]);