import { CourseEnrollment } from "../models/CourseEnrollment.js";
import { Attendance } from "../models/Attendance.js";
import { Course } from "../models/Course.js";
import { Lecturer } from "../models/Lecturer.js";

export const getStudentAttendanceStats = async (
  studentId: string
) => {
  const enrollments = await CourseEnrollment.find({
    studentId,
  }).populate("courseId");

  let totalClassesOverall = 0;
  let totalAttendedOverall = 0;

  const courses = await Promise.all(
    enrollments.map(async (enrollment) => {
      const course = enrollment.courseId as any;

      const totalClasses = await Attendance.countDocuments({
        enrollmentId: enrollment._id,
      });

      const classesAttended =
        await Attendance.countDocuments({
          enrollmentId: enrollment._id,
          status: "present",
        });

      const classesMissed = totalClasses - classesAttended;

      totalClassesOverall += totalClasses;
      totalAttendedOverall += classesAttended;

      const attendanceRate =
        totalClasses === 0
          ? 0
          : (classesAttended / totalClasses) * 100;

      return {
        courseCode: course.courseCode,
        courseTitle: course.courseTitle,
        attendanceRate: Number(
          attendanceRate.toFixed(2)
        ),
        classesAttended,
        totalClasses,
        classesMissed,
      };
    })
  );

  const overallAttendanceRate =
    totalClassesOverall === 0
      ? 0
      : (totalAttendedOverall / totalClassesOverall) * 100;

  return {
    overallAttendanceRate: Number(
      overallAttendanceRate.toFixed(2)
    ),
    courses,
  };
};

export const getCourseAttendanceStats = async (courseId: string) => {
  const enrollments = await CourseEnrollment.find({ courseId });

  const enrollmentIds = enrollments.map((e) => e._id);

  const presentCount = await Attendance.countDocuments({
    enrollmentId: { $in: enrollmentIds },
    status: "present",
  });
  
  const total = await Attendance.countDocuments({
    enrollmentId: { $in: enrollmentIds },
  });

  const absentCount = total - presentCount;

  const percentage = total === 0 ? 0 : (presentCount / total) * 100;

  return {
    totalAttendanceRecords: total,
    presentCount,
    absentCount,
    attendanceRate: Number(percentage.toFixed(2)),
  };
};

export const getDashboardStats = async () => {
  const totalStudents = await CourseEnrollment.distinct("studentId");
  const totalCourses = await CourseEnrollment.distinct("courseId");
  const totalAttendance = await Attendance.countDocuments();

  const present = await Attendance.countDocuments({
    status: "present",
  });

  const attendanceRate =
    totalAttendance === 0
      ? 0
      : (present / totalAttendance) * 100;

  return {
    totalStudents,
    totalCourses: totalCourses.length,
    totalAttendance: totalAttendance,
    attendanceRate: Number(attendanceRate.toFixed(2)),
  };
};

export const getLecturerDashboard = async (userId: string) => {

  const lecturer = await Lecturer.findOne({
    userId,
  });

  if (!lecturer) {
    throw new Error("Lecturer not found");
  }

  const courses = await Course.find({
    lecturerIds: lecturer._id,
  });

  console.log("User ID:", userId);
  console.log("Lecturer ID:", lecturer._id);

  const dashboard = await Promise.all(
    courses.map(async (course) => {
      const enrollments = await CourseEnrollment.find({
        courseId: course._id,
      });

      const enrollmentIds = enrollments.map((e) => e._id);

      const totalAttendanceRecords = await Attendance.countDocuments({
        enrollmentId: { $in: enrollmentIds },
      });

      const students = await Promise.all(
        enrollments.map(async (enrollment) => {
          const present = await Attendance.countDocuments({
            enrollmentId: enrollment._id,
            status: "present",
          });

          const total = await Attendance.countDocuments({
            enrollmentId: enrollment._id,
          });

          const rate = total === 0 ? 0 : (present / total) * 100;

          return {
            studentId: enrollment.studentId,
            attendanceRate: Number(rate.toFixed(2)),
          };
        })
      );

      return {
        courseId: course._id,
        courseTitle: course.courseTitle,
        totalStudents: enrollments.length,
        totalAttendanceRecords,
        students,
      };
    })
  );

  console.log("Courses found:", courses.length);

  return dashboard;
};