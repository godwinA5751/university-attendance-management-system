import type { Request, Response } from "express";
import { Lecturer } from "../models/Lecturer.js";
import { createAttendance } from "../services/attendanceService.js";

export const createAttendanceController = async (
  req: Request,
  res: Response
) => {
  try {
    const lecturer = await Lecturer.findOne({ userId: req.user!.id });

    if (!lecturer) {
      return res.status(404).json({
        message: "Lecturer profile not found",
      });
    }

    const attendance = await createAttendance(
      req.body,
      lecturer._id.toString()
    );

    return res.status(201).json({
      message: "Attendance recorded successfully",
      attendance,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";

    const status =
      message.includes("Invalid") ? 400
      : message.includes("not found") ? 404
      : message.includes("not enabled") ||
        message.includes("not authorized") ? 403
      : message.includes("already") ||
        message.includes("duplicate") ||
        message.includes("E11000") ? 409
      : 500;

    return res.status(status).json({ message });
  }
};