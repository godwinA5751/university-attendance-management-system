import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    enrollmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CourseEnrollment",
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
  },
  {
    timestamps: true,
  }
);

attendanceSchema.index(
  { enrollmentId: 1, dateTime: 1 },
  { unique: true }
);

export const Attendance = mongoose.model(
  "Attendance",
  attendanceSchema
);