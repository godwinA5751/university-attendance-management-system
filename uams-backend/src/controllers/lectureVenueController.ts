
import type { Request, Response } from "express";
import {
  createLectureVenue,
  getLecturerVenues,
  updateLectureVenue,
  deleteLectureVenue,
} from "../services/lectureVenueService.js";
import { Lecturer } from "../models/Lecturer.js";

const handleError = (res: Response, error: unknown) => {
  const message = error instanceof Error ? error.message : "Internal server error";

  const status =
    message.includes("Invalid") ||
    message.includes("required") ||
    message.includes("must") ||
    message.includes("cannot be empty")
      ? 400
      : message.includes("not found")
        ? 404
        : message.includes("used by attendance sessions")
          ? 409
          : 500;

  return res.status(status).json({ message });
};

const getLecturerId = async (userId: string) => {
  const lecturer = await Lecturer.findOne({ userId });

  if (!lecturer) {
    throw new Error("Lecturer profile not found");
  }

  return lecturer._id.toString();
};

export const createLectureVenueController = async (req: Request, res: Response) => {
  try {
    const lecturerId = await getLecturerId(req.user!.id);
    const venue = await createLectureVenue(lecturerId, req.body);

    return res.status(201).json({
      message: "Lecture venue created successfully",
      venue,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const getLecturerVenuesController = async (req: Request, res: Response) => {
  try {
    const lecturerId = await getLecturerId(req.user!.id);
    const venues = await getLecturerVenues(lecturerId);

    return res.status(200).json({ venues });
  } catch (error) {
    return handleError(res, error);
  }
};

export const updateLectureVenueController = async (req: Request, res: Response) => {
  try {
    const lecturerId = await getLecturerId(req.user!.id);
    const venue = await updateLectureVenue(
      req.params.venueId as string,
      lecturerId,
      req.body
    );

    return res.status(200).json({
      message: "Lecture venue updated successfully",
      venue,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const deleteLectureVenueController = async (req: Request, res: Response) => {
  try {
    const lecturerId = await getLecturerId(req.user!.id);
    await deleteLectureVenue(req.params.venueId as string, lecturerId);

    return res.status(200).json({
      message: "Lecture venue deleted successfully",
    });
  } catch (error) {
    return handleError(res, error);
  }
};
