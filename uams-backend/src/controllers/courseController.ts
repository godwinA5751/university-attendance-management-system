import type { Request, Response } from "express";
import { createCourse, getCourse, getAllCourses, updateCourse, deleteCourse } from "../services/courseService.js";
import { getAttendanceByCourse } from "../services/attendanceService.js";
import { getLecturersGroupedByCourse, getLecturersForCourse } from "../services/courseAssignmentService.js";

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
    const [
      { courses, pagination },
      lecturersGrouped,
    ] = await Promise.all([
      getAllCourses(req.query),
      getLecturersGroupedByCourse(),
    ]);
    
    const data = courses.map((course) => ({
      ...course.toObject(),
      lecturers:
        lecturersGrouped[course._id.toString()] ?? [],
    }));
    
    res.status(200).json({
      message: "Courses fetched successfully",
      data,
      pagination
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
    const course = await getCourse(req.params.id as string);
    
    const lecturers = await getLecturersForCourse(
      req.params.id as string
    );
    
    res.status(200).json({
      message: "Course fetched successfully",
      data: {
        ...course.toObject(),
        lecturers,
      },
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

export const updateCourseController = async (
  req: Request,
  res: Response
) => {
  try {
    const course = await updateCourse({
      courseId: req.params.id,
      ...req.body,
    });

    res.status(200).json({
      message: "Course updated successfully",
      data: course,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Course not found") {
        return res.status(404).json({
          message: error.message,
        });
      }

      if (error.message === "Academic session not found") {
        return res.status(404).json({
          message: error.message,
        });
      }

      if (error.message === "Course already exists for this academic session") {
        return res.status(409).json({
          message: error.message,
        });
      }

      return res.status(500).json({
        message: error.message,
      });
    }
  }
};

export const deleteCourseController = async (
  req: Request,
  res: Response
) => {
  try {
    await deleteCourse(req.params.id as string);

    res.status(200).json({
      message: "Course deleted successfully",
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Course not found") {
        return res.status(404).json({
          message: error.message,
        });
      }

      return res.status(500).json({
        message: error.message,
      });
    }
  }
};
                                                    