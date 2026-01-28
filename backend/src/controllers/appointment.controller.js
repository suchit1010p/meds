import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import Hospital from "../models/Hospital.js";

/* =====================================================
   BOOK ONLINE CONSULTATION (PATIENT ONLY) ✅ FINAL FIX
   ===================================================== */
export const bookOnlineAppointment = async (req, res) => {
  try {
    /* ---------------- AUTH SAFETY ---------------- */
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }

    const user = req.user;
    const { doctorId, appointmentDate, timeSlot } = req.body;

    /* ---------------- BASIC VALIDATION ---------------- */
    if (!doctorId || !appointmentDate || !timeSlot) {
      return res.status(400).json({
        success: false,
        message: "doctorId, appointmentDate and timeSlot are required",
      });
    }

    /* ---------------- DOCTOR CHECK ---------------- */
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    /* ---------------- ONLINE CONSULT CHECK ---------------- */
    if (
      !doctor.onlineConsultation ||
      doctor.onlineConsultation.enabled !== true ||
      typeof doctor.onlineConsultation.fee !== "number"
    ) {
      return res.status(400).json({
        success: false,
        message: "Doctor is not available for online consultation",
      });
    }

    /* ---------------- DOCTOR → HOSPITAL ---------------- */
    if (!doctor.hospitalId) {
      return res.status(400).json({
        success: false,
        message: "Doctor is not linked to a hospital",
      });
    }

    const hospital = await Hospital.findById(doctor.hospitalId);
    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }

    /* ---------------- DATE NORMALIZATION ---------------- */
    const consultDate = new Date(appointmentDate);
    consultDate.setHours(0, 0, 0, 0);

    /* ---------------- DOUBLE BOOKING CHECK ---------------- */
    const slotTaken = await Appointment.findOne({
      "doctor.doctorId": doctor._id,
      "schedule.timeSlot": timeSlot,
      appointmentType: "online",
      status: { $ne: "cancelled" },
      "schedule.date": consultDate,
    });

    if (slotTaken) {
      return res.status(409).json({
        success: false,
        message: "Slot already booked",
      });
    }

    /* ---------------- CREATE APPOINTMENT ---------------- */
    const appointmentId = "ONL" + Date.now();
    const consultationFee = doctor.onlineConsultation.fee;

    const appointment = await Appointment.create({
      /* 🔥 REQUIRED BY SCHEMA */
      appointmentId,
      appointmentRef: appointmentId,

      appointmentType: "online",
      bookingType: "online",
      status: "booked",
      source: "web",

      hospital: {
        hospitalId: hospital._id,
        hospitalName: hospital.name,
        hospitalType: hospital.type || "hospital",
      },

      doctor: {
        doctorId: doctor._id,
        doctorName: doctor.name,
        qualification: doctor.qualification,
      },

      patient: {
        userId: user._id,
        name: user.name || "Unknown",
        age: user.age || 0,
        gender: user.gender || "other",
        phone: user.phone || "",
      },

      schedule: {
        date: consultDate,
        timeSlot,
      },

      fees: {
        consultationFee,
        totalAmount: consultationFee,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Online consultation booked successfully",
      appointment,
    });
  } catch (error) {
    console.error("❌ ONLINE BOOK ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =====================================================
   GET HOSPITAL APPOINTMENTS (HOSPITAL ONLY)
   ===================================================== */
export const getHospitalAppointments = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "HOSPITAL") {
      return res.status(403).json({
        success: false,
        message: "Only hospital can access this resource",
      });
    }

    if (!req.user.hospitalId) {
      return res.status(404).json({
        success: false,
        message: "Hospital not linked with this account",
      });
    }

    const hospital = await Hospital.findById(req.user.hospitalId);
    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }

    const appointments = await Appointment.find({
      "hospital.hospitalId": hospital._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      hospital: {
        id: hospital._id,
        name: hospital.name,
      },
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    console.error("❌ HOSPITAL APPOINTMENTS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
