import { Student } from "../models/Student.js";
import { Course } from "../models/Course.js";
import { AcademicSession } from "../models/AcademicSession.js";
import { createCourseEnrollment } from "./courseEnrollmentService.js";

type PromoteStudentInput = {
  studentId: string;
  newLevel: number;
  carryOverCourseIds?: string[];
};

export const promoteStudent = async (input: PromoteStudentInput
) => {
  const {
    studentId,
    newLevel,
    carryOverCourseIds = [],
  } = input;
  
  // 1. Find student
  const student = await Student.findById(studentId);
  
  if (!student) {
    throw new Error("Student not found");
  }
  
  // 2. Validate level progression
  if (newLevel !== student.currentLevel + 100) {
    throw new Error("Invalid level progression");
  }
  
  // 3. Find active session
  const activeSession = await AcademicSession.findOne({
    isActive: true,
  });
  
  if (!activeSession) {
    throw new Error("No active academic session found");
  }
  
  // 4. Find courses for new level
  const levelCourses = await Course.find({
    level: newLevel,
  });
  
  // 5. Merge level courses + carryovers
  const allCourseIds = [
    ...levelCourses.map((course) =>
    course._id.toString()
    ),
    ...carryOverCourseIds,
  ];
  
  // 6. Remove duplicates
  const uniqueCourseIds = [...new Set(allCourseIds)];
  
  // 7. Update student level
  student.currentLevel = newLevel;
  await student.save();
  
  // 8. Create enrollments
  for (const courseId of uniqueCourseIds) {
    try {
      await createCourseEnrollment({
        studentId: student._id.toString(),
        courseId,
        sessionId: activeSession._id.toString(),
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
  
  return student;
}
