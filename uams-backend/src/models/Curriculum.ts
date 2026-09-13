import mongoose from "mongoose";

const curriculumSchema = new mongoose.Schema(
  {
    curriculumName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    year: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Curriculum = mongoose.model(
  "Curriculum",
  curriculumSchema
);