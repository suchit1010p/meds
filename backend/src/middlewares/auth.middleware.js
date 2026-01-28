import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authMiddleware = async (req, res, next) => {
  try {
    let token;

    // ✅ ONLY TOKEN FROM AUTH HEADER (NO CHANGE)
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    // ❌ TOKEN NOT FOUND (NO CHANGE)
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authorization token missing",
      });
    }

    // 🔐 VERIFY TOKEN
    const decoded = jwt.verify(token, process.env.JWT_KEY);

    // 🔹 UPDATED: decoded token se role & hospitalId future ke liye safe rakha
    // (existing flow pe koi impact nahi)
    req.auth = {
      userId: decoded._id,
      role: decoded.role,
      hospitalId: decoded.hospitalId || null
    };

    // 👤 FIND USER (NO CHANGE IN LOGIC)
    const user = await User.findById(decoded._id).select("-password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // ✅ ATTACH USER (EXISTING BEHAVIOR MAINTAINED)
    req.user = user;

    next();

  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

export default authMiddleware;
