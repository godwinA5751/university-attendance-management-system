
import mongoose from "mongoose";

const venueSnapshotSchema = new mongoose.Schema(
  {
    venueName: {
      type: String,
      required: true,
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    allowedRadius: {
      type: Number,
      required: true,
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
