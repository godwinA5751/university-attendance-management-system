
import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    matricNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    department: {
      type: String,
      required: true,
      trim: true,
    },

    faculty: {
      type: String,
      required: true,
      trim: true,
    },

    currentLevel: {
      type: Number,
      required: true,
      enum: [100, 200, 300, 400, 500, 600],
    },

    admissionYear: {
      type: Number,
      required: true,
      min: 2000,
      validate: {
        validator: Number.isInteger,
        message: "Admission year must be a whole number.",
      },
    },

    curriculumId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Curriculum",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Student = mongoose.model("Student", studentSchema);