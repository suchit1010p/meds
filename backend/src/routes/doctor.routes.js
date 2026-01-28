import express from "express";
import {
  createDoctor,
  getDoctorsByHospital,
  getOnlineDoctors // ✅ NEW
} from "../controllers/doctor.controller.js";

import { getDoctorById } from "../controllers/doctor.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";

const router = express.Router();

/* -------- CREATE DOCTOR (Admin / Hospital) -------- */
router.post(
  "/create",
  authMiddleware,
  roleMiddleware("admin", "hospital"),
  createDoctor
);

/* -------- GET DOCTORS BY HOSPITAL -------- */
router.get(
  "/hospital/:hospitalId",
  getDoctorsByHospital
);

/* ================================================= */
/* ========= GET ONLINE CONSULT DOCTORS ============ */
/* ================================================= */
router.get(
  "/online",
  getOnlineDoctors
);

router.get("/:id", getDoctorById);

export default router;
