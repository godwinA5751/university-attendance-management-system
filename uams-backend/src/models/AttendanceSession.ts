
import mongoose from "mongoose";

const venueSnapshotSchema = new mongoose.Schema(
  {
    venueName: {
      type: String,
      required: true,
      trim: true,
    },
    latitude: {
      type: Number,
      required: true,
      min: -90,
      max: 90,
      validate: {
        validator: (value: number) => Number.isFinite(value),
        message: "Snapshot latitude must be a valid finite number.",
      },
    },
    longitude: {
      type: Number,
      required: true,
      min: -180,
      max: 180,
      validate: {
        validator: (value: number) => Number.isFinite(value),
        message: "Snapshot longitude must be a valid finite number.",
      },
    },
    allowedRadius: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: (value: number) =>
          Number.isFinite(value) && value > 0,
        message: "Snapshot radius must be a positive finite number.",
      },
    },
  },
  { _id: false }
);

const attendanceSessionSchema = new mongoose.Schema(
  {
    courseAssignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CourseAssignment",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    lecturerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lecturer",
      required: true,
    },
    academicSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicSession",
      required: true,
    },
    venueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LectureVenue",
      default: null,
    },
    venueSnapshot: {
      type: venueSnapshotSchema,
      default: null,
    },
    scheduledStartAt: {
      type: Date,
      required: true,
    },
    scheduledEndAt: {
      type: Date,
      required: true,
    },
    attendanceMethod: {
      type: String,
      enum: ["manual", "self_service", "both"],
      required: true,
    },
    status: {
      type: String,
      enum: ["scheduled", "open", "closed", "cancelled"],
      default: "scheduled",
    },
    openedAt: {
      type: Date,
      default: null,
    },
    closedAt: {
      type: Date,
      default: null,
    },
    attendanceVersion: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

attendanceSessionSchema.index({
  lecturerId: 1,
  scheduledStartAt: 1,
});

attendanceSessionSchema.index({
  courseId: 1,
  academicSessionId: 1,
  scheduledStartAt: -1,
});

attendanceSessionSchema.index({
  courseAssignmentId: 1,
  status: 1,
});

export const AttendanceSession = mongoose.model(
  "AttendanceSession",
  attendanceSessionSchema
);
