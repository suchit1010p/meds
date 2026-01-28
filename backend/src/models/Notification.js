// src/models/Notification.js
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    /* -------------------- RECEIVER -------------------- */
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    /* -------------------- CONTENT -------------------- */
    title: {
      type: String,
      required: true
    },

    message: {
      type: String,
      required: true
    },

    type: {
      type: String,
      enum: ["REPORT_UPLOADED", "APPOINTMENT", "GENERAL"],
      default: "GENERAL"
    },

    /* -------------------- LINKING -------------------- */
    relatedRecordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MedicalRecord"
    },

    relatedAppointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment"
    },

    /* -------------------- STATUS -------------------- */
    isRead: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

/* 🔹 FAST FETCH FOR USER NOTIFICATIONS */
notificationSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);
