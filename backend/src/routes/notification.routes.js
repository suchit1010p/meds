// src/routes/notification.routes.js
import express from "express";
import {
  getMyNotifications,
  markAsRead
} from "../controllers/notification.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";

const router = express.Router();

/* =====================================================
   GET MY NOTIFICATIONS (PATIENT)
   ===================================================== */
router.get(
  "/my",
  authMiddleware,
  roleMiddleware("PATIENT"),
  getMyNotifications
);

/* =====================================================
   MARK NOTIFICATION AS READ
   ===================================================== */
router.patch(
  "/read/:notificationId",
  authMiddleware,
  roleMiddleware("PATIENT"),
  markAsRead
);

export default router;
