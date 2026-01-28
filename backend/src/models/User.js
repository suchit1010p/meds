// src/models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    /* -------------------- BASIC INFO -------------------- */

    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },

    phone: {
      type: String,
      required: true
    },

    password: {
      type: String,
      required: true,
      select: false // password response me nahi jayega
    },

    /* -------------------- ROLE -------------------- */
    role: {
      type: String,
      enum: ["PATIENT", "HOSPITAL", "DOCTOR","ADMIN"],
      default: "PATIENT"
    },

    /* -------------------- PATIENT DETAILS -------------------- */
    gender: {
      type: String,
      enum: ["male", "female", "other"]
    },

    age: {
      type: Number
    },

    bloodGroup: {
      type: String // O+, A+, etc.
    },

    abhaId: {
      type: String // NDHM Health ID (optional)
    },

    address: {
      city: String,
      district: String,
      state: {
        type: String,
        default: "Jharkhand"
      }
    },

    /* -------------------- ACCOUNT STATUS -------------------- */
    isVerified: {
      type: Boolean,
      default: false
    },

    isActive: {
      type: Boolean,
      default: true
    },

    /* -------------------- LINKED HOSPITAL -------------------- */
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital"
      // Used when role === "HOSPITAL" or "DOCTOR"
    }
  },
  {
    timestamps: true
  }
);

/* -------------------- INDEXES -------------------- */
// Email + role combination ke liye future-safe
userSchema.index({ email: 1, role: 1 });

export default mongoose.model("User", userSchema);
