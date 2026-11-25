import mongoose from "mongoose";
import type { CreateLecturerInput, UpdateLecturerInput } from "../types/lecturer.types.js";
import { User } from "../models/User.js";
import { Lecturer } from "../models/Lecturer.js";
import { CourseAssignment } from "../models/CourseAssignment.js";
// import { Course } from "../models/Course.js";
import { AcademicSession } from "../models/AcademicSession.js";

const validateLecturerInput = (
  data: CreateLecturerInput | UpdateLecturerInput,
  isCreate = false
) => {
  const fields = [
    "firstName",
    "middleName",
    "lastName",
    "staffNumber",
    "department",
    "faculty",
  ] as const;

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Invalid lecturer input");
  }

  const input = data as Record<string, unknown>;

  if (
    !isCreate &&
    !fields.some((field) => input[field] !== undefined)
  ) {
    throw new Error("At least one field must be provided for update");
  }

  for (const field of fields) {
    const value = input[field];

    if (isCreate && field !== "middleName" && value === undefined) {
      throw new Error(`${field} is required`);
    }

    if (value !== undefined) {
      if (typeof value !== "string" || !value.trim()) {
        throw new Error(`${field} must be a non-empty string`);
      }
    }

    if (!isCreate && field === "staffNumber" && value !== undefined) {
      throw new Error("Staff number cannot be updated");
    }
  }
};

export const createLecturer = async (data: CreateLecturerInput) => {
  const {
    firstName,
    middleName,
    lastName,
    staffNumber,
    department,
    faculty,
  } = data;

  validateLecturerInput(data, true);

  const existingLecturer = await Lecturer.findOne({ staffNumber });

  if (existingLecturer) {
    throw new Error("Staff number already exists");
  }

  const defaultPassword = process.env.DEFAULT_PASSWORD;

  if (!defaultPassword) {
    throw new Error("DEFAULT_PASSWORD is not configured");
  }

  const mongoSession = await mongoose.startSession();

  try {
    const result = await mongoSession.withTransaction(async () => {
      const user = new User({
        firstName,
        ...(middleName !== undefined ? { middleName } : {}),
        lastName,
        password: defaultPassword,
        role: "lecturer",
        mustChangePassword: true,
      });

      await user.save({ session: mongoSession });

      const lecturer = new Lecturer({
        userId: user._id,
        staffNumber,
        department,
        faculty,
      });

      await lecturer.save({ session: mongoSession });

      return {
        user,
        lecturer,
        lecturerName: `${user.firstName} ${user.lastName}`,
      };
    });

    if (!result) {
      throw new Error("Lecturer creation transaction failed");
    }

    return result;
  } finally {
    await mongoSession.endSession();
  }
};

export const getLecturerCourses = async (userId: string) => {
  const lecturer = await Lecturer.findOne({ userId });

  if (!lecturer) {
    throw new Error("Lecturer not found");
  }

  const activeSession = await AcademicSession.findOne({
    isActive: true,
  });

  if (!activeSession) {
    throw new Error("No active academic session found");
  }

  const assignments = await CourseAssignment.find({
    lecturerId: lecturer._id,
    academicSessionId: activeSession._id,
  }).populate("courseId");

  return assignments
    .filter((a: any) => a.courseId)
    .map((a: any) => a.courseId);
};

export const getLecturerProfile = async (
  userId: string
) => {
  const lecturer = await Lecturer.findOne({
    userId,
  }).populate("userId");

  if (!lecturer) {
    throw new Error("Lecturer not found");
  }

  const user = lecturer.userId as any;

  return {
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    staffNumber: lecturer.staffNumber,
    department: lecturer.department,
    faculty: lecturer.faculty,
  };
};

interface GetLecturersInput {
  page?: number;
  limit?: number;
  search?: string;
}

export const getAllLecturers = async ({
  page = 1,
  limit = 10,
  search = "",
}: GetLecturersInput) => {
  const keyword = search.trim();

  const lecturerFilter: Record<string, any> = {};

  if (keyword) {
    const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escapedKeyword, "i");

    const matchingUsers = await User.find({
      $or: [
        { firstName: regex },
        { middleName: regex },
        { lastName: regex },
      ],
    }).select("_id");

    lecturerFilter.$or = [
      { staffNumber: regex },
      { userId: { $in: matchingUsers.map((user) => user._id) } },
    ];
  }

  const [lecturers, total] = await Promise.all([
    Lecturer.find(lecturerFilter)
      .populate({
        path: "userId",
        select: "firstName middleName lastName",
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Lecturer.countDocuments(lecturerFilter),
  ]);

  return {
    data: lecturers.map((lecturer: any) => ({
      _id: lecturer._id,
      firstName: lecturer.userId.firstName,
      middleName: lecturer.userId.middleName,
      lastName: lecturer.userId.lastName,
      staffNumber: lecturer.staffNumber,
      department: lecturer.department,
      faculty: lecturer.faculty,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getLecturerById = async (
  id: string
) => {
  const lecturer = await Lecturer.findById(id)
    .populate({
      path: "userId",
      select: "firstName middleName lastName",
    });

  if (!lecturer) {
    throw new Error("Lecturer not found");
  }

  const user = lecturer.userId as any;

  return {
    _id: lecturer._id,
    firstName: user.firstName,
    middleName: user.middleName,
    lastName: user.lastName,
    staffNumber: lecturer.staffNumber,
    department: lecturer.department,
    faculty: lecturer.faculty,
  };
};

export const updateLecturer = async (
  id: string,
  data: UpdateLecturerInput
) => {
  validateLecturerInput(data);

  const mongoSession = await mongoose.startSession();

  try {
    const result = await mongoSession.withTransaction(async () => {
      const lecturer = await Lecturer.findById(id).session(mongoSession);

      if (!lecturer) {
        throw new Error("Lecturer not found");
      }

      const user = await User.findById(lecturer.userId)
        .session(mongoSession);

      if (!user) {
        throw new Error("User not found");
      }

      // Update User fields.
      if (data.firstName !== undefined) {
        user.firstName = data.firstName;
      }

      if (data.middleName !== undefined) {
        user.middleName = data.middleName;
      }

      if (data.lastName !== undefined) {
        user.lastName = data.lastName;
      }

      // Update Lecturer fields.
      if (data.department !== undefined) {
        lecturer.department = data.department;
      }

      if (data.faculty !== undefined) {
        lecturer.faculty = data.faculty;
      }

      await user.save({ session: mongoSession });
      await lecturer.save({ session: mongoSession });

      return lecturer._id;
    });

    if (!result) {
      throw new Error("Lecturer update transaction failed");
    }

    const updatedLecturer = await Lecturer.findById(result)
      .populate({
        path: "userId",
        select: "firstName middleName lastName",
      });

    if (!updatedLecturer) {
      throw new Error("Lecturer not found after update");
    }

    return updatedLecturer;
  } finally {
    await mongoSession.endSession();
  }
};

export const deleteLecturer = async (
  id: string
) => {
  const mongoSession = await mongoose.startSession();

  try {
    const result = await mongoSession.withTransaction(async () => {
      const lecturer = await Lecturer.findById(id)
        .session(mongoSession);

      if (!lecturer) {
        throw new Error("Lecturer not found");
      }

      const assignmentExists = await CourseAssignment.exists({
        lecturerId: lecturer._id,
      }).session(mongoSession);

      if (assignmentExists) {
        throw new Error(
          "Cannot delete a lecturer with course assignments."
        );
      }

      await User.findByIdAndDelete(
        lecturer.userId,
        { session: mongoSession }
      );

      await lecturer.deleteOne({ session: mongoSession });

      return {
        message: "Lecturer deleted successfully",
      };
    });

    if (!result) {
      throw new Error("Lecturer deletion transaction failed");
    }

    return result;
  } finally {
    await mongoSession.endSession();
  }
};