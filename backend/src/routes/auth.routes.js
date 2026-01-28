import express from "express";
import { register, login, logout, deleteProfile, getMe } from "../controllers/auth.controller.js";
import validateRegister from "../middlewares/validate.middleware.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import jwt from "jsonwebtoken";
import User from "../models/User.js";


const router = express.Router();

/* REGISTER */
router.post("/register", validateRegister, register);

/* LOGIN */
router.post("/login", login);

/* LOGOUT */
router.post("/logout", authMiddleware, logout);

router.post("/delete" ,authMiddleware,deleteProfile )

router.get("/me", authMiddleware, getMe);

export default router;
