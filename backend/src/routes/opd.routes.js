import express from "express";
import {
  bookOpd,
  getMyAppointments,
  getAppointmentById,
  cancelOpd
} from "../controllers/opd.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

// ================= OPD ROUTES =================

// Book OPD
router.post("/book", authMiddleware, bookOpd);

// Get logged-in user's appointments (list)
router.get("/my-appointments", authMiddleware, getMyAppointments);

// Get single appointment detail
router.get("/appointments/:id", authMiddleware, getAppointmentById);

//  Cancel OPD appointment (NO REFUND)
router.patch("/cancel/:id", authMiddleware, cancelOpd);

export default router;
