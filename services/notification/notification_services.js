import Notification from "../../models/notification/notificationModel.js";
import consoleManager from "../../utils/consoleManager.js";

class NotificationService {
  /**
   * Creates a new notification.
   * @param {object} data - { title, message, link? }
   * @returns {Promise<Notification>}
   */
  async createNotification(data) {
    try {
      const notification = new Notification(data);
      await notification.save();
      consoleManager.log("Notification created successfully.");
      return notification;
    } catch (err) {
      consoleManager.error(`Error creating notification: ${err.message}`);
      throw err;
    }
  }

  /**
   * Retrieves a single notification by its ID.
   * @param {string} notificationId
   * @returns {Promise<Notification|null>}
   */
  async getNotificationById(notificationId) {
    try {
      const notification = await Notification.findById(notificationId);
      if (!notification) {
        consoleManager.error("Notification not found.");
      }
      return notification;
    } catch (err) {
      consoleManager.error(`Error fetching notification by ID: ${err.message}`);
      throw err;
    }
  }

  /**
   * Retrieves the single most recent notification.
   * @returns {Promise<Notification|null>}
   */
  async getLatestNotification() {
    try {
      // Find one record and sort by createdAt in descending order (-1)
      // This is the most efficient way to get the latest document.
      const notification = await Notification.findOne().sort({ createdAt: -1 });
      return notification;
    } catch (err) {
      consoleManager.error(`Error fetching latest notification: ${err.message}`);
      throw err;
    }
  }

  /**
   * Retrieves all notifications with pagination, sorted by most recent.
   * @param {number} page
   * @param {number} limit
   * @returns {Promise<object>}
   */
  async getAllNotifications(page = 1, limit = 10) {
    try {
      const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: { createdAt: -1 }
      };

      //const result = await Notification.paginate({}, options); // Assuming you use mongoose-paginate-v2
      
      // If not using a pagination plugin, you can do it manually:
    
      const notifications = await Notification.find()
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
      const totalDocuments = await Notification.countDocuments();
      const totalPages = Math.ceil(totalDocuments / limit);
      const result = { docs: notifications, totalPages, page };
    

      return result;
    } catch (err) {
      consoleManager.error(`Error fetching all notifications: ${err.message}`);
      throw err;
    }
  }

  /**
   * Updates an existing notification.
   * @param {string} notificationId
   * @param {object} data
   * @returns {Promise<Notification|null>}
   */
  async updateNotification(notificationId, data) {
    try {
      const notification = await Notification.findByIdAndUpdate(notificationId, data, { new: true });
      if (!notification) {
        consoleManager.error("Notification not found for update.");
        return null;
      }
      consoleManager.log("Notification updated successfully.");
      return notification;
    } catch (err) {
      consoleManager.error(`Error updating notification: ${err.message}`);
      throw err;
    }
  }

  /**
   * Deletes a notification by its ID.
   * @param {string} notificationId
   * @returns {Promise<Notification|null>}
   */
  async deleteNotification(notificationId) {
    try {
      const notification = await Notification.findByIdAndDelete(notificationId);
      if (!notification) {
        consoleManager.error("Notification not found for deletion.");
        return null;
      }
      consoleManager.log("Notification deleted successfully.");
      return notification;
    } catch (err) {
      consoleManager.error(`Error deleting notification: ${err.message}`);
      throw err;
    }
  }
}

export default new NotificationService();