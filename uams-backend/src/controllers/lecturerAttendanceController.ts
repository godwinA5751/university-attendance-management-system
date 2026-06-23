import type { Request, Response } from "express";
import { getLecturerAttendanceReport } from "../services/attendanceService.js";

export const lecturerAttendanceReportController = async (
  req: Request,
  res: Response
) => {
  try {
    const lecturerId = req.user!.id;

    if (!lecturerId) {
      return res.status(400).json({
        message: "Lecturer ID is required",
      });
    }

    const report = await getLecturerAttendanceReport(lecturerId);

    return res.status(200).json({
      message: "Lecturer attendance report fetched successfully",
      data: report,
    });
  } catch (error) {
    return res.status(500).json({
      message: error instanceof Error ? error.message : "Server error",
    });
  }
};