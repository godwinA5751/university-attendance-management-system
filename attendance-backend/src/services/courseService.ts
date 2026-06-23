import mongoose from "mongoose";
import type { CreateCourseInput, AssignLecturersInput, ReplaceLecturersInput } from "../types/course.types.js";
import { Lecturer } from "../models/Lecturer.js";
import { Course } from "../models/Course.js";

export const getAllCoursesWithLecturers = async () => {
  const courses = await Course.find().populate("lecturerIds");

  return courses;
};

export const getCourseWithLecturers = async (courseId: string) => {
  const course = await Course.findById(courseId).populate("lecturerIds");

  if (!course) {
    throw new Error("Course not found");
  }

  return course;
};

export const createCourse = async (input: CreateCourseInput) => {
  const { courseCode, courseTitle, unit, semester, level, lecturerIds } = input;

  const existingCourse = await Course.findOne({ courseCode });
  if (existingCourse) throw new Error("Course already exists");

  let finalLecturerIds: string[] = [];

  if (lecturerIds && lecturerIds.length > 0) {
    const lecturers = await Lecturer.find({
      _id: { $in: lecturerIds }
    });

    if (lecturers.length !== lecturerIds.length) {
      throw new Error("One or more lecturers do not exist");
    }

    finalLecturerIds = lecturerIds;
  }

  const course = new Course({
    courseCode,
    courseTitle,
    unit,
    semester,
    level,
    lecturerIds: finalLecturerIds
  });

  await course.save();
  return course;
};

export const assignLecturersToCourse = async (input: AssignLecturersInput) => {
  const { courseId, lecturerIds } = input;

  const course = await Course.findById(courseId);
  if (!course) throw new Error("Course not found");

  const lecturers = await Lecturer.find({
    _id: { $in: lecturerIds },
  });

  if (lecturers.length !== lecturerIds.length) {
    throw new Error("One or more lecturers not found");
  }

  // 1. remove duplicates from input
  const uniqueLecturerIds = [...new Set(lecturerIds)];

  // 2. convert existing + new into one set
  const mergedLecturers = new Set([
    ...course.lecturerIds.map((id) => id.toString()),
    ...uniqueLecturerIds,
  ]);

  // 3. update course
  course.lecturerIds = Array.from(mergedLecturers) as any;

  await course.save();

  return course;
};

export const replaceLecturersForCourse = async (
  input: ReplaceLecturersInput
) => {
  const { courseId, lecturerIds } = input;

  // 1. Check course exists
  const course = await Course.findById(courseId);
  if (!course) throw new Error("Course not found");

  // 2. Validate lecturers exist
  const lecturers = await Lecturer.find({
    _id: { $in: lecturerIds },
  });

  if (lecturers.length !== lecturerIds.length) {
    throw new Error("One or more lecturers not found");
  }

  // 3. Remove duplicates from input
  const uniqueLecturerIds = [...new Set(lecturerIds)];

  // 4. Replace completely (NO merging)
  course.lecturerIds = uniqueLecturerIds as any;

  await course.save();

  return course;
};

export const removeLecturerFromCourse = async (
  courseId: string,
  lecturerId: string
) => {
  // 1. Find course
  const course = await Course.findById(courseId);
  if (!course) throw new Error("Course not found");

  // 2. Check if lecturer exists in course
  const exists = course.lecturerIds.some(
    (id) => id.toString() === lecturerId
  );

  if (!exists) {
    throw new Error("Lecturer not assigned to this course");
  }

  // 3. Remove lecturer
  course.lecturerIds = course.lecturerIds.filter(
    (id) => id.toString() !== lecturerId
  );

  await course.save();

  return course;
};