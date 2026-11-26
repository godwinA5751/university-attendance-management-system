import mongoose from "mongoose";
import type { CreateStudentInput } from "../types/student.types.js";

import { User } from "../models/User.js";
import { Student } from "../models/Student.js";
import { Curriculum } from "../models/Curriculum.js";
import { AcademicSession } from "../models/AcademicSession.js";

import {
  enrollStudentIntoLevelCourses,
  syncStudentEnrollmentsAfterAdminUpdate,
} from "./enrollmentSyncService.js";

import { Attendance } from "../models/Attendance.js";
import { CourseEnrollment } from "../models/CourseEnrollment.js";

const VALID_LEVELS = [100, 200, 300, 400, 500, 600];

const validateStudentInput = (
  data: Partial<CreateStudentInput>,
  isCreate = false
) => {
  const requiredFields = [
    "firstName",
    "lastName",
    "matricNumber",
    "department",
    "faculty",
    "currentLevel",
    "admissionYear",
    "curriculumId",
  ] as const;

  if (isCreate) {
    for (const field of requiredFields) {
      if (data[field] === undefined || data[field] === null || data[field] === "") {
        throw new Error(`${field} is required`);
      }
    }
  }

  const stringFields = [
    "firstName",
    "middleName",
    "lastName",
    "matricNumber",
    "department",
    "faculty",
  ] as const;

  for (const field of stringFields) {
    const value = data[field];

    if (value !== undefined && typeof value !== "string") {
      throw new Error(`${field} must be a string`);
    }

    if (
      field !== "middleName" &&
      value !== undefined &&
      !value.trim()
    ) {
      throw new Error(`${field} cannot be empty`);
    }
  }

  if (
    data.currentLevel !== undefined &&
    (!Number.isInteger(data.currentLevel) ||
      !VALID_LEVELS.includes(data.currentLevel))
  ) {
    throw new Error("Invalid student level");
  }

  if (
    data.admissionYear !== undefined &&
    (!Number.isInteger(data.admissionYear) ||
      data.admissionYear < 2000)
  ) {
    throw new Error("Invalid admission year");
  }

  if (
    data.curriculumId !== undefined &&
    !mongoose.Types.ObjectId.isValid(data.curriculumId)
  ) {
    throw new Error("Invalid curriculum ID");
  }

  if (data.carryOverCourseIds !== undefined) {
    if (!Array.isArray(data.carryOverCourseIds)) {
      throw new Error("Carryover course IDs must be an array");
    }

    if (
      data.carryOverCourseIds.some(
        (id) =>
          typeof id !== "string" ||
          !mongoose.Types.ObjectId.isValid(id)
      )
    ) {
      throw new Error("One or more carryover course IDs are invalid");
    }

    if (
      new Set(data.carryOverCourseIds).size !==
      data.carryOverCourseIds.length
    ) {
      throw new Error("Duplicate carryover course IDs are not allowed");
    }
  }
};

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

  validateStudentInput(data, true);

  const existingStudent = await Student.findOne({
    matricNumber,
  });

  if (existingStudent) {
    throw new Error("Matric number already exists");
  }

  const curriculum = await Curriculum.findById(
    curriculumId
  );

  if (!curriculum) {
    throw new Error("Curriculum not found");
  }

  const defaultPassword = process.env.DEFAULT_PASSWORD;

  if (!defaultPassword) {
    throw new Error("DEFAULT_PASSWORD is not configured");
  }

  const mongoSession = await mongoose.startSession();

  try {
    const result = await mongoSession.withTransaction(
      async () => {
        const academicSession = await AcademicSession.findOne({
          isActive: true,
        }).session(mongoSession);

        if (!academicSession) {
          throw new Error("No active academic session found");
        }
        const user = new User({
          firstName,
          ...(middleName !== undefined ? { middleName } : {}),
          lastName,
          password: defaultPassword,
          role: "student",
          mustChangePassword: true,
        });

        await user.save({ session: mongoSession });

        const student = new Student({
          userId: user._id,
          matricNumber,
          department,
          faculty,
          currentLevel,
          admissionYear,
          curriculumId,
        });

        await student.save({ session: mongoSession });

        await enrollStudentIntoLevelCourses({
          studentId: student._id.toString(),
          level: currentLevel,
          curriculumId,
          academicSessionId: academicSession._id.toString(),
          carryOverCourseIds,
          maxCarryOverLevel: currentLevel - 100,
          requirePreviousEnrollment: false,
          session: mongoSession,
        });

        return { user, student };
      }
    );

    if (!result) {
      throw new Error("Student creation transaction failed");
    }

    return result;
  } finally {
    await mongoSession.endSession();
  }
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
  const filter: Record<string, any> = {};

  if (level !== undefined) {
    filter.currentLevel = level;
  }

  if (curriculumId) {
    filter.curriculumId = curriculumId;
  }

  const keyword = search.trim();

  if (keyword) {
    const escapedKeyword = keyword.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

    const regex = new RegExp(escapedKeyword, "i");

    const matchingUsers = await User.find({
      $or: [
        { firstName: regex },
        { middleName: regex },
        { lastName: regex },
      ],
    }).select("_id");

    filter.$or = [
      { matricNumber: regex },
      { userId: { $in: matchingUsers.map((user) => user._id) } },
    ];
  }

  const [students, total] = await Promise.all([
    Student.find(filter)
      .populate({
        path: "userId",
        select: "firstName middleName lastName",
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),

    Student.countDocuments(filter),
  ]);

  return {
    data: students.map((student: any) => ({
      _id: student._id,
      firstName: student.userId.firstName,
      middleName: student.userId.middleName,
      lastName: student.userId.lastName,
      matricNumber: student.matricNumber,
      department: student.department,
      faculty: student.faculty,
      currentLevel: student.currentLevel,
      admissionYear: student.admissionYear,
      curriculumId: student.curriculumId,
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
  validateStudentInput(data);

  const mongoSession = await mongoose.startSession();

  try {
    const result = await mongoSession.withTransaction(async () => {
      const student = await Student.findById(studentId)
        .session(mongoSession);

      if (!student) {
        throw new Error("Student not found");
      }

      const previousLevel = student.currentLevel;
      const newLevel = data.currentLevel ?? previousLevel;
      const levelChanged = newLevel !== previousLevel;

      // Validate curriculum changes.
      if (
        data.curriculumId !== undefined &&
        data.curriculumId !== student.curriculumId.toString()
      ) {
        const curriculum = await Curriculum.findById(
          data.curriculumId
        ).session(mongoSession);

        if (!curriculum) {
          throw new Error("Curriculum not found");
        }

        const existingEnrollment = await CourseEnrollment.exists({
          studentId: student._id,
        }).session(mongoSession);

        if (existingEnrollment) {
          throw new Error(
            "Cannot change a student's curriculum while course enrollments exist."
          );
        }

        student.curriculumId = curriculum._id;
      }

      // Update User.
      const user = await User.findById(student.userId)
        .session(mongoSession);

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

      await user.save({ session: mongoSession });

      // Update Student.
      if (data.matricNumber !== undefined) {
        student.matricNumber = data.matricNumber;
      }

      if (data.department !== undefined) {
        student.department = data.department;
      }

      if (data.faculty !== undefined) {
        student.faculty = data.faculty;
      }

      student.currentLevel = newLevel;

      if (data.admissionYear !== undefined) {
        student.admissionYear = data.admissionYear;
      }

      await student.save({ session: mongoSession });

      // Synchronize enrollments when the level changes
      // or when carryover courses are explicitly supplied.
      if (
        levelChanged ||
        data.carryOverCourseIds !== undefined
      ) {
        const academicSession = await AcademicSession.findOne({
          isActive: true,
        }).session(mongoSession);

        if (!academicSession) {
          throw new Error("No active academic session found");
        }

        await syncStudentEnrollmentsAfterAdminUpdate({
          studentId: student._id.toString(),
          level: newLevel,
          curriculumId: student.curriculumId.toString(),
          academicSessionId: academicSession._id.toString(),
          ...(data.carryOverCourseIds !== undefined
            ? { carryOverCourseIds: data.carryOverCourseIds }
            : {}),
          levelChanged,
          session: mongoSession,
        });
      }

      return student._id;
    });

    if (!result) {
      throw new Error("Student update transaction failed");
    }

    const updatedStudent = await Student.findById(result)
      .populate({
        path: "userId",
        select: "firstName middleName lastName",
      })
      .populate("curriculumId");

    if (!updatedStudent) {
      throw new Error("Student not found after update");
    }

    return updatedStudent;
  } finally {
    await mongoSession.endSession();
  }
};

export const deleteStudent = async (
  studentId: string
) => {
  const mongoSession = await mongoose.startSession();

  try {
    const result = await mongoSession.withTransaction(async () => {
      const student = await Student.findById(studentId)
        .session(mongoSession);

      if (!student) {
        throw new Error("Student not found");
      }

      const enrollments = await CourseEnrollment.find({
        studentId: student._id,
      })
        .select("_id")
        .session(mongoSession);

      const enrollmentIds = enrollments.map(
        (enrollment) => enrollment._id
      );

      const attendanceExists = await Attendance.exists({
        enrollmentId: { $in: enrollmentIds },
      }).session(mongoSession);

      if (attendanceExists) {
        throw new Error(
          "Cannot delete a student with attendance records."
        );
      }

      await CourseEnrollment.deleteMany(
        { studentId: student._id },
        { session: mongoSession }
      );

      await User.findByIdAndDelete(
        student.userId,
        { session: mongoSession }
      );

      await student.deleteOne({ session: mongoSession });

      return { message: "Student deleted successfully" };
    });

    if (!result) {
      throw new Error("Student deletion transaction failed");
    }

    return result;
  } finally {
    await mongoSession.endSession();
  }
};