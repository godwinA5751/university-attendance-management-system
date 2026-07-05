import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    courseCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    
    courseTitle: {
      type: String,
      required: true,
      trim: true,
    },
    
    unit: {
      type: Number,
      required: true,
    },

    semester: {
      type: String,
      enum: ["First", "Second"],
      required: true,
    },

    level: {
      type: Number,
      enum: [100, 200, 300, 400, 500, 600],
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

courseSchema.index(
  {
    courseCode: 1,
    academicSessionId: 1,
  },
  {
    unique: true,
  }
);

export const Course = mongoose.model("Course", courseSchema);