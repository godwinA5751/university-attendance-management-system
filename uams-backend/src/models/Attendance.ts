
import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    enrollmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CourseEnrollment",
      required: true,
    },

    attendanceSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AttendanceSession",
      required: true,
    },

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    dateTime: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["present", "absent", "late"],
      required: true,
    },

    method: {
      type: String,
      enum: ["manual", "self_service", "system"],
      default: "manual",
    },

    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lecturer",
      default: null,
    },

    recordedAt: {
      type: Date,
      default: null,
    },

    manualReason: {
      type: String,
      trim: true,
      default: null,
    },
  },
  { timestamps: true }
);

// One attendance record per student per lecture.
attendanceSchema.index(
  { attendanceSessionId: 1, studentId: 1 },
  { unique: true }
);

export const Attendance = mongoose.model(
  "Attendance",
  attendanceSchema
);