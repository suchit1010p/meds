import MedicalRecord from "../models/MedicalRecord.js";
import Appointment from "../models/Appointment.js";
import Notification from "../models/Notification.js";
import { emitUserNotification } from "../sockets/opd.socket.js";

/* =====================================================
   1️⃣ CREATE MEDICAL RECORD (Doctor after OPD)
   ===================================================== */
export const createMedicalRecord = async (req, res) => {
  try {
    const {
      appointmentId,
      diagnosis,
      notes,
      prescription,
      followUpDate
    } = req.body;

    if (!appointmentId || !diagnosis) {
      return res.status(400).json({
        success: false,
        message: "appointmentId and diagnosis are required"
      });
    }

    
    const appointment = await Appointment.findById(appointmentId)
      .populate("doctorId")
      .populate("hospitalId");

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found"
      });
    }

    const record = await MedicalRecord.create({
      userId: appointment.userId,
      appointmentId: appointment._id,
      appointmentRef: appointment._id.toString().slice(-6),

      hospital: {
        hospitalId: appointment.hospitalId?._id,
        hospitalName: appointment.hospitalId?.name,
        department: appointment.doctorId?.department
      },

      doctor: {
        doctorId: appointment.doctorId?._id,
        doctorName: appointment.doctorId?.name,
        qualification: appointment.doctorId?.qualification
      },

      visitDate: new Date(),
      diagnosis,
      notes,
      prescription,
      followUpDate
    });

    return res.status(201).json({
      success: true,
      message: "Medical record created successfully",
      record
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/* =====================================================
   2️⃣ GET LOGGED-IN USER'S MEDICAL RECORDS
   ===================================================== */
export const getMyMedicalRecords = async (req, res) => {
  try {
    const records = await MedicalRecord.find({
      userId: req.user._id
    }).sort({ visitDate: -1 });

    return res.status(200).json({
      success: true,
      count: records.length,
      records
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/* =====================================================
   3️⃣ UPLOAD MEDICAL REPORT (HOSPITAL SIDE)
   🔥 FULLY FIXED — NO `.toString()` CRASH
   ===================================================== */

export const uploadMedicalReport = async (req, res) => {
  try {
    const { appointmentId, reportType, fileUrl } = req.body;

    if (!appointmentId || !reportType || !fileUrl) {
      return res.status(400).json({
        success: false,
        message: "appointmentId, reportType and fileUrl are required"
      });
    }

    if (req.user.role !== "HOSPITAL") {
      return res.status(403).json({
        success: false,
        message: "Only hospital can upload reports"
      });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found"
      });
    }

    // ✅ correct ownership check
    if (
      !appointment.hospital ||
      appointment.hospital.hospitalId.toString() !==
        req.user.hospitalId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to upload report for this appointment"
      });
    }

    let record = await MedicalRecord.findOne({
      appointmentId: appointment._id
    });

    if (!record) {
      record = await MedicalRecord.create({
        userId: appointment.patient.userId, // 🔥 FIXED
        appointmentId: appointment._id,
        appointmentRef: appointment._id.toString().slice(-6),
        visitDate: appointment.schedule?.date || new Date(),
        recordSource: "upload",
        reports: []
      });
    }

    record.reports.push({
      reportType,
      fileUrl,
      uploadedBy: "HOSPITAL",
      uploadedAt: new Date()
    });

    await record.save();

    return res.status(200).json({
      success: true,
      message: "Medical report uploaded successfully",
      record
    });

  } catch (err) {
    console.error("UPLOAD REPORT ERROR:", err);
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
