import { Student } from "../models/Student.js";
import { Course } from "../models/Course.js";
import { createCourseEnrollment } from "./courseEnrollmentService.js";

type EnrollStudentIntoLevelCoursesInput = {
  studentId: string;
  level: number;
  academicSessionId: string;
  carryOverCourseIds?: string[];
};


type EnrollExistingStudentsIntoCourseInput = {
  courseId: string;
  level: number;
  academicSessionId: string;
};

export const enrollStudentIntoLevelCourses = async ({
  studentId,
  level,
  academicSessionId,
  carryOverCourseIds = [],
}: EnrollStudentIntoLevelCoursesInput) => {
  // Find all courses for the student's level
  const levelCourses = await Course.find({
    level,
  });

  // Merge level courses + carry over courses
  const allCourseIds = [
    ...levelCourses.map((course) =>
      course._id.toString()
    ),
    ...carryOverCourseIds,
  ];

  // Remove duplicates
  const uniqueCourseIds = [...new Set(allCourseIds)];

  // Create enrollments
  for (const courseId of uniqueCourseIds) {
    try {
      await createCourseEnrollment({
        studentId,
        courseId,
        academicSessionId
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message ===
          "Student already enrolled in this course for this session"
      ) {
        continue;
      }

      throw error;
    }
  }
};

export const enrollExistingStudentsIntoCourse = async ({
  courseId,
  level,
  academicSessionId,
}: EnrollExistingStudentsIntoCourseInput) => {
  // 1. Verify course exists
  const course = await Course.findById(courseId);

  if (!course) {
    throw new Error("Course not found");
  }

  // 2. Find all students in this level
  const students = await Student.find({
    currentLevel: level,
  });

  // 3. Enroll each student
  for (const student of students) {
    try {
      await createCourseEnrollment({
        studentId: student._id.toString(),
        courseId,
        academicSessionId,
      });
    } catch (error) {
      // Ignore duplicates
      if (
        error instanceof Error &&
        error.message ===
          "Student already enrolled in this course for this session"
      ) {
        continue;
      }

      throw error;
    }
  }
};