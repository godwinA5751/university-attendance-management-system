import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    courseCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      minlength: 3,
    },

    courseTitle: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
    },
    
    unit: {
      type: Number,
      required: true,
      min: 1,
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

courseSchema.index(
  {
    courseCode: 1,
    curriculumId: 1,
  },
  {
    unique: true,
  }
);

export const Course = mongoose.model("Course", courseSchema);