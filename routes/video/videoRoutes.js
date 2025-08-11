// routes/video/video_route.js

import express from "express";
import VideoService from "../../services/video/video_services.js";
import { videoUpload } from "../../middleware/multer.js"; // Your configured Multer instance
import ResponseManager from "../../utils/responseManager.js";
import consoleManager from "../../utils/consoleManager.js";
import cloudinary from "../../config/cloudinary.js";

const router = express.Router();

// --- How you will FETCH the video for your homepage ---
// GET /api/video/
router.get('/', async (req, res) => {
  try {
    const video = await VideoService.getHomepageVideo();
    if (video) {
      ResponseManager.sendSuccess(res, video, 200, 'Homepage video retrieved successfully.');
    } else {
      ResponseManager.sendSuccess(res, null, 200, 'No homepage video has been set.');
    }
  } catch (err) {
    ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error fetching homepage video.');
  }
});

// Set or Update the homepage video
// POST /api/video/
router.post('/', videoUpload, async (req, res) => {
  try {
    if (!req.file) {
      return ResponseManager.sendError(res, 400, 'BAD_REQUEST', 'A video file is required.');
    }
    const video = await VideoService.setHomepageVideo(req.body, req.file);
    return ResponseManager.sendSuccess(res, video, 201, 'Homepage video set successfully.');
  } catch (err) {
    consoleManager.error(err);
    return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error setting homepage video.');
  }
});

// Delete the homepage video
// DELETE /api/video/
router.delete('/', async (req, res) => {
  try {
    const video = await VideoService.deleteHomepageVideo();
    if (video) {
      ResponseManager.sendSuccess(res, video, 200, 'Homepage video deleted successfully.');
    } else {
      ResponseManager.sendError(res, 404, 'NOT_FOUND', 'No video found to delete.');
    }
  } catch (err) {
    ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error deleting homepage video.');
  }
});

// --- NEW: Route to provide an upload signature ---
// GET /api/video/signature
router.get('/signature', (req, res) => {
    try {
      const timestamp = Math.round((new Date).getTime() / 1000);
  
      // Get the signature from Cloudinary's API
      const signature = cloudinary.utils.api_sign_request(
          {
              timestamp: timestamp,
              // Add any other parameters you want to sign, e.g., a folder
              folder: 'videos' ,
              source: 'uw' 

              
          },
          process.env.CLOUDINARY_API_SECRET
      );
  
      const payload = {
        timestamp: timestamp,
        signature: signature
      };
  
      ResponseManager.sendSuccess(res, payload, 200, 'Signature generated successfully.');
    } catch(err) {
      ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error generating signature.');
    }
  });
  
  // --- MODIFIED: Route to SAVE video details after client-side upload ---
  // This route no longer uses Multer. It just receives text data.
  // POST /api/video/save-details
  router.post('/save-details', async (req, res) => {
    try {
      // The body will contain { title, description, url, public_id } sent from the client
      const video = await VideoService.setHomepageVideo(req.body); // We need to adapt the service
      ResponseManager.sendSuccess(res, video, 201, 'Video details saved successfully.');
    } catch (err) {
      ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error saving video details.');
    }
  });


export default router;