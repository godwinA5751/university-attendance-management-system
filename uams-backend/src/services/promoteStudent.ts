import mongoose from "mongoose";
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

  const mongoSession = await mongoose.startSession();

  try {
    const result = await mongoSession.withTransaction(async () => {
      const student = await Student.findById(studentId)
        .session(mongoSession);

      if (!student) {
        throw new Error("Student not found");
      }

      const previousLevel = student.currentLevel;

      if (newLevel !== previousLevel + 100) {
        throw new Error("Invalid level progression");
      }

      student.currentLevel = newLevel;

      await student.save({ session: mongoSession });

      await enrollStudentIntoLevelCourses({
        studentId: student._id.toString(),
        level: newLevel,
        curriculumId: student.curriculumId.toString(),
        carryOverCourseIds,
        maxCarryOverLevel: previousLevel,
        session: mongoSession,
      });

      return student;
    });

    if (!result) {
      throw new Error("Student promotion transaction failed");
    }

    return result;
  } finally {
    await mongoSession.endSession();
  }
};
