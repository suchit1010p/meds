import mongoose from "mongoose";

const queueItemSchema = new mongoose.Schema(
  {
    tokenNumber: {
      type: Number,
      required: true,
    },

    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    urgency: {
      type: String,
      enum: ["normal", "moderate", "critical"],
      default: "normal",
    },

    status: {
      type: String,
      enum: ["waiting", "serving", "completed"],
      default: "waiting",
    },

    estimatedWaitTime: {
      type: Number, // minutes
      default: 0,
    },
  },
  { timestamps: true }
);

const opdQueueSchema = new mongoose.Schema(
  {
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
    },

    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    opdDate: {
      type: Date,
      required: true,
    },

    currentToken: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["active", "closed"],
      default: "active",
    },

    queue: [queueItemSchema],
  },
  { timestamps: true }
);

export default mongoose.model("OPDQueue", opdQueueSchema);
