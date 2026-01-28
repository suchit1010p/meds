import express from "express";
import {
  createMedicalRecord,
  getMyMedicalRecords,
  uploadMedicalReport // 🔹 NEW: hospital report upload
} from "../controllers/record.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";

const router = express.Router();

/* =====================================================
   1️⃣ CREATE MEDICAL RECORD (Doctor / Hospital after OPD)
   🔹 UPDATED: role name aligned with new system
   ===================================================== */
router.post(
  "/create",
  authMiddleware,
  roleMiddleware("HOSPITAL", "DOCTOR"), // 🔹 UPDATED (SAFE)
  createMedicalRecord
);

/* =====================================================
   2️⃣ GET LOGGED-IN USER'S MEDICAL RECORDS
   🔹 UPDATED: user → PATIENT (new role name)
   ===================================================== */
router.get(
  "/my-records",
  authMiddleware,
  roleMiddleware("PATIENT"), // 🔹 UPDATED (SAFE)
  getMyMedicalRecords
);

/* =====================================================
   3️⃣ UPLOAD MEDICAL REPORT (HOSPITAL SIDE)
   🔹 NEW FEATURE (SAFE ADDITION)
   ===================================================== */
router.post(
  "/upload-report",
  authMiddleware,
  roleMiddleware("HOSPITAL"), // 🔹 ONLY hospital allowed
  uploadMedicalReport
);

export default router;
