import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";

import {
  getOrCreateQueue,
  addPatientToQueue,
  updateQueueStatus,
  getQueueById,
} from "../controllers/queue.controller.js";

const router = express.Router();

/* ================= QUEUE ROUTES ================= */

// Doctor: create/get today's queue
router.post("/init", authMiddleware, getOrCreateQueue);

// Patient: join queue
router.post("/join", authMiddleware, addPatientToQueue);

// Doctor: update token status
router.patch("/update", authMiddleware, updateQueueStatus);

// Patient: view queue
router.get("/:queueId", authMiddleware, getQueueById);

export default router;
