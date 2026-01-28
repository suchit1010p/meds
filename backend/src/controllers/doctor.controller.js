import Doctor from "../models/Doctor.js";
import Hospital from "../models/Hospital.js";

/* =====================================================
   CREATE DOCTOR (Admin / Hospital)
   ===================================================== */
export const createDoctor = async (req, res) => {
  try {
    console.log("REQ BODY:", req.body);

    const {
      name,
      qualification,
      specialization,
      registrationNumber,
      hospitalId,
      departments,
      opdSchedule,
      consultationFee,
      experienceYears,

      // 🔹 ONLINE CONSULT (OPTIONAL)
      onlineConsultation,
      clinic
    } = req.body;

    /* -------- BASIC VALIDATION -------- */
    if (
      !name ||
      !qualification ||
      !hospitalId ||
      !departments ||
      departments.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing"
      });
    }

    /* -------- CHECK HOSPITAL EXISTS -------- */
    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found"
      });
    }

    /* -------- CREATE DOCTOR OBJECT -------- */
    const doctorPayload = {
      name,
      qualification,
      specialization,
      registrationNumber,
      hospitalId,
      departments,
      consultationFee,
      experienceYears,
      createdBy: req.user._id
    };

    /* -------- OPD SCHEDULE (OPTIONAL) -------- */
    if (opdSchedule) {
      doctorPayload.opdSchedule = opdSchedule;
    }

    /* -------- ONLINE CONSULTATION (OPTIONAL) -------- */
    if (onlineConsultation?.enabled === true) {
      doctorPayload.onlineConsultation = {
        enabled: true,
        fee: onlineConsultation.fee,
        availableDays: onlineConsultation.availableDays || [],
        availableSlots: onlineConsultation.availableSlots || [],
        isPanIndia: onlineConsultation.isPanIndia || false,
        supportedLanguages: onlineConsultation.supportedLanguages || []
      };
    }

    /* -------- CLINIC INFO (OPTIONAL) -------- */
    if (clinic) {
      doctorPayload.clinic = clinic;
    }

    /* -------- CREATE DOCTOR -------- */
    const doctor = await Doctor.create(doctorPayload);

    return res.status(201).json({
      success: true,
      message: "Doctor created successfully",
      doctor
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* =====================================================
   GET DOCTORS BY HOSPITAL (OPD FLOW)
   ===================================================== */
export const getDoctorsByHospital = async (req, res) => {
  try {
    const { hospitalId } = req.params;

    const doctors = await Doctor.find({ hospitalId })
      .populate("hospitalId", "name type")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: doctors.length,
      doctors
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* =====================================================
   GET SINGLE DOCTOR (PROFILE PAGE)
   ===================================================== */
export const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate("hospitalId", "name type");

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }

    return res.status(200).json({
      success: true,
      doctor
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* =====================================================
   GET ONLINE CONSULTATION DOCTORS
   ===================================================== */
export const getOnlineDoctors = async (req, res) => {
  try {
    const { city, page = 1, limit = 10 } = req.query;

    const filter = {
      status: "active",
      "onlineConsultation.enabled": true
    };

    // 🔹 City OR Pan-India doctors
    if (city) {
      filter.$or = [
        { "clinic.city": city },
        { "onlineConsultation.isPanIndia": true }
      ];
    }

    const doctors = await Doctor.find(filter)
      .select(
        "name qualification specialization experienceYears rating clinic onlineConsultation"
      )
      .sort({ rating: -1, experienceYears: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Doctor.countDocuments(filter);

    return res.status(200).json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      doctors
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

