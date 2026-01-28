import express from "express";
import { getStates, getDistrictsByState } from "../controllers/location.controller.js";

const router = express.Router();

router.get("/states", getStates); // Frontend isi ko call karega
router.get("/districts/:state", getDistrictsByState);

export default router;