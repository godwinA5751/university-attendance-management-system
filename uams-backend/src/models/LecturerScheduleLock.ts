import mongoose from "mongoose";

const lecturerScheduleLockSchema = new mongoose.Schema(
  {
    lecturerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lecturer",
      required: true,
      unique: true,
    },
    version: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const LecturerScheduleLock = mongoose.model(
  "LecturerScheduleLock",
  lecturerScheduleLockSchema
);