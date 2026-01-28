import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    /* ===================== CORE ===================== */

    appointmentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    appointmentType: {
      type: String,
      enum: ["opd", "online"],
      required: true,
    },

    /* ===================== HOSPITAL (OPD ONLY) ===================== */

    hospital: {
      hospitalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hospital",
      },
      hospitalName: String,
      hospitalType: {
        type: String,
        enum: ["govt", "private"],
      },
    },

    department: {
      type: String,
    },

    /* ===================== DOCTOR ===================== */

    doctor: {
      doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor",
        required: true,
      },
      doctorName: String,
      qualification: String,
    },

    /* ===================== SCHEDULE ===================== */

    schedule: {
      date: {
        type: Date,
        required: true,
      },
      timeSlot: {
        type: String,
        required: true,
      },
      shift: {
        type: String,
        enum: ["morning", "evening"],
      },
    },

    /* ===================== TOKEN / QUEUE (OPD ONLY) ===================== */

    token: {
      tokenNumber: Number,
      queuePosition: Number,
    },

    /* ===================== PATIENT ===================== */

    patient: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      age: Number,
      gender: {
        type: String,
        enum: ["male", "female", "other"],
      },
      phone: String,
      abhaId: String,
    },

    /* ===================== FEES ===================== */

    fees: {
      registrationFee: {
        type: Number,
        default: 0,
      },
      consultationFee: {
        type: Number,
        default: 0,
      },
      totalAmount: {
        type: Number,
        required: true,
      },
    },

    /* ===================== STATUS ===================== */

    status: {
      type: String,
      enum: [
        "booked",
        "confirmed",
        "checked-in",
        "in-consultation",
        "completed",
        "cancelled",
        "no-show",
      ],
      default: "confirmed",
    },

    /* ===================== CANCELLATION ===================== */

    cancelledBy: {
      type: String,
      enum: ["user", "doctor", "system"],
    },

    cancelledAt: Date,
    cancellationReason: String,

    /* ===================== META ===================== */

    instructions: String,

    source: {
      type: String,
      enum: ["web", "mobile", "kiosk"],
      default: "web",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Appointment", appointmentSchema);
