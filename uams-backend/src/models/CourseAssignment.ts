import mongoose from "mongoose";

const courseAssignmentSchema = new mongoose.Schema(
  {
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
  },
  {
    timestamps: true,
  }
);

courseAssignmentSchema.index(
  {
    courseId: 1,
    lecturerId: 1,
    academicSessionId: 1,
  },
  {
    unique: true,
  }
);

export const CourseAssignment = mongoose.model(
  "CourseAssignment",
  courseAssignmentSchema
);