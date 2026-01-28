import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    /* ---------------- BASIC INFO ---------------- */
    name: {
      type: String,
      required: true,
      trim: true,
    },

    qualification: {
      type: String,
      required: true,
    },

    specialization: {
      type: String,
    },

    registrationNumber: {
      type: String,
    },

    /* ---------------- HOSPITAL MAPPING ---------------- */
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
    },

    /* ---------------- DEPARTMENTS ---------------- */
    departments: [
      {
        type: String,
        required: true,
      },
    ],

    /* ---------------- OPD SCHEDULE (UNCHANGED) ---------------- */
    /* ---------------- OPD SCHEDULE ---------------- */
    opdSchedule: {
      days: [
        {
          type: String,
          enum: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
        },
      ],
      shift: {
        type: String,
        enum: ["morning", "evening"],
      },
      startTime: {
        type: String,
      },
      endTime: {
        type: String,
      },
      slotDuration: {
        type: Number,
        default: 10,
      },
    },

    /* ---------------- OPD FEES ---------------- */
    consultationFee: {
      type: Number,
      default: 0,
    },

    /* ========================================================= */
    /* ============ ONLINE CONSULTATION (NEW) ================= */
    /* ========================================================= */

    onlineConsultation: {
      enabled: {
        type: Boolean,
        default: false,
      },

      fee: {
        type: Number,
      },

      availableDays: [
        {
          type: String,
          enum: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
        },
      ],

      availableSlots: [
        {
          startTime: String, // "10:00"
          endTime: String, // "10:15"
        },
      ],

      isPanIndia: {
        type: Boolean,
        default: false,
      },

      supportedLanguages: [String],
    },

    /* ---------------- CLINIC INFO (OPTIONAL) ---------------- */
    clinic: {
      name: String,
      address: String,
      city: String,
      state: String,
    },

    /* ---------------- EXPERIENCE ---------------- */
    experienceYears: {
      type: Number,
    },

    /* ---------------- RATING ---------------- */
    rating: {
      type: Number,
      default: 0,
    },

    /* ---------------- STATUS ---------------- */
    status: {
      type: String,
      enum: ["active", "on-leave", "inactive"],
      default: "active",
    },

    /* ---------------- META ---------------- */
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Doctor", doctorSchema);
