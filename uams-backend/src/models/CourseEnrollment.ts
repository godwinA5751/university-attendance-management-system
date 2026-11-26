
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

    academicSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicSession",
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

// A student can enroll in the same course again
// in a different academic session.
courseEnrollmentSchema.index(
  {
    studentId: 1,
    courseId: 1,
    academicSessionId: 1,
  },
  {
    unique: true,
  }
);

export const CourseEnrollment = mongoose.model(
  "CourseEnrollment",
  courseEnrollmentSchema
);
