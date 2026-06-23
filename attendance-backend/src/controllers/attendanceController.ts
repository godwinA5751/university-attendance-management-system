import type { Request, Response } from "express";
import { createAttendance } from "../services/attendanceService.js";
import { Lecturer } from "../models/Lecturer.js";

export const createAttendanceController = async (
  req: Request,
  res: Response
) => {
  try {
    const lecturer = await Lecturer.findOne({
      userId: req.user!.id,
    });
    
    if (!lecturer) {
      return res.status(404).json({
        message: "Lecturer not found",
      });
    }
    const result = await createAttendance({
      enrollmentId: req.body.enrollmentId,
      dateTime: req.body.dateTime,
      status: req.body.status
    }, lecturer._id.toString());

    return res.status(201).json({
      message: "Attendance created successfully",
      data: result,
    });
  } catch (error) {
    if (error instanceof Error) {
      // 🔴 1. Not found errors
      if (error.message === "Enrollment not found") {
        return res.status(404).json({
          message: error.message,
        });
      }

      // 🔴 2. Forbidden / business rule errors
      if (
        error.message ===
        "Cannot record attendance for inactive enrollment"
      ) {
        return res.status(403).json({
          message: error.message,
        });
      }

      if (error.message === "Not authorized to mark attendance for this course") {
        return res.status(403).json({
          message: error.message,
        });
      }

      // 🔴 3. Validation errors
      if (error.message === "Invalid attendance date") {
        return res.status(400).json({
          message: error.message,
        });
      }

      // 🔴 4. Conflict errors
      if (error.message === "Attendance already recorded") {
        return res.status(409).json({
          message: error.message,
        });
      }

      // 🔴 fallback
      return res.status(500).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};