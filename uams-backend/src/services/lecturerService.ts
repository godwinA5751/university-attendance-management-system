import type { CreateLecturerInput, UpdateLecturerInput } from "../types/lecturer.types.js";
import { User } from "../models/User.js";
import { Lecturer } from "../models/Lecturer.js";
import { CourseAssignment } from "../models/CourseAssignment.js";
import { Course } from "../models/Course.js";


export const createLecturer = async (data: CreateLecturerInput) => {
  const { firstName, lastName, staffNumber, department, faculty } = data;

  const existingLecturer = await Lecturer.findOne({ staffNumber });
  if (existingLecturer) {
    throw new Error("Staff number already exists");
  }

  if (!process.env.DEFAULT_PASSWORD) {
    throw new Error("DEFAULT_PASSWORD is not configured");
  }

  const user = new User(
    {
      firstName,
      lastName,
      password: process.env.DEFAULT_PASSWORD,
      role: "lecturer",
      mustChangePassword: true
    });

  await user.save();

  const lecturer = new Lecturer({
    userId: user._id,
    staffNumber,
    department,
    faculty
  })

  await lecturer.save();

  return {
      user,
      lecturer,
      lecturerName: `${user.firstName} ${user.lastName}`,
    };
}

export const getLecturerCourses = async (lecturerId: string) => {
  const courses = await Course.find({
    lecturerIds: lecturerId,
  });

  return courses;
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
}: GetLecturersInput)=> {
  let lecturers = await Lecturer.find().populate({
    path: "userId",
    select: "firstName lastName",
  })
    .sort({ createdAt: -1 });

  if (search) {
      const keyword = search.toLowerCase();
  
      lecturers = lecturers.filter((lecturer: any) => {
        const user = lecturer.userId;
  
        return (
          `${user.firstName} ${user.lastName}`
            .toLowerCase()
            .includes(keyword) ||
          lecturer.staffNumber
            .toLowerCase()
            .includes(keyword)
        );
      });
    }
  
    const total = lecturers.length;
  
    const start = (page - 1) * limit;
    const end = start + limit;
  
    const paginatedLecturers = lecturers.slice(start, end);
  return {
    data: paginatedLecturers.map((lecturer: any) => ({
      _id: lecturer._id,
      firstName: lecturer.userId.firstName,
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
      select: "firstName lastName",
    });

  if (!lecturer) {
    throw new Error("Lecturer not found");
  }

  const user = lecturer.userId as any;

  return {
    _id: lecturer._id,
    firstName: user.firstName,
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
  const lecturer = await Lecturer.findById(id);

  if (!lecturer) {
    throw new Error("Lecturer not found");
  }

  const user = await User.findById(lecturer.userId);

  if (!user) {
    throw new Error("User not found");
  }

  user.firstName = data.firstName;
  user.lastName = data.lastName;

  await user.save();

  lecturer.department = data.department;
  lecturer.faculty = data.faculty;

  await lecturer.save();

  return {
    user,
    lecturer,
    lecturerName: `${user.firstName} ${user.lastName}`,
  };
};

export const deleteLecturer = async (
  id: string
) => {
  const lecturer = await Lecturer.findById(id);

  if (!lecturer) {
    throw new Error("Lecturer not found");
  }

  await CourseAssignment.deleteMany({
    lecturerId: lecturer._id,
  });

  await User.findByIdAndDelete(
    lecturer.userId
  );

  await Lecturer.findByIdAndDelete(id);

  return {
    message: "Lecturer deleted successfully",
  };
};