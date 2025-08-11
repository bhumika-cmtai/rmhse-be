import express from "express";
import NotificationService from "../../services/notification/notification_services.js";
import ResponseManager from "../../utils/responseManager.js";

const router = express.Router();

// === Create a new notification ===
router.post('/', async (req, res) => {
  try {
    const notification = await NotificationService.createNotification(req.body);
    ResponseManager.sendSuccess(res, notification, 201, 'Notification created successfully.');
  } catch (err) {
    ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', err.message);
  }
});

// === Get the single LATEST notification ===
// IMPORTANT: This route must come before the '/:id' route.
router.get('/latest', async (req, res) => {
  try {
    const notification = await NotificationService.getLatestNotification();
    if (notification) {
      ResponseManager.sendSuccess(res, notification, 200, 'Latest notification retrieved.');
    } else {
      ResponseManager.sendSuccess(res, null, 200, 'No notifications found.');
    }
  } catch (err) {
    ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', err.message);
  }
});

// === Get ALL notifications (paginated) ===
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await NotificationService.getAllNotifications(page, limit);
    ResponseManager.sendSuccess(res, result, 200, 'Notifications retrieved successfully.');
  } catch (err) {
    ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', err.message);
  }
});

// === Get a notification by ID ===
router.get('/:id', async (req, res) => {
  try {
    const notification = await NotificationService.getNotificationById(req.params.id);
    if (notification) {
      ResponseManager.sendSuccess(res, notification, 200, 'Notification retrieved successfully.');
    } else {
      ResponseManager.sendError(res, 404, 'NOT_FOUND', 'Notification not found.');
    }
  } catch (err) {
    ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', err.message);
  }
});

// === Update a notification by ID ===
router.put('/:id', async (req, res) => {
  try {
    const notification = await NotificationService.updateNotification(req.params.id, req.body);
    if (notification) {
      ResponseManager.sendSuccess(res, notification, 200, 'Notification updated successfully.');
    } else {
      ResponseManager.sendError(res, 404, 'NOT_FOUND', 'Notification not found.');
    }
  } catch (err) {
    ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', err.message);
  }
});

// === Delete a notification by ID ===
router.delete('/:id', async (req, res) => {
  try {
    const notification = await NotificationService.deleteNotification(req.params.id);
    if (notification) {
      ResponseManager.sendSuccess(res, notification, 200, 'Notification deleted successfully.');
    } else {
      ResponseManager.sendError(res, 404, 'NOT_FOUND', 'Notification not found.');
    }
  } catch (err) {
    ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', err.message);
  }
});

export default router;