import mongoose from "mongoose";
import { validateSessionName } from "../utils/validateSession.js";

const academicSchema = new mongoose.Schema(
  {
    sessionName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      validate: {
        validator: validateSessionName,
        message: "Invalid session format (e.g. 2025/2026)",
      },
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const AcademicSession = mongoose.model(
  "AcademicSession",
  academicSchema
);