// src/models/MedicalRecord.js
import mongoose from "mongoose";

const medicalRecordSchema = new mongoose.Schema(
  {
    /* -------------------- PATIENT -------------------- */
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true // 🔹 UPDATED (SAFE): fast user medical record fetch
    },

    /* -------------------- APPOINTMENT LINK -------------------- */
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      index: true // 🔹 UPDATED (SAFE): appointment → record lookup
    },

    appointmentRef: {
      type: String // OPD00778846 (human readable)
    },

    /* -------------------- HOSPITAL SNAPSHOT -------------------- */
    hospital: {
      hospitalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hospital",
        index: true // 🔹 UPDATED (SAFE): hospital wise records
      },
      hospitalName: String,
      department: String
    },

    /* -------------------- DOCTOR SNAPSHOT -------------------- */
    doctor: {
      doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor"
      },
      doctorName: String,
      qualification: String
    },

    /* -------------------- VISIT DETAILS -------------------- */
    visitDate: {
      type: Date,
      required: true,
      index: true // 🔹 UPDATED (SAFE): sorting by visit date
    },

    chiefComplaint: {
      type: String // "stomach pain since 3 days"
    },

    diagnosis: {
      type: String // "Gastritis"
    },

    notes: {
      type: String // Doctor remarks
    },

    /* -------------------- PRESCRIPTION -------------------- */
    prescription: [
      {
        medicineName: String,
        dosage: String, // 1-0-1
        duration: String, // 5 days
        instructions: String // after food
      }
    ],

    /* -------------------- REPORTS -------------------- */
    reports: [
      {
        reportType: {
          type: String // Blood Test, X-Ray
        },

        fileUrl: {
          type: String // stored in cloud / uploads
        },

        uploadedBy: {
          type: String,
          enum: ["HOSPITAL", "DOCTOR"],
          default: "HOSPITAL" // 🔹 UPDATED (SAFE): report source tracking
        },

        uploadedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],

    /* -------------------- FOLLOW UP -------------------- */
    followUpDate: {
      type: Date
    },

    /* -------------------- META -------------------- */
    recordSource: {
      type: String,
      enum: ["opd", "emergency", "upload"],
      default: "opd"
    },

    isVerified: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

/* 🔹 UPDATED (SAFE): common query optimization */
medicalRecordSchema.index({
  userId: 1,
  visitDate: -1
});

export default mongoose.model("MedicalRecord", medicalRecordSchema);
