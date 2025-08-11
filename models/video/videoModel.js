import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    // required: [true, 'Video title is required.'],
    trim: true,
  },
  url: {
    type: String,
    // required: [true, 'Video URL is required.'],
  },

  public_id: {
    type: String,
    required: [true, 'Cloudinary public_id is required.'],
  },

  createdOn: {
    type: Date,
    default: Date.now,
  },
  updatedOn: {
    type: Date,
    default: Date.now,
  },
});

const Video = mongoose.model("Video", videoSchema);

export default Video;