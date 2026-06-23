import type { CreateStudentInput } from "../types/student.types.js";
import { User } from "../models/User.js";
import { Student } from "../models/Student.js";
import { AcademicSession } from "../models/AcademicSession.js";
import { Course } from "../models/Course.js";
import { CourseEnrollment } from "../models/CourseEnrollment.js";

export const createStudent = async (data: CreateStudentInput) => {
  const { firstName, lastName, matricNumber, department, faculty, currentLevel, admissionYear, carryOverCourseIds = [] } = data;
  
  const activeSession = await AcademicSession.findOne({
    isActive: true,
  });
  
  if (!activeSession) {
    throw new Error("No active academic session found");
  }

  const existingStudent = await Student.findOne({ matricNumber });
  if (existingStudent) {
    throw new Error("Matric number already exists");
  }

  if (!process.env.DEFAULT_PASSWORD) {
    throw new Error("DEFAULT_PASSWORD is not configured");
  }

  const user = new User(
    {
      firstName,
      lastName,
      password: process.env.DEFAULT_PASSWORD,
      role: "student",
      mustChangePassword: true
    });

  await user.save();

  const levelCourses = await Course.find({
    level: currentLevel,
  });
  
  const allCourseIds = [
    ...levelCourses.map(course =>
      course._id.toString()
    ),
    ...carryOverCourseIds,
  ];
  
  const uniqueCourseIds = [...new Set(allCourseIds)];
  
  const student = new Student({
    userId: user._id,
    matricNumber,
    department,
    faculty,
    currentLevel,
    admissionYear,
  });
  
  await student.save();
  
  if (uniqueCourseIds.length > 0) {
    await CourseEnrollment.insertMany(
      uniqueCourseIds.map((courseId) => ({
        studentId: student._id,
        courseId,
        sessionId: activeSession._id,
        status: "active",
      }))
    );
  }

  return {user, student}
}

export const getStudentProfile = async (
  userId: string
) => {
  const student = await Student.findOne({
    userId,
  }).populate("userId");

  if (!student) {
    throw new Error("Student not found");
  }

  const user = student.userId as any;

  return {
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    matricNumber: student.matricNumber,
    department: student.department,
    faculty: student.faculty,
    currentLevel: student.currentLevel,
    admissionYear: student.admissionYear,
  };
};