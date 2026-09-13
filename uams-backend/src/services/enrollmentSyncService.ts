import { Student } from "../models/Student.js";
import { Course } from "../models/Course.js";
import { createCourseEnrollment } from "./courseEnrollmentService.js";

type EnrollStudentIntoLevelCoursesInput = {
  studentId: string;
  level: number;
  curriculumId: string;
  carryOverCourseIds?: string[];
};

type EnrollExistingStudentsIntoCourseInput = {
  courseId: string;
  level: number;
  curriculumId: string;
};

export const enrollStudentIntoLevelCourses = async ({
  studentId,
  level,
  curriculumId,
  carryOverCourseIds = [],
}: EnrollStudentIntoLevelCoursesInput) => {
  // Find all courses for the student's level
  // and curriculum
  const levelCourses = await Course.find({
    level,
    curriculumId,
  });

  // Merge level courses + carryover courses
  const allCourseIds = [
    ...levelCourses.map((course) =>
      course._id.toString()
    ),
    ...carryOverCourseIds,
  ];

  // Remove duplicates
  const uniqueCourseIds = [
    ...new Set(allCourseIds),
  ];

  // Create enrollments
  for (const courseId of uniqueCourseIds) {
    try {
      await createCourseEnrollment({
        studentId,
        courseId,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message ===
          "Student already enrolled in this course for this curriculum"
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
  curriculumId,
}: EnrollExistingStudentsIntoCourseInput) => {
  // Verify course exists
  const course = await Course.findById(
    courseId
  );

  if (!course) {
    throw new Error("Course not found");
  }

  // Find students in this level
  // AND curriculum
  const students = await Student.find({
    currentLevel: level,
    curriculumId,
  });

  // Enroll each matching student
  for (const student of students) {
    try {
      await createCourseEnrollment({
        studentId: student._id.toString(),
        courseId,
      });
    } catch (error) {
      // Ignore duplicate enrollments
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