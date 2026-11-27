
import mongoose from "mongoose";

const lectureVenueSchema = new mongoose.Schema(
  {
    lecturerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lecturer",
      required: true,
    },
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
        message: "Latitude must be a valid finite number.",
      },
    },
    longitude: {
      type: Number,
      required: true,
      min: -180,
      max: 180,
      validate: {
        validator: (value: number) => Number.isFinite(value),
        message: "Longitude must be a valid finite number.",
      },
    },
    allowedRadius: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: (value: number) =>
          Number.isFinite(value) && value > 0,
        message: "Allowed radius must be a positive finite number.",
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

lectureVenueSchema.index({ lecturerId: 1, isActive: 1 });

export const LectureVenue = mongoose.model(
  "LectureVenue",
  lectureVenueSchema
);
