import Hospital from "../models/Hospital.js";
import User from "../models/User.js";
import Doctor from "../models/Doctor.js";
import Appointment from "../models/Appointment.js";
/* =====================================================
   1️⃣ CREATE HOSPITAL
   ===================================================== */
export const createHospital = async (req, res) => {
  try {
    const {
      name,
      type,
      email,
      phone,
      address,
      departments,
      opd
    } = req.body;

    if (!name || !type || !email || !phone || !address?.district) {
      return res.status(400).json({
        message: "Required fields missing"
      });
    }

    const hospital = await Hospital.create({
      name,
      type,
      email,
      phone,
      address: {
        line1: address?.line1,
        city: address?.city,
        district: address?.district,
        state: address?.state || "Jharkhand",
        pincode: address?.pincode
      },
      departments,
      opd,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: "Hospital created successfully",
      hospital
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =====================================================
   2️⃣ GET ALL HOSPITALS (WITH STATE / DISTRICT FILTER)
   ===================================================== */
/* =====================================================
   GET ALL HOSPITALS (FIXED FILTER LOGIC)
   ===================================================== */
export const getAllHospitals = async (req, res) => {
  try {
    const { state, district } = req.query;

    // Start with empty filter or approved status
    // Use {} if you haven't implemented the 'approved' field in your DB yet
    const filter = {}; 

    if (state) {
      filter["address.state"] = state;
    }

    if (district) {
      filter["address.district"] = district;
    }

    // console.log("Applying Filter:", filter); // Useful for debugging

    const hospitals = await Hospital.find(filter);

    res.status(200).json({
      success: true,
      count: hospitals.length,
      hospitals
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =====================================================
   3️⃣ GET HOSPITAL BY ID
   ===================================================== */
export const getHospitalById = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);

    if (!hospital) {
      return res.status(404).json({
        message: "Hospital not found"
      });
    }

    res.status(200).json({
      success: true,
      hospital
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Backend: hospital.controller.js
export const getHospitals = async (req, res) => {
  try {
    const { search, city, state, district } = req.query;
    let query = {};

    // Agar search bar mein kuch likha hai
    if (search) {
      query.name = { $regex: search, $options: "i" }; // "i" matlab case-insensitive
    }

    // Baaki filters
    if (city) query["address.city"] = city;
    if (state) query["address.state"] = state;

    const hospitals = await Hospital.find(query).limit(10); // Default 10 hospitals
    res.json(hospitals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/* =====================================================
   GET LOGGED-IN HOSPITAL PROFILE
   ===================================================== */
export const getMyHospitalProfile = async (req, res) => {
  try {
    // 🔹 logged-in user (role = hospital)
    const user = req.user;

    if (!user.hospitalId) {
      return res.status(404).json({
        success: false,
        message: "Hospital not linked to this account"
      });
    }

    const hospital = await Hospital.findById(user.hospitalId);

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found"
      });
    }

    res.status(200).json({
      success: true,
      hospital
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


// 🔗 LINK EXISTING HOSPITAL WITH LOGGED-IN HOSPITAL ADMIN
export const assignHospitalAdmin = async (req, res) => {
  try {
    const { hospitalId } = req.body;

    if (!hospitalId) {
      return res.status(400).json({ message: "hospitalId required" });
    }

    // ✅ Only hospital role allowed
    if (req.user.role !== "HOSPITAL") {
      return res.status(403).json({ message: "Only hospital admin allowed" });
    }

    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    // 🔗 LINK USER → HOSPITAL
    req.user.hospitalId = hospital._id;
    await req.user.save();

    return res.status(200).json({
      success: true,
      message: "Hospital linked successfully",
      hospital: {
        id: hospital._id,
        name: hospital.name
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/* =====================================================
   GET HOSPITAL PATIENTS (FROM APPOINTMENTS)
   ===================================================== */
export const getHospitalPatients = async (req, res) => {
  try {
    const hospitalId = req.user.hospitalId;

    if (!hospitalId) {
      return res.status(400).json({
        success: false,
        message: "Hospital not linked to this account"
      });
    }

    const appointments = await Appointment.find({
      "hospital.hospitalId": hospitalId,
      status: "booked"
    });

    // Extract unique patients
    const patientMap = new Map();

    appointments.forEach((appt) => {
      if (appt.patient?.userId) {
        patientMap.set(
          appt.patient.userId.toString(),
          appt.patient
        );
      }
    });

    const patients = Array.from(patientMap.values());

    res.status(200).json({
      success: true,
      count: patients.length,
      patients
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/* =====================================================
   GET ALL DOCTORS OF LOGGED-IN HOSPITAL
   ===================================================== */
export const getHospitalDoctors = async (req, res) => {
  try {
    const hospitalId = req.user.hospitalId;

    if (!hospitalId) {
      return res.status(400).json({
        success: false,
        message: "Hospital not linked to this account"
      });
    }

    const doctors = await Doctor.find({
      hospitalId,
      status: "active"
    });

    res.status(200).json({
      success: true,
      count: doctors.length,
      doctors
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
