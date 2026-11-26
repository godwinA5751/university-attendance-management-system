import mongoose from "mongoose";
import type { Request, Response } from "express";

import {
  createCourseEnrollment,
  getEnrollmentsForCourse,
} from "../services/courseEnrollmentService.js";

import { getAttendanceByEnrollment } from "../services/attendanceService.js";
import { Lecturer } from "../models/Lecturer.js";
import { CourseAssignment } from "../models/CourseAssignment.js";
import type { CreateCourseEnrollmentInput } from "../types/courseEnrollment.types.js";

export const getCourseEnrollmentsController = async (
  req: Request,
  res: Response
) => {
  try {
    const courseId = req.params.courseId as string;
    const academicSessionId = req.query.academicSessionId as string;
    const attendanceSessionId = req.query.attendanceSessionId as
      | string
      | undefined;

    if (
      !mongoose.isValidObjectId(courseId) ||
      !mongoose.isValidObjectId(academicSessionId)
    ) {
      return res.status(400).json({
        message: "Invalid course or academic session ID",
      });
    }

    if (
      attendanceSessionId &&
      !mongoose.isValidObjectId(attendanceSessionId)
    ) {
      return res.status(400).json({
        message: "Invalid attendance session ID",
      });
    }

    if (req.user!.role === "lecturer") {
      const lecturer = await Lecturer.findOne({
        userId: req.user!.id,
      });

      if (!lecturer) {
        return res.status(404).json({
          message: "Lecturer not found",
        });
      }

      const isAssigned = await CourseAssignment.exists({
        courseId,
        lecturerId: lecturer._id,
        academicSessionId,
      });

      if (!isAssigned) {
        return res.status(403).json({
          message: "Not authorized for this course and academic session",
        });
      }
    }

    const students = await getEnrollmentsForCourse(
      courseId,
      academicSessionId,
      attendanceSessionId
    );

    return res.status(200).json({
      message: "Enrolled students fetched successfully",
      data: students,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Server error";

    if (message.includes("not found")) {
      return res.status(404).json({ message });
    }

    if (message.includes("Invalid") || message.includes("required")) {
      return res.status(400).json({ message });
    }

    return res.status(500).json({ message });
  }
};

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
    const message =
      error instanceof Error ? error.message : "Server error";

    if (message.includes("Invalid")) {
      return res.status(400).json({ message });
    }

    return res.status(500).json({ message });
  }
};

export const createCourseEnrollmentController = async (
  req: Request,
  res: Response
) => {
  try {
    const input: CreateCourseEnrollmentInput = {
      studentId: req.body.studentId,
      courseId: req.body.courseId,
      academicSessionId: req.body.academicSessionId,
    };

    const enrollment = await createCourseEnrollment(input);

    return res.status(201).json({
      message: "Student enrolled successfully",
      data: enrollment,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";

    if (
      message === "Student not found" ||
      message === "Course not found" ||
      message === "Academic session not found"
    ) {
      return res.status(404).json({ message });
    }

    if (
      message.includes("already enrolled") ||
      message.includes("duplicate")
    ) {
      return res.status(409).json({ message });
    }

    if (
      message.includes("Invalid") ||
      message.includes("required") ||
      message.includes("different curricula") ||
      message.includes("not active")
    ) {
      return res.status(400).json({ message });
    }

    return res.status(500).json({ message });
  }
};