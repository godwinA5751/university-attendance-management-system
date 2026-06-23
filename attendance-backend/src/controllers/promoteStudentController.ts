
import type { Request, Response } from "express";
import { promoteStudent } from "../services/promoteStudent.js";

export const promoteStudentController = async (
  req: Request,
  res: Response
) => {
  try {
    const studentId = req.params.id as string;

    const student = await promoteStudent({
      studentId,
      newLevel: req.body.newLevel,
      carryOverCourseIds: req.body.carryOverCourseIds,
    });

    return res.status(200).json({
      message: "Student promoted successfully",
      data: student,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Student not found") {
        return res.status(404).json({
          message: error.message,
        });
      }

      if (
        error.message === "Invalid level progression"
      ) {
        return res.status(400).json({
          message: error.message,
        });
      }

      if (
        error.message ===
        "No active academic session found"
      ) {
        return res.status(400).json({
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