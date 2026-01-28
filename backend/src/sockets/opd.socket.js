import Appointment from "../models/Appointment.js";
import Hospital from "../models/Hospital.js";
import { calculateCrowdLevel } from "../services/crowd.service.js";

/* =====================================================
   🔔 NEW: helper function for user notification emit
   (exported so controller use kar sake)
   ===================================================== */
let ioInstance = null;

export const emitUserNotification = (userId, payload) => {
  if (!ioInstance) return;

  // 🔹 user-specific room
  ioInstance.to(`user_${userId}`).emit("notification", payload);
};

/* =====================================================
   OPD SOCKET REGISTRATION (EXISTING + EXTENDED)
   ===================================================== */
export const registerOpdSocket = (io) => {
  ioInstance = io; // 🔹 NEW: save io reference

  io.on("connection", (socket) => {
    console.log("🟢 OPD socket connected", socket.id);

    /* =================================================
       🏥 EXISTING: hospital room (NO CHANGE)
       ================================================= */
    socket.on("join-hospital", async (hospitalId) => {
      try {
        socket.join(hospitalId);

        const hospital = await Hospital.findById(hospitalId);
        if (!hospital) return;

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const bookedToday = await Appointment.countDocuments({
          "hospital.hospitalId": hospitalId,
          status: "booked",
          createdAt: {
            $gte: startOfDay,
            $lte: endOfDay,
          },
        });

        const maxTokens = hospital?.opd?.maxTokensPerDay || 50;

        const crowd = calculateCrowdLevel({
          bookedTokens: bookedToday,
          maxTokens,
        });

        io.to(hospitalId).emit("crowd-update", {
          hospitalId,
          ...crowd,
        });

      } catch (err) {
        console.error("❌ OPD socket error:", err.message);
      }
    });

    /* =================================================
       👤 NEW: user personal room (NOTIFICATION)
       ================================================= */
    socket.on("join-user", (userId) => {
      socket.join(`user_${userId}`);
      console.log(`👤 User joined notification room: user_${userId}`);
    });

    socket.on("disconnect", () => {
      console.log("🔴 Socket disconnected", socket.id);
    });
  });
};
