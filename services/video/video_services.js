// services/video/video_service.js

import Video from "../../models/video/videoModel.js";
import cloudinary from "../../config/cloudinary.js"; 
import consoleManager from "../../utils/consoleManager.js";

class VideoService {
  /**
   * Sets or updates the single homepage video.
   * If a video already exists, it's replaced in Cloudinary and the DB.
   * If not, a new one is created.
   * @param {object} body - Text data (title, description).
   * @param {object} file - The new video file object from Multer.
   * @returns {Promise<Video>}
   */
  async setHomepageVideo(body) {
    try {
      // Find the existing video document, if any. This part is still correct.
      const existingVideo = await Video.findOne();

      // If a video already exists, we must delete the old one from Cloudinary.
      if (existingVideo) {
        consoleManager.log(`Replacing existing video. Deleting old file: ${existingVideo.public_id}`);
        await cloudinary.uploader.destroy(existingVideo.public_id, { resource_type: 'video' });
      }

      // The 'body' object now contains title, url, public_id, etc.
      // We no longer need a 'file' object.
      const videoData = {
        ...body,
        updatedOn: Date.now(),
      };
      
      // The "upsert" logic remains the same and is correct.
      const updatedVideo = await Video.findOneAndUpdate(
        {}, // An empty filter will match the first document found
        videoData,
        { 
          new: true, // Return the new/updated document
          upsert: true, // Create the document if it doesn't exist
          setDefaultsOnInsert: true, // Apply 'createdOn' default if creating
        }
      );

      consoleManager.log("Homepage video has been set/updated successfully.");
      return updatedVideo;
    } catch (err) {
      consoleManager.error(`Error setting homepage video: ${err.message}`);
      // IMPORTANT: We remove the cleanup logic here.
      // The file is already on Cloudinary. This function's only job is to
      // save the details to the database. If that fails, we just report the error.
      // Trying to delete the *newly* uploaded file would add a lot of complexity.
      throw err;
    }
  }

  /**
   * Retrieves the single homepage video.
   * @returns {Promise<Video|null>}
   */
  async getHomepageVideo() {
    try {
      // Since there's only one, findOne() is all we need.
      const video = await Video.findOne();
      return video;
    } catch (err) {
      consoleManager.error(`Error fetching homepage video: ${err.message}`);
      throw err;
    }
  }

  /**
   * Deletes the single homepage video from Cloudinary and the database.
   * @returns {Promise<Video|null>}
   */
  async deleteHomepageVideo() {
    try {
      const video = await Video.findOne();

      if (!video) {
        consoleManager.error("No video found to delete.");
        return null;
      }

      // 1. Delete the file from Cloudinary using its public_id.
      await cloudinary.uploader.destroy(video.public_id, { resource_type: 'video' });
      
      // 2. Delete the document from the database.
      await Video.findByIdAndDelete(video._id);

      consoleManager.log("Homepage video deleted successfully.");
      return video; // Return the data of the deleted video.
    } catch (err) {
      consoleManager.error(`Error deleting homepage video: ${err.message}`);
      throw err;
    }
  }
}

export default new VideoService();