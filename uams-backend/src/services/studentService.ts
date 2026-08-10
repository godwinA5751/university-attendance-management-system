import type { CreateStudentInput } from "../types/student.types.js";
import { User } from "../models/User.js";
import { Student } from "../models/Student.js";
import { AcademicSession } from "../models/AcademicSession.js";
import { enrollStudentIntoLevelCourses } from "./enrollmentSyncService.js";
import { Attendance } from "../models/Attendance.js";
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

  const student = new Student({
    userId: user._id,
    matricNumber,
    department,
    faculty,
    currentLevel,
    admissionYear,
  });
  
  await student.save();
  
  await enrollStudentIntoLevelCourses({
    studentId: student._id.toString(),
    level: currentLevel,
    academicSessionId: activeSession._id.toString(),
    carryOverCourseIds,
  });

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

type GetStudentsInput = {
  page?: number;
  limit?: number;
  search?: string;
  level?: number;
  academicSessionId?: string;
};

export const getStudents = async ({
  page = 1,
  limit = 10,
  search = "",
  level,
  academicSessionId,
}: GetStudentsInput) => {
  const filter: any = {};

  if (level) {
    filter.currentLevel = level;
  }

  let students = await Student.find(filter)
    .populate({
      path: "userId",
      select: "firstName lastName",
    })
    .sort({ createdAt: -1 });

  // Search
  if (search) {
    const keyword = search.toLowerCase();

    students = students.filter((student: any) => {
      const user = student.userId;

      return (
        `${user.firstName} ${user.lastName}`
          .toLowerCase()
          .includes(keyword) ||
        student.matricNumber
          .toLowerCase()
          .includes(keyword)
      );
    });
  }

  // Academic Session Filter
  if (academicSessionId) {
    const studentIds = students.map((student) => student._id);

    const enrollments =
      await CourseEnrollment.find({
        studentId: { $in: studentIds },
        academicSessionId,
      }).distinct("studentId");

    students = students.filter((student) =>
      enrollments.some(
        (id) => id.toString() === student._id.toString()
      )
    );
  }

  const total = students.length;

  const start = (page - 1) * limit;
  const end = start + limit;

  const paginatedStudents = students.slice(start, end);

  return {
    data: paginatedStudents.map((student: any) => ({
      _id: student._id,
      firstName: student.userId.firstName,
      lastName: student.userId.lastName,
      matricNumber: student.matricNumber,
      department: student.department,
      faculty: student.faculty,
      currentLevel: student.currentLevel,
      admissionYear: student.admissionYear,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getStudentById = async (
  studentId: string
) => {
  const student = await Student.findById(studentId)
    .populate({
      path: "userId",
      select: "firstName lastName",
    });

  if (!student) {
    throw new Error("Student not found");
  }

  return student;
};

export const updateStudent = async (
  studentId: string,
  data: Partial<CreateStudentInput>
) => {
  const student = await Student.findById(studentId);

  if (!student) {
    throw new Error("Student not found");
  }

  Object.assign(student, data);

  await student.save();

  return student.populate({
    path: "userId",
    select: "firstName lastName",
  });
};

export const deleteStudent = async (
  studentId: string
) => {
  const student = await Student.findById(studentId);

  if (!student) {
    throw new Error("Student not found");
  }

  const enrollments = await CourseEnrollment.find({
    studentId: student._id,
  });

  const enrollmentIds = enrollments.map(
    (e) => e._id
  );

  await Attendance.deleteMany({
    enrollmentId: {
      $in: enrollmentIds,
    },
  });

  await CourseEnrollment.deleteMany({
    studentId: student._id,
  });

  await User.findByIdAndDelete(student.userId);

  await student.deleteOne();
};