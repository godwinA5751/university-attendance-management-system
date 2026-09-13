import mongoose from "mongoose";

const courseEnrollmentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "dropped", "completed"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

courseEnrollmentSchema.index(
  {
    studentId: 1,
    courseId: 1,
  },
  {
    unique: true,
  }
);

export const CourseEnrollment = mongoose.model(
  "CourseEnrollment",
  courseEnrollmentSchema
);