import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Helper function to upload files to Cloudinary
export const uploadToCloudinary = (filePath, folder = "user_documents") => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(filePath, { folder: folder }, (error, result) => {
            if (error) reject(error);
            resolve(result);
        });
    });
};

export default cloudinary;