import mongoose from "mongoose";
import type { Request, Response } from "express";
import { createLecturer, getLecturerCourses, getLecturerProfile, getLecturerById, getAllLecturers, updateLecturer, deleteLecturer } from "../services/lecturerService.js"

const isValidLecturerId = (id: string) =>
  mongoose.isValidObjectId(id);

export const getLecturerCoursesController = async (
  req: Request,
  res: Response
) => {
  try {
    const lecturerId = req.user!.id;

    const courses = await getLecturerCourses(lecturerId);

    return res.status(200).json({
      message: "Lecturer courses fetched successfully",
      data: courses,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message === "Lecturer not found" ||
        error.message === "No active academic session found")
    ) {
      return res.status(404).json({ message: error.message });
    }

    return res.status(500).json({
      message: error instanceof Error ? error.message : "Server error",
    });
  }
};

export const createLecturerController = async (req: Request, res: Response) => {
  try {
    const { user, lecturer } = await createLecturer(req.body);
    return res.status(201).json({
      message: "Lecturer created successfully",
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        lecturer,
        lecturerName: `${user.firstName} ${user.lastName}`,
      },
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      return res.status(409).json({
        message: "Staff number already exists",
      });
    }
    if (error instanceof Error) {
      if (error.message === "Staff number already exists") {
        return res.status(409).json({ message: error.message });
      }

      if (
        error.message.includes("required") ||
        error.message.includes("non-empty string") ||
        error.message.includes("Invalid lecturer input")
      ) {
        return res.status(400).json({ message: error.message });
      }
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

export const lecturerProfileController = async (
  req: Request,
  res: Response
) => {
  try {
    const profile = await getLecturerProfile(
      req.user!.id
    );

    return res.status(200).json({
      message: "Lecturer profile fetched successfully",
      data: profile,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Lecturer not found"
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

export const getAllLecturersController = async (
  req: Request,
  res: Response
) => {
  try {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 10);
    const search = req.query.search ?? "";

    if (
      !Number.isInteger(page) ||
      page < 1 ||
      !Number.isInteger(limit) ||
      limit < 1 ||
      limit > 100
    ) {
      return res.status(400).json({
        message: "Invalid pagination parameters",
      });
    }

    if (typeof search !== "string") {
      return res.status(400).json({
        message: "Search must be a string",
      });
    }

    const { data, pagination } = await getAllLecturers({
      page,
      limit,
      search,
    });

    return res.status(200).json({
      message: "Lecturers fetched successfully",
      data,
      pagination,
    });
  } catch {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getLecturerController = async (
  req: Request,
  res: Response
) => {
  try {
    if (!isValidLecturerId(req.params.id as string)) {
      return res.status(400).json({
        message: "Invalid lecturer ID",
      });
    }
    const lecturer = await getLecturerById(
      req.params.id as string
    );

    return res.status(200).json({
      message: "Lecturer fetched successfully",
      data: lecturer,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Lecturer not found"
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

export const updateLecturerController = async (
  req: Request,
  res: Response
) => {
  try {
    if (!isValidLecturerId(req.params.id as string)) {
      return res.status(400).json({
        message: "Invalid lecturer ID",
      });
    }
    const lecturer = await updateLecturer(
      req.params.id as string,
      req.body
    );

    return res.status(200).json({
      message: "Lecturer updated successfully",
      data: lecturer,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Lecturer not found") {
        return res.status(404).json({ message: error.message });
      }

      if (
        error.message.includes("required") ||
        error.message.includes("non-empty string") ||
        error.message.includes("Invalid lecturer input") ||
        error.message.includes("At least one field") ||
        error.message.includes("cannot be updated")
      ) {
        return res.status(400).json({ message: error.message });
      }
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const deleteLecturerController = async (
  req: Request,
  res: Response
) => {
  try {
    if (!isValidLecturerId(req.params.id as string)) {
      return res.status(400).json({
        message: "Invalid lecturer ID",
      });
    }
    await deleteLecturer(req.params.id as string);

    return res.status(200).json({
      message: "Lecturer deleted successfully",
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Cannot delete a lecturer with course assignments."
    ) {
      return res.status(409).json({ message: error.message });
    }

    if (
      error instanceof Error &&
      error.message === "Lecturer not found"
    ) {
      return res.status(404).json({ message: error.message });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};