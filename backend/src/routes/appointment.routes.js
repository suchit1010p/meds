import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";

import {
  bookOnlineAppointment,
  getHospitalAppointments
} from "../controllers/appointment.controller.js";

const router = express.Router();

/* ================= ONLINE CONSULT (PATIENT ONLY) ================= */
router.post(
  "/online",
  authMiddleware,
  roleMiddleware("PATIENT"), // 🔥 THIS WAS MISSING
  bookOnlineAppointment
);

/* ================= HOSPITAL / ADMIN APPOINTMENTS ================= */
router.get(
  "/hospital",
  authMiddleware,
  roleMiddleware("HOSPITAL", "ADMIN"),
  getHospitalAppointments
);

export default router;
