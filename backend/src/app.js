import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

/* ================= ROUTES ================= */
import authRoutes from "./routes/auth.routes.js";
import hospitalRoutes from "./routes/hospital.routes.js";
import doctorRoutes from "./routes/doctor.routes.js";
import opdRoutes from "./routes/opd.routes.js";
import recordRoutes from "./routes/record.routes.js";
import appointmentRoutes from "./routes/appointment.routes.js";
import locationRoutes from "./routes/location.routes.js";
import notificationRoutes from "./routes/notification.routes.js"; // 🔹 NEW

/* ================= MIDDLEWARES ================= */
import errorMiddleware from "./middlewares/error.middleware.js";

const app = express();

/* ================= GLOBAL MIDDLEWARES ================= */

// 🔥 CORS MUST BE FIRST
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:8080",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

/* ================= HEALTH CHECK ================= */
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

/* ================= API ROUTES ================= */

// AUTH
app.use("/api/auth", authRoutes);

// HOSPITAL
app.use("/api/hospitals", hospitalRoutes);

// DOCTOR
app.use("/api/doctor", doctorRoutes);

// OPD
app.use("/api/opd", opdRoutes);

// MEDICAL RECORDS
app.use("/api/records", recordRoutes);

// 🔔 NOTIFICATIONS (NEW FEATURE – SAFE ADDITION)
app.use("/api/notifications", notificationRoutes);

// LOCATION
app.use("/api/location", locationRoutes);

// APPOINTMENTS
app.use("/api/appointments", appointmentRoutes);

/* ================= ERROR HANDLER (LAST) ================= */
app.use(errorMiddleware);

export default app;
