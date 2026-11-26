
import mongoose from "mongoose";
import { LectureVenue } from "../models/LectureVenue.js";
import type {
  CreateLectureVenueInput,
  UpdateLectureVenueInput,
} from "../types/venue.types.js";

const validateCoordinates = (latitude: number, longitude: number) => {
  if (
    !Number.isFinite(latitude) ||
    latitude < -90 ||
    latitude > 90
  ) {
    throw new Error("Invalid latitude");
  }

  if (
    !Number.isFinite(longitude) ||
    longitude < -180 ||
    longitude > 180
  ) {
    throw new Error("Invalid longitude");
  }
};

const validateVenueInput = (
  data: CreateLectureVenueInput | UpdateLectureVenueInput,
  isCreate = false
) => {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Invalid venue input");
  }

  const input = data as Record<string, unknown>;

  const fields = [
    "venueName",
    "latitude",
    "longitude",
    "allowedRadius",
    "isActive",
  ];

  if (
    !isCreate &&
    !fields.some((field) => input[field] !== undefined)
  ) {
    throw new Error("At least one field must be provided");
  }

  if (isCreate && input.venueName === undefined) {
    throw new Error("Venue name is required");
  }

  if (
    input.venueName !== undefined &&
    (typeof input.venueName !== "string" || !input.venueName.trim())
  ) {
    throw new Error("Invalid venue name");
  }

  if (input.latitude !== undefined || input.longitude !== undefined) {
    if (
      input.latitude === undefined ||
      input.longitude === undefined
    ) {
      throw new Error("Latitude and longitude must be provided together");
    }

    validateCoordinates(
      input.latitude as number,
      input.longitude as number
    );
  }

  if (
    input.allowedRadius !== undefined &&
    (typeof input.allowedRadius !== "number" ||
      !Number.isFinite(input.allowedRadius) ||
      input.allowedRadius <= 0)
  ) {
    throw new Error("Invalid allowed radius");
  }

  if (
    input.isActive !== undefined &&
    typeof input.isActive !== "boolean"
  ) {
    throw new Error("Invalid venue status");
  }

  if (
    isCreate &&
    (input.latitude === undefined ||
      input.longitude === undefined ||
      input.allowedRadius === undefined)
  ) {
    throw new Error("Venue coordinates and radius are required");
  }
};

export const createLectureVenue = async (
  lecturerId: string,
  data: CreateLectureVenueInput
) => {
  validateVenueInput(data, true);

  return LectureVenue.create({
    lecturerId,
    venueName: data.venueName.trim(),
    latitude: data.latitude,
    longitude: data.longitude,
    allowedRadius: data.allowedRadius,
  });
};

export const getLecturerVenues = async (lecturerId: string) => {
  return LectureVenue.find({ lecturerId }).sort({ createdAt: -1 });
};

export const updateLectureVenue = async (
  venueId: string,
  lecturerId: string,
  data: UpdateLectureVenueInput
) => {
  if (!mongoose.isValidObjectId(venueId)) {
    throw new Error("Invalid venue ID");
  }

  validateVenueInput(data);

  const venue = await LectureVenue.findOne({
    _id: venueId,
    lecturerId,
  });

  if (!venue) {
    throw new Error("Venue not found");
  }

  if (data.venueName !== undefined) {
    venue.venueName = data.venueName.trim();
  }

  if (data.latitude !== undefined) {
    venue.latitude = data.latitude;
    venue.longitude = data.longitude!;
  }

  if (data.allowedRadius !== undefined) {
    venue.allowedRadius = data.allowedRadius;
  }

  if (data.isActive !== undefined) {
    venue.isActive = data.isActive;
  }

  await venue.save();
  return venue;
};

export const deleteLectureVenue = async (
  venueId: string,
  lecturerId: string
) => {
  if (!mongoose.isValidObjectId(venueId)) {
    throw new Error("Invalid venue ID");
  }

  const venue = await LectureVenue.findOne({
    _id: venueId,
    lecturerId,
  });

  if (!venue) {
    throw new Error("Venue not found");
  }

  const { AttendanceSession } = await import(
    "../models/AttendanceSession.js"
  );

  const used = await AttendanceSession.exists({ venueId });

  if (used) {
    throw new Error("Venue is used by attendance sessions");
  }

  await venue.deleteOne();
};
