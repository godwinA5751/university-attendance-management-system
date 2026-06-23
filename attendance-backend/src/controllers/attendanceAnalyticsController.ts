import type { Request, Response } from "express";
import { getStudentAttendanceStats, getCourseAttendanceStats, getDashboardStats, getLecturerDashboard } from "../services/attendanceAnalytics.js";
import { Course } from "../models/Course.js";
import { getLecturerFromUserId } from "../utils/getLecturerFromId.js";
import { Student } from "../models/Student.js";

export const studentAnalyticsController = async (
  req: Request,
  res: Response
) => {
  try {
    let studentId: string;
    
    if (req.user!.role === "student") {
      const student = await Student.findOne({
        userId: req.user!.id,
      });
    
      if (!student) {
        return res.status(404).json({
          message: "Student not found",
        });
      }
    
      studentId = student._id.toString();
    } else {
      studentId = req.params.id as string;
    }

    const stats = await getStudentAttendanceStats(studentId);

    return res.status(200).json({
      message: "Student attendance analytics fetched",
      data: stats,
    });
  } catch (error) {
    return res.status(500).json({
      message: error instanceof Error ? error.message : "Server error",
    });
  }
};

export const courseAnalyticsController = async (
  req: Request,
  res: Response
) => {
  try {
    const courseId = req.params.id as string;
    
    const courseExists = await Course.exists({ _id: courseId });
    
    if (!courseExists) {
      return res.status(404).json({
        message: "Course not found",
      });
    }
    
    if (req.user!.role === "lecturer") {
      const lecturer = await getLecturerFromUserId(req.user!.id);
    
      const isAssigned = await Course.exists({
        _id: courseId,
        lecturerIds: lecturer._id,
      });
    
      if (!isAssigned) {
        return res.status(403).json({
          message: "Not authorized for this course",
        });
      }
    }
    
    const stats = await getCourseAttendanceStats(courseId);

    return res.status(200).json({
      message: "Course attendance analytics fetched",
      data: stats,
    });
  } catch (error) {
    return res.status(500).json({
      message: error instanceof Error ? error.message : "Server error",
    });
  }
};

export const dashboardController = async (
  req: Request,
  res: Response
) => {
  try {
    const stats = await getDashboardStats();

    return res.status(200).json({
      message: "Dashboard data fetched",
      data: stats,
    });
  } catch (error) {
    return res.status(500).json({
      message: error instanceof Error ? error.message : "Server error",
    });
  }
};

export const lecturerDashboardController = async (req: Request, res: Response) => {
  try {
    
    const lecturerId = req.user!.id;

    const data = await getLecturerDashboard(lecturerId);

    return res.status(200).json({
      message: "Lecturer dashboard fetched successfully",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      message: error instanceof Error ? error.message : "Server error",
    });
  }
};