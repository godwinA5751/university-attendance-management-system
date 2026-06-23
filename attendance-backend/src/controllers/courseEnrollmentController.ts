import type { Request, Response } from "express";
import { createCourseEnrollment } from "../services/courseEnrollmentService.js";
import { getAttendanceByEnrollment } from "../services/attendanceService.js";

export const getEnrollmentAttendanceController = async (
  req: Request,
  res: Response
) => {
  try {
    const enrollmentId = req.params.id as string;

    const attendance = await getAttendanceByEnrollment(enrollmentId);

    return res.status(200).json({
      message: "Enrollment attendance fetched successfully",
      data: attendance,
    });
  } catch (error) {
    return res.status(500).json({
      message: error instanceof Error ? error.message : "Server error",
    });
  }
};

export const createCourseEnrollmentController = async (
  req: Request,
  res: Response
) => {
  try {
    const enrollment = await createCourseEnrollment(req.body);

    return res.status(201).json({
      message: "Student enrolled successfully",
      data: enrollment,
    });
  } catch (error) {
    if (error instanceof Error) {
      // Not found errors
      if (
        error.message === "Student not found" ||
        error.message === "Course not found" ||
        error.message === "Academic session not found"
      ) {
        return res.status(404).json({
          message: error.message,
        });
      }

      // Duplicate enrollment
      if (
        error.message ===
        "Student already enrolled in this course for this session"
      ) {
        return res.status(409).json({
          message: error.message,
        });
      }

      return res.status(500).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};