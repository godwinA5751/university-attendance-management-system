import type { CreateLecturerInput } from "../types/lecturer.types.js";
import { User } from "../models/User.js";
import { Lecturer } from "../models/Lecturer.js";
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

  return {user, lecturer}
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