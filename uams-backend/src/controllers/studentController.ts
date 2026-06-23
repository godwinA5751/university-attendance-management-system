import type { Request, Response } from "express";
import { createStudent, getStudentProfile } from "../services/studentService.js";
import { getAttendanceByStudent } from "../services/attendanceService.js";

export const getStudentAttendanceController = async (
  req: Request,
  res: Response
) => {
  try {
    const studentId = req.params.id as string;

    const attendance = await getAttendanceByStudent(studentId);

    return res.status(200).json({
      message: "Student attendance fetched successfully",
      data: attendance,
    });
  } catch (error) {
    return res.status(500).json({
      message: error instanceof Error ? error.message : "Server error",
    });
  }
};

export const createStudentController = async (req: Request, res: Response) => {
  try {
    const { user, student } = await createStudent(req.body);
    return res.status(201).json({
      message: "Student created successfully",
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        student,
      },
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Matric number already exists"
    ) {
      return res.status(409).json({
        message: error.message,
      });
    } else {
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }
}

export const studentProfileController = async (
  req: Request,
  res: Response
) => {
  try {
    const profile = await getStudentProfile(
      req.user!.id
    );

    return res.status(200).json({
      message: "Student profile fetched successfully",
      data: profile,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Student not found"
    ) {
      return res.status(404).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};