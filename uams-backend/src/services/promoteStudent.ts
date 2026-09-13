import { Student } from "../models/Student.js";

import {
  enrollStudentIntoLevelCourses,
} from "./enrollmentSyncService.js";

type PromoteStudentInput = {
  studentId: string;
  newLevel: number;
  carryOverCourseIds?: string[];
};

export const promoteStudent = async (
  input: PromoteStudentInput
) => {
  const {
    studentId,
    newLevel,
    carryOverCourseIds = [],
  } = input;

  // Find student
  const student = await Student.findById(
    studentId
  );

  if (!student) {
    throw new Error("Student not found");
  }

  // Validate level progression
  if (
    newLevel !==
    student.currentLevel + 100
  ) {
    throw new Error(
      "Invalid level progression"
    );
  }

  // Update student level
  student.currentLevel = newLevel;

  await student.save();

  // Synchronize enrollments
  await enrollStudentIntoLevelCourses({
    studentId: student._id.toString(),
    level: newLevel,
    curriculumId:
      student.curriculumId.toString(),
    carryOverCourseIds,
  });

  return student;
};