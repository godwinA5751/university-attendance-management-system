import mongoose from "mongoose";
import { CourseEnrollment } from "../models/CourseEnrollment.js";
import type { CreateCourseEnrollmentInput } from "../types/courseEnrollment.types.js";
import { Student } from "../models/Student.js";
import { Course } from "../models/Course.js";
import { Attendance } from "../models/Attendance.js";

export const createCourseEnrollment = async (
  input: CreateCourseEnrollmentInput,
  session?: mongoose.ClientSession
) => {
  const { studentId, courseId } = input;

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
  }).session(session ?? null);

  if (existingEnrollment) {
    throw new Error(
      "Student already enrolled in this course for this curriculum"
    );
  }

  const enrollment = new CourseEnrollment({
    studentId,
    courseId,
    status: "active",
  });

  await enrollment.save(session ? { session } : {});

  return enrollment;
};

export const getEnrollmentsForCourse = async (
  courseId: string,
  dateTime?: string
) => {
  const course = await Course.findById(courseId);

  if (!course) {
    throw new Error("Course not found");
  }

  const enrollments = await CourseEnrollment.find({
    courseId,
    status: "active",
  }).populate({
    path: "studentId",
    populate: {
      path: "userId",
      select: "firstName middleName lastName",
    },
  });

  let markedMap = new Map<string, string>();

  if (dateTime) {
    const day = new Date(dateTime);
    const startOfDay = new Date(day);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(day);
    endOfDay.setHours(23, 59, 59, 999);

    const enrollmentIds = enrollments.map((e) => e._id);

    const records = await Attendance.find({
      enrollmentId: { $in: enrollmentIds },
      dateTime: { $gte: startOfDay, $lte: endOfDay },
    });

    markedMap = new Map(
      records.map((r) => [
        r.enrollmentId.toString(),
        r.status,
      ])
    );
  }

  return enrollments
    .filter((e: any) => e.studentId && e.studentId.userId)
    .map((e: any) => {
      const student = e.studentId;
      const user = student.userId;

      return {
        enrollmentId: e._id,
        studentId: student._id,
        matricNumber: student.matricNumber,
        studentName: `${user.firstName} ${user.middleName || ""} ${user.lastName}`,
        status: markedMap.get(e._id.toString()) ?? null,
      };
    });
};