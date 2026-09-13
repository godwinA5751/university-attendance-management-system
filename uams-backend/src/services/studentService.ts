import type { CreateStudentInput } from "../types/student.types.js";

import { User } from "../models/User.js";
import { Student } from "../models/Student.js";
import { Curriculum } from "../models/Curriculum.js";

import {
  enrollStudentIntoLevelCourses,
} from "./enrollmentSyncService.js";

import { Attendance } from "../models/Attendance.js";
import { CourseEnrollment } from "../models/CourseEnrollment.js";

export const createStudent = async (
  data: CreateStudentInput
) => {
  const {
    firstName,
    middleName,
    lastName,
    matricNumber,
    department,
    faculty,
    currentLevel,
    admissionYear,
    curriculumId,
    carryOverCourseIds = [],
  } = data;

  const existingStudent =
    await Student.findOne({
      matricNumber,
    });

  if (existingStudent) {
    throw new Error(
      "Matric number already exists"
    );
  }

  const curriculum =
    await Curriculum.findById(
      curriculumId
    );

  if (!curriculum) {
    throw new Error(
      "Curriculum not found"
    );
  }

  if (!process.env.DEFAULT_PASSWORD) {
    throw new Error(
      "DEFAULT_PASSWORD is not configured"
    );
  }

  const user = new User({
    firstName,
    middleName,
    lastName,
    password: process.env.DEFAULT_PASSWORD,
    role: "student",
    mustChangePassword: true,
  });

  await user.save();

  const student = new Student({
    userId: user._id,
    matricNumber,
    department,
    faculty,
    currentLevel,
    admissionYear,
    curriculumId,
  });

  await student.save();

  await enrollStudentIntoLevelCourses({
    studentId: student._id.toString(),
    level: currentLevel,
    curriculumId,
    carryOverCourseIds,
  });

  return {
    user,
    student,
  };
};

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
    middleName: user.middleName,
    lastName: user.lastName,
    role: user.role,
    matricNumber: student.matricNumber,
    department: student.department,
    faculty: student.faculty,
    currentLevel: student.currentLevel,
    admissionYear: student.admissionYear,
    curriculumId: student.curriculumId,
  };
};

type GetStudentsInput = {
  page?: number;
  limit?: number;
  search?: string;
  level?: number;
  curriculumId?: string;
};

export const getStudents = async ({
  page = 1,
  limit = 10,
  search = "",
  level,
  curriculumId,
}: GetStudentsInput) => {
  const filter: any = {};

  if (level) {
    filter.currentLevel = level;
  }

  if (curriculumId) {
    filter.curriculumId = curriculumId;
  }

  let students = await Student.find(filter)
    .populate({
      path: "userId",
      select: "firstName middleName lastName",
    })
    .sort({
      createdAt: -1,
    });

  if (search) {
    const keyword =
      search.toLowerCase();

    students = students.filter(
      (student: any) => {
        const user = student.userId;

        return (
          `${user.firstName} ${user.middleName || ''} ${user.lastName}`
            .toLowerCase()
            .includes(keyword) ||
          student.matricNumber
            .toLowerCase()
            .includes(keyword)
        );
      }
    );
  }

  if (curriculumId) {
    const studentIds =
      students.map(
        (student) => student._id
      );

    const enrollments =
      await CourseEnrollment.find({
        studentId: {
          $in: studentIds,
        }
      }).distinct("studentId");

    students = students.filter(
      (student) =>
        enrollments.some(
          (id) =>
            id.toString() ===
            student._id.toString()
        )
    );
  }

  const total =
    students.length;

  const start =
    (page - 1) * limit;

  const end =
    start + limit;

  const paginatedStudents =
    students.slice(
      start,
      end
    );

  return {
    data: paginatedStudents.map(
      (student: any) => ({
        _id: student._id,
        firstName:
          student.userId.firstName,
        middleName:
          student.userId.middleName,
        lastName:
          student.userId.lastName,
        matricNumber:
          student.matricNumber,
        department:
          student.department,
        faculty:
          student.faculty,
        currentLevel:
          student.currentLevel,
        admissionYear:
          student.admissionYear,
        curriculumId:
          student.curriculumId,
      })
    ),

    pagination: {
      page,
      limit,
      total,
      totalPages:
        Math.ceil(total / limit),
    },
  };
};

export const getStudentById = async (
  studentId: string
) => {
  const student =
    await Student.findById(
      studentId
    )
      .populate({
        path: "userId",
        select: "firstName middleName lastName",
      })
      .populate("curriculumId");

  if (!student) {
    throw new Error(
      "Student not found"
    );
  }

  return student;
};

export const updateStudent = async (
  studentId: string,
  data: Partial<CreateStudentInput>
) => {
  const student = await Student.findById(
   studentId
  );

  if (!student) {
    throw new Error(
    "Student not found"
    );
  }

  if (data.curriculumId) {
    const curriculum =
      await Curriculum.findById(
      data.curriculumId
    );

    if (!curriculum) {
      throw new Error(
        "Curriculum not found"
      );
    }

  }

  // Update User fields
  const user = await User.findById(
    student.userId
  );

  if (!user) {
    throw new Error("User not found");
  }

  if (data.firstName !== undefined) {
    user.firstName = data.firstName;
  }

  if (data.middleName !== undefined) {
    user.middleName = data.middleName;
  }

  if (data.lastName !== undefined) {
    user.lastName = data.lastName;
  }

  await user.save();

  // Update Student fields
  if (data.matricNumber !== undefined) {
    student.matricNumber = data.matricNumber;
  }

  if (data.department !== undefined) {
    student.department = data.department;
  }

  if (data.faculty !== undefined) {
    student.faculty = data.faculty;
  }

  if (data.currentLevel !== undefined) {
    student.currentLevel = data.currentLevel;
  }

  if (data.admissionYear !== undefined) {
    student.admissionYear = data.admissionYear;
  }

  if (data.curriculumId !== undefined) {
    student.curriculumId =
    data.curriculumId as any;
  }

  await student.save();

  return student
    .populate({
      path: "userId",
      select:
      "firstName middleName lastName",
    })
      .then((result) =>
      result.populate("curriculumId")
    );
};


export const deleteStudent = async (
  studentId: string
) => {
  const student =
    await Student.findById(
      studentId
    );

  if (!student) {
    throw new Error(
      "Student not found"
    );
  }

  const enrollments =
    await CourseEnrollment.find({
      studentId: student._id,
    });

  const enrollmentIds =
    enrollments.map(
      (enrollment) =>
        enrollment._id
    );

  await Attendance.deleteMany({
    enrollmentId: {
      $in: enrollmentIds,
    },
  });

  await CourseEnrollment.deleteMany({
    studentId: student._id,
  });

  await User.findByIdAndDelete(
    student.userId
  );

  await student.deleteOne();
};