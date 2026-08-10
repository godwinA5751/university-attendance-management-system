import type { Request, Response } from "express";
import { createStudent, getStudentProfile, getStudents, getStudentById, updateStudent, deleteStudent } from "../services/studentService.js";
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


export const getStudentsController = async (
  req: Request,
  res: Response
) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const search =
      typeof req.query.search === "string"
        ? req.query.search
        : "";

    const level =
      typeof req.query.level === "number"
        ? Number(req.query.level)
        : Number(req.query.level)

    const academicSessionId =
      typeof req.query.academicSessionId === "string"
        ? req.query.academicSessionId
        : "";

    const students = await getStudents({
      page,
      limit,
      search,
      level,
      academicSessionId,
    });

    return res.status(200).json(students);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({
        message: error.message,
      });
    }

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
      message:
        error instanceof Error
          ? error.message
          : "Internal server error",
    });
  }
};

export const updateStudentController = async (
  req: Request,
  res: Response
) => {
  try {
    const student = await updateStudent(
      req.params.id as string,
      req.body
    );

    return res.status(200).json({
      message: "Student updated successfully",
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
      message:
        error instanceof Error
          ? error.message
          : "Internal server error",
    });
  }
};

export const deleteStudentController = async (
  req: Request,
  res: Response
) => {
  try {
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

    return res.status(500).json({
      message:
        error instanceof Error
          ? error.message
          : "Internal server error",
    });
  }
};