
import mongoose from "mongoose";
import { CourseEnrollment } from "../models/CourseEnrollment.js";
import type { CreateCourseEnrollmentInput } from "../types/courseEnrollment.types.js";
import { Student } from "../models/Student.js";
import { Course } from "../models/Course.js";
import { Attendance } from "../models/Attendance.js";
import { AttendanceSession } from "../models/AttendanceSession.js";
import { AcademicSession } from "../models/AcademicSession.js";

export const createCourseEnrollment = async (
  input: CreateCourseEnrollmentInput,
  session?: mongoose.ClientSession
) => {
  const { studentId, courseId, academicSessionId } = input;

  if (
    !mongoose.isValidObjectId(studentId) ||
    !mongoose.isValidObjectId(courseId) ||
    !mongoose.isValidObjectId(academicSessionId)
  ) {
    throw new Error("Invalid student, course, or academic session ID");
  }

  const academicSession = await AcademicSession.findById(
    academicSessionId
  ).session(session ?? null);

  if (!academicSession) {
    throw new Error("Academic session not found");
  }

  if (!academicSession.isActive) {
    throw new Error("Academic session is not active");
  }

  const student = await Student.findById(studentId).session(session ?? null);
  if (!student) {
    throw new Error("Student not found");
  }

  const course = await Course.findById(courseId).session(session ?? null);
  if (!course) {
    throw new Error("Course not found");
  }

  if (student.curriculumId.toString() !== course.curriculumId.toString()) {
    throw new Error("Student and course belong to different curricula");
  }

  const existingEnrollment = await CourseEnrollment.findOne({
    studentId,
    courseId,
    academicSessionId,
  }).session(session ?? null);

  if (existingEnrollment) {
    throw new Error(
      "Student already enrolled in this course for this session"
    );
  }

  const enrollment = new CourseEnrollment({
    studentId,
    courseId,
    academicSessionId,
    status: "active",
  });

  try {
    await enrollment.save(session ? { session } : {});
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === 11000
    ) {
      throw new Error(
        "Student already enrolled in this course for this session"
      );
    }

    throw error;
  }

  return enrollment;

  return enrollment;
};

export const getEnrollmentsForCourse = async (
  courseId: string,
  academicSessionId: string,
  attendanceSessionId?: string
) => {
  if (
    !mongoose.isValidObjectId(courseId) ||
    !mongoose.isValidObjectId(academicSessionId)
  ) {
    throw new Error("Invalid course or academic session ID");
  }

  if (
    attendanceSessionId &&
    !mongoose.isValidObjectId(attendanceSessionId)
  ) {
    throw new Error("Invalid attendance session ID");
  }

  const course = await Course.findById(courseId);
  if (!course) {
    throw new Error("Course not found");
  }

  const academicSession = await AcademicSession.findById(academicSessionId);
  if (!academicSession) {
    throw new Error("Academic session not found");
  }

  const enrollments = await CourseEnrollment.find({
    courseId,
    academicSessionId,
    status: "active",
  }).populate({
    path: "studentId",
    populate: {
      path: "userId",
      select: "firstName middleName lastName",
    },
  });

  let markedMap = new Map<string, string>();

  if (attendanceSessionId) {
    const attendanceSession = await AttendanceSession.findOne({
      _id: attendanceSessionId,
      courseId,
      academicSessionId,
    });

    if (!attendanceSession) {
      throw new Error(
        "Attendance session not found for this course and academic session"
      );
    }

    const enrollmentIds = enrollments.map((enrollment) => enrollment._id);

    const records = await Attendance.find({
      attendanceSessionId,
      enrollmentId: { $in: enrollmentIds },
    });

    markedMap = new Map(
      records.map((record) => [
        record.enrollmentId.toString(),
        record.status,
      ])
    );
  }

  return enrollments
    .filter((enrollment: any) => enrollment.studentId?.userId)
    .map((enrollment: any) => {
      const student = enrollment.studentId;
      const user = student.userId;

      return {
        enrollmentId: enrollment._id,
        studentId: student._id,
        matricNumber: student.matricNumber,
        studentName: `${user.firstName} ${user.middleName || ""} ${user.lastName}`
          .replace(/\s+/g, " ")
          .trim(),
        status: markedMap.get(enrollment._id.toString()) ?? null,
      };
    });
};
