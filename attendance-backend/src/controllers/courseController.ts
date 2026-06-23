import type { Request, Response } from "express";
import { createCourse, assignLecturersToCourse, replaceLecturersForCourse, removeLecturerFromCourse, getCourseWithLecturers, getAllCoursesWithLecturers } from "../services/courseService.js";
import { getAttendanceByCourse } from "../services/attendanceService.js";

export const getCourseAttendanceController = async (
  req: Request,
  res: Response
) => {
  try {
    const courseId = req.params.id as string;

    const attendance = await getAttendanceByCourse(courseId);

    return res.status(200).json({
      message: "Course attendance fetched successfully",
      data: attendance,
    });
  } catch (error) {
    return res.status(500).json({
      message: error instanceof Error ? error.message : "Server error",
    });
  }
};

export const getAllCoursesController = async (
  req: Request,
  res: Response
) => {
  try {
    const courses = await getAllCoursesWithLecturers();

    return res.status(200).json({
      message: "Courses fetched successfully",
      data: courses,
    });
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

export const getCourseController = async (
  req: Request,
  res: Response
) => {
  try {
    const courseId = req.params.id as string;

    const course = await getCourseWithLecturers(courseId);

    return res.status(200).json({
      message: "Course fetched successfully",
      data: course,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Course not found") {
        return res.status(404).json({ message: error.message });
      }

      return res.status(500).json({ message: error.message });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const createCourseController = async (req: Request, res: Response) => {
  try {
    const course = await createCourse(req.body);

    return res.status(201).json({
      message: "Course created successfully",
      data: course,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Course already exists") {
        return res.status(409).json({
          message: error.message,
        });
      }

      if (error.message === "One or more lecturers not found") {
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

export const assignLecturersController = async (
  req: Request,
  res: Response
) => {
  try {
    const courseId = req.params.id as string;
    const lecturerIds: string[] = req.body.lecturerIds;
    if (!courseId) {
      return res.status(400).json({ message: "Course ID is required" });
    }
    
    if (!Array.isArray(lecturerIds)) {
      return res.status(400).json({ message: "lecturerIds must be an array" });
    }

    const uniqueLecturerIds = [...new Set(lecturerIds)];
    
    const course = await assignLecturersToCourse({
      courseId,
      lecturerIds: uniqueLecturerIds,
    });

    return res.status(200).json({
      message: "Lecturers assigned successfully",
      data: course,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Course not found") {
        return res.status(404).json({ message: error.message });
      }

      if (error.message === "One or more lecturers not found") {
        return res.status(400).json({ message: error.message });
      }

      return res.status(500).json({ message: error.message });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const replaceLecturersController = async (
  req: Request,
  res: Response
) => {
  try {
    const courseId = req.params.id as string;
    const lecturerIds = req.body.lecturerIds;

    if (!courseId) {
      return res.status(400).json({ message: "Course ID is required" });
    }

    if (!Array.isArray(lecturerIds)) {
      return res.status(400).json({
        message: "lecturerIds must be an array",
      });
    }

    const uniqueLecturerIds = [...new Set(lecturerIds)];

    const course = await replaceLecturersForCourse({
      courseId,
      lecturerIds: uniqueLecturerIds,
    });

    return res.status(200).json({
      message: "Lecturers replaced successfully",
      data: course,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Course not found") {
        return res.status(404).json({ message: error.message });
      }

      if (error.message === "One or more lecturers not found") {
        return res.status(400).json({ message: error.message });
      }

      return res.status(500).json({ message: error.message });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const removeLecturerController = async (
  req: Request,
  res: Response
) => {
  try {
    const courseId = req.params.id as string;
    const lecturerId = req.params.lecturerId as string;

    if (!courseId || !lecturerId) {
      return res.status(400).json({
        message: "Course ID and Lecturer ID are required",
      });
    }

    const course = await removeLecturerFromCourse(
      courseId,
      lecturerId
    );

    return res.status(200).json({
      message: "Lecturer removed successfully",
      data: course,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Course not found") {
        return res.status(404).json({ message: error.message });
      }

      if (
        error.message === "Lecturer not assigned to this course"
      ) {
        return res.status(400).json({ message: error.message });
      }

      return res.status(500).json({ message: error.message });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};