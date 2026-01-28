// src/controllers/notification.controller.js
import Notification from "../models/Notification.js";

/* =====================================================
   1️⃣ GET LOGGED-IN USER NOTIFICATIONS
   ===================================================== */
export const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      userId: req.user.id
    })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notifications.length,
      notifications
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/* =====================================================
   2️⃣ MARK NOTIFICATION AS READ
   ===================================================== */
export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId: req.user.id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found"
      });
    }

    res.status(200).json({
      success: true,
      notification
    });
  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
};
