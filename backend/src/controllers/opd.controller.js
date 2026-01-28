import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import Hospital from "../models/Hospital.js";

/* =========================================================
   1️⃣ GET AVAILABLE OPD SLOTS
   ========================================================= */
export const getAvailableSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.query;

    if (!doctorId || !date) {
      return res.status(400).json({
        success: false,
        message: "doctorId and date are required",
      });
    }

    const slots = [
      "10:00 AM",
      "10:10 AM",
      "10:20 AM",
      "10:30 AM",
      "10:40 AM",
    ];

    return res.status(200).json({
      success: true,
      doctorId,
      date,
      slots,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================================================
   2️⃣ BOOK OPD APPOINTMENT (FINAL + SAFE)
   ========================================================= */
export const bookOpd = async (req, res) => {
  try {
    const {
      hospitalId,
      doctorId,
      department,
      schedule,
      patient,
      fees,
      instructions,
      source,
    } = req.body;

    /* ---------- VALIDATION ---------- */
    if (
      !hospitalId ||
      !doctorId ||
      !schedule?.date ||
      !schedule?.timeSlot ||
      !patient?.name ||
      !fees
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required booking details",
      });
    }

    /* ---------- FETCH HOSPITAL ---------- */
    const hospitalExists = await Hospital.findById(hospitalId);
    if (!hospitalExists) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }

    /* ---------- FETCH DOCTOR ---------- */
    const doctorExists = await Doctor.findById(doctorId);
    if (!doctorExists) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    /* =====================================================
       🔒 LIMIT: MAX 2 OPD PER USER PER DAY
       ===================================================== */
    const bookingDate = new Date(schedule.date);

    const startOfDay = new Date(bookingDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(bookingDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingBookings = await Appointment.countDocuments({
      "patient.userId": req.user.id,
      "hospital.hospitalId": hospitalExists._id,
      appointmentType: "opd",
      status: { $ne: "cancelled" },
      "schedule.date": { $gte: startOfDay, $lte: endOfDay },
    });

    if (existingBookings >= 2) {
      return res.status(400).json({
        success: false,
        message: "You can book only 2 OPD appointments per hospital per day",
      });
    }

    /* =====================================================
       🎟️ TOKEN LOGIC (PER DOCTOR + PER DAY)
       ===================================================== */
    const todayOnly = new Date(bookingDate);
    todayOnly.setHours(0, 0, 0, 0);

    if (
      !doctorExists.opdQueue ||
      !doctorExists.opdQueue.date ||
      new Date(doctorExists.opdQueue.date).getTime() !== todayOnly.getTime()
    ) {
      doctorExists.opdQueue = {
        date: todayOnly,
        lastToken: 0,
      };
    }

    doctorExists.opdQueue.lastToken += 1;
    const tokenNumber = doctorExists.opdQueue.lastToken;

    await doctorExists.save();

    /* ---------- FEES SAFETY ---------- */
    const finalFees = {
      registrationFee: fees.registrationFee || 0,
      consultationFee: fees.consultationFee || 0,
      totalAmount:
        fees.totalAmount ??
        (fees.registrationFee || 0) + (fees.consultationFee || 0),
    };

    /* ---------- CREATE APPOINTMENT ---------- */
    const appointment = await Appointment.create({
      appointmentId: "OPD" + Date.now(),
      appointmentType: "opd",
      bookingType: "online",
      status: "booked",

      hospital: {
        hospitalId: hospitalExists._id,
        hospitalName: hospitalExists.name,
        hospitalType: hospitalExists.type,
      },

      department,

      doctor: {
        doctorId: doctorExists._id,
        doctorName: doctorExists.name,
        qualification: doctorExists.qualification,
      },

      schedule: {
        date: bookingDate,
        timeSlot: schedule.timeSlot,
        shift: schedule.shift || "morning",
      },

      token: {
        tokenNumber,
        queuePosition: tokenNumber,
      },

      patient: {
        ...patient,
        userId: req.user.id,
      },

      fees: finalFees,
      instructions,
      source: source || "web",
    });

    return res.status(201).json({
      success: true,
      message: "OPD booked successfully",
      appointment,
    });
  } catch (error) {
    console.error("❌ BOOK OPD ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================================================
   3️⃣ GET LOGGED-IN USER'S APPOINTMENTS
   ========================================================= */
export const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      "patient.userId": req.user.id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================================================
   4️⃣ GET SINGLE APPOINTMENT
   ========================================================= */
export const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    if (appointment.patient.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    return res.status(200).json({
      success: true,
      appointment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================================================
   5️⃣ CANCEL OPD APPOINTMENT
   ========================================================= */
export const cancelOpd = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    if (appointment.patient.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (appointment.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Appointment already cancelled",
      });
    }

    appointment.status = "cancelled";
    appointment.cancelledBy = "user";
    appointment.cancelledAt = new Date();
    appointment.cancellationReason = req.body.reason || null;

    await appointment.save();

    return res.status(200).json({
      success: true,
      message: "OPD appointment cancelled successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
