import mongoose from "mongoose";

/* ================= ADDRESS SUB-SCHEMA ================= */
const addressSchema = new mongoose.Schema(
  {
    line1: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    district: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    state: {
      type: String,
      required: true,
      trim: true,
      default: "Jharkhand",
      index: true
    },
    pincode: {
      type: String,
      match: [/^\d{6}$/, "Invalid pincode"]
    }
  },
  { _id: false }
);

/* ================= OPD SUB-SCHEMA ================= */
const opdSchema = new mongoose.Schema(
  {
    isAvailable: {
      type: Boolean,
      default: true
    },
    timings: {
      morning: {
        start: { type: String }, // "09:00"
        end: { type: String }    // "13:00"
      },
      evening: {
        start: { type: String }, // "16:00"
        end: { type: String }    // "18:00"
      }
    },
    maxTokensPerDay: {
      type: Number,
      default: 100,
      min: 1
    }
  },
  { _id: false }
);

/* ================= MAIN HOSPITAL SCHEMA ================= */
const hospitalSchema = new mongoose.Schema(
  {
    /* -------- BASIC INFO -------- */
    name: {
      type: String,
      required: true,
      trim: true,
      index: true
    },

    type: {
      type: String,
      enum: ["govt", "private"],
      required: true,
      index: true
    },

    registrationNumber: {
      type: String,
      trim: true
    },

    /* -------- CONTACT INFO -------- */
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    phone: {
      type: String,
      required: true,
      trim: true
    },

    /* -------- LOCATION -------- */
    address: addressSchema,

    /* -------- DEPARTMENTS -------- */
    departments: {
      type: [String],
      required: true,
      index: true
    },

    /* -------- OPD INFO -------- */
    opd: opdSchema,

    /* -------- STATUS -------- */
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true
    },

    /* -------- META -------- */
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    /* 🔹 UPDATED (SAFE): hospital ke staff users ka reference
       - Isse hospital dashboard me multiple users ka access possible
       - Existing code pe koi impact nahi
    */
    staffUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ]
  },
  {
    timestamps: true
  }
);

/* ================= COMPOUND INDEXES ================= */
// Fast filtering for Book OPD
hospitalSchema.index({
  "address.state": 1,
  "address.district": 1,
  status: 1
});

/* 🔹 UPDATED (SAFE): email + status index for admin / hospital login flows */
hospitalSchema.index({ email: 1, status: 1 });

export default mongoose.model("Hospital", hospitalSchema);
