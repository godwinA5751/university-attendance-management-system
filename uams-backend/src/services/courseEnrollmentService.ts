import { CourseEnrollment } from "../models/CourseEnrollment.js";
import type { CreateCourseEnrollmentInput } from "../types/courseEnrollment.types.js";
import { Student } from "../models/Student.js";
import { Course } from "../models/Course.js";
import { AcademicSession } from "../models/AcademicSession.js";

export const createCourseEnrollment = async (
  input: CreateCourseEnrollmentInput
) => {
  const { studentId, courseId, academicSessionId } = input;

  // 1. Verify student exists
  const student = await Student.findById(studentId);
  if (!student) {
    throw new Error("Student not found");
  }

  // 2. Verify course exists
  const course = await Course.findById(courseId);
  if (!course) {
    throw new Error("Course not found");
  }

  // 3. Verify session exists
  const session = await AcademicSession.findById(academicSessionId);
  if (!session) {
    throw new Error("Academic session not found");
  }

  // 4. Prevent duplicate enrollment (VERY IMPORTANT)
  const existingEnrollment = await CourseEnrollment.findOne({
    studentId,
    courseId,
    academicSessionId,
  });

  if (existingEnrollment) {
    throw new Error("Student already enrolled in this course for this session");
  }

  // 5. Create enrollment
  const enrollment = new CourseEnrollment({
    studentId,
    courseId,
    academicSessionId,
    status: "active",
  });

  await enrollment.save();

  return enrollment;
};