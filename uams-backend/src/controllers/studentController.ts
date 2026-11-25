import mongoose from "mongoose";
import type { Request, Response } from "express";
import { createStudent, getStudentProfile, getStudents, getStudentById, updateStudent, deleteStudent } from "../services/studentService.js";
import { getAttendanceByStudent } from "../services/attendanceService.js";

const isValidStudentId = (id: string) =>
  mongoose.isValidObjectId(id);

const getErrorDetails = (error: unknown) => {
  if (error instanceof Error) {
    return {
      message: error.message,
      name: error.name,
      code: (error as Error & { code?: number }).code,
    };
  }

  return { message: "Internal server error", name: "", code: undefined };
};

const isValidationError = (error: unknown) => {
  const details = getErrorDetails(error);

  return (
    details.name === "ValidationError" ||
    details.name === "CastError" ||
    details.code === 11000 ||
    details.message.endsWith("is required") ||
    details.message.endsWith("must be a string") ||
    details.message.endsWith("cannot be empty") ||
    details.message.startsWith("Invalid ") ||
    details.message.includes("must be an array") ||
    details.message.includes("Duplicate carryover") ||
    details.message.includes("carryover course") ||
    details.message.includes("Carryover courses") ||
    details.message.includes("Students can only carry over")
  );
};


export const getStudentAttendanceController = async (
  req: Request,
  res: Response
) => {
  try {
    if (!isValidStudentId(req.params.id as string)) {
      return res.status(400).json({
        message: "Invalid student ID",
      });
    }
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

export const createStudentController = async (
  req: Request,
  res: Response
) => {
  try {
    const { user, student } = await createStudent(req.body);

    return res.status(201).json({
      message: "Student created successfully",
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          middleName: user.middleName,
          lastName: user.lastName,
          role: user.role,
        },
        student,
      },
    });
  } catch (error) {
    const details = getErrorDetails(error);

    if (details.message === "Matric number already exists" || details.code === 11000) {
      return res.status(409).json({ message: "Matric number already exists" });
    }

    if (details.message === "Curriculum not found") {
      return res.status(404).json({ message: details.message });
    }

    if (isValidationError(error)) {
      return res.status(400).json({ message: details.message });
    }

    console.error("Create student error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

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

export const getStudentsController = async (
  req: Request,
  res: Response
) => {
  try {
    const page = req.query.page === undefined ? 1 : Number(req.query.page);
    const limit = req.query.limit === undefined ? 10 : Number(req.query.limit);

    if (
      !Number.isInteger(page) ||
      page < 1 ||
      !Number.isInteger(limit) ||
      limit < 1 ||
      limit > 100
    ) {
      return res.status(400).json({
        message: "Page must be positive and limit must be between 1 and 100.",
      });
    }

    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim()
        : "";

    if (
      req.query.search !== undefined &&
      typeof req.query.search !== "string"
    ) {
      return res.status(400).json({ message: "Invalid search parameter" });
    }

    let level: number | undefined;

    if (req.query.level !== undefined) {
      level = Number(req.query.level);

      if (![100, 200, 300, 400, 500, 600].includes(level)) {
        return res.status(400).json({ message: "Invalid student level" });
      }
    }

    const curriculumId =
      typeof req.query.curriculumId === "string"
        ? req.query.curriculumId
        : "";

    if (
      req.query.curriculumId !== undefined &&
      (typeof req.query.curriculumId !== "string" ||
        !mongoose.Types.ObjectId.isValid(curriculumId))
    ) {
      return res.status(400).json({ message: "Invalid curriculum ID" });
    }

    const students = await getStudents({
      page,
      limit,
      search,
      ...(level !== undefined ? { level } : {}),
      curriculumId,
    });

    return res.status(200).json(students);
  } catch (error) {
    console.error("Get students error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getStudentController = async (
  req: Request,
  res: Response
) => {
  try {
    if (!isValidStudentId(req.params.id as string)) {
      return res.status(400).json({
        message: "Invalid student ID",
      });
    }
    const student = await getStudentById(
      req.params.id as string
    );

    return res.status(200).json({
      data: student,
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

export const updateStudentController = async (
  req: Request,
  res: Response
) => {
  try {
    if (!isValidStudentId(req.params.id as string)) {
      return res.status(400).json({
        message: "Invalid student ID",
      });
    }
    const student = await updateStudent(
      req.params.id as string,
      req.body
    );

    return res.status(200).json({
      message: "Student updated successfully",
      data: student,
    });
  } catch (error) {
    if (!(error instanceof Error)) {
      return res.status(500).json({
        message: "Internal server error",
      });
    }

    if (error.message === "Student not found") {
      return res.status(404).json({
        message: error.message,
      });
    }

    if (error.message === "Curriculum not found") {
      return res.status(404).json({
        message: error.message,
      });
    }

    if (
      error.message ===
        "Cannot change a student's curriculum while course enrollments exist."
    ) {
      return res.status(409).json({
        message: error.message,
      });
    }

    if (getErrorDetails(error).code === 11000) {
      return res.status(409).json({
        message: "A student with this matric number already exists.",
      });
    }

    if (isValidationError(error)) {
      return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const deleteStudentController = async (
  req: Request,
  res: Response
) => {
  try {
    if (!isValidStudentId(req.params.id as string)) {
      return res.status(400).json({
        message: "Invalid student ID",
      });
    }
    await deleteStudent(req.params.id as string);

    return res.status(200).json({
      message: "Student deleted successfully",
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

    if (
      error instanceof Error &&
      error.message ===
        "Cannot delete a student with attendance records."
    ) {
      return res.status(409).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message:
        error instanceof Error
          ? error.message
          : "Internal server error",
    });
  }
};