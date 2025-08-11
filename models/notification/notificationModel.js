import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Notification title is required.'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Notification message is required.'],
      trim: true,
    },
    link: {
      type: String, // An optional link, e.g., "/events/new-year-party"
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true, 
  }
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;