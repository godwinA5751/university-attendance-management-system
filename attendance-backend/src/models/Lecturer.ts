import mongoose from "mongoose";

const lecturerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    staffNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    department: {
      type: String,
      required: true,
    },

    faculty: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Lecturer = mongoose.model("Lecturer", lecturerSchema);