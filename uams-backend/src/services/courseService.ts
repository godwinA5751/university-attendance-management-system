import type { CreateCourseInput, UpdateCourseInput } from "../types/course.types.js";
import { AcademicSession } from "../models/AcademicSession.js";
import { Course } from "../models/Course.js";
import { CourseAssignment } from "../models/CourseAssignment.js";
// import type { QueryFilter } from "../types/query.types.js";

export const getAllCourses = async (
  query: any
) => {
  // const courses = await Course.find().populate("academicSessionId");

  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  
  const skip = (page - 1) * limit;
  
  const filter: any = {};
  if (query.level) {
    filter.level = Number(query.level);
  }
  
  if (query.semester) {
    filter.semester = query.semester;
  }
  
  if (query.academicSessionId) {
    filter.academicSessionId = query.academicSessionId;
  }
  
  if (query.search) {
    filter.$or = [
      {
        courseCode: {
          $regex: query.search,
          $options: "i",
        },
      },
      {
        courseTitle: {
          $regex: query.search,
          $options: "i",
        },
      },
    ];
  }
  const total = await Course.countDocuments(filter);
  
  const courses = await Course.find(filter)
    .populate("academicSessionId")
    .sort({
      level: 1,
      courseCode: 1,
    })
    .skip(skip)
    .limit(limit);
  return {
    courses,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getCourse = async (courseId: string) => {
  const course = await Course.findById(courseId).populate("academicSessionId");

  if (!course) {
    throw new Error("Course not found");
  }

  return course;
};

export const createCourse = async (input: CreateCourseInput) => {
  const {
    courseCode,
    courseTitle,
    unit,
    semester,
    level,
    academicSessionId,
  } = input;
  
  const academicSession = await AcademicSession.findById(
    academicSessionId
  );
  
  if (!academicSession) {
    throw new Error("Academic session not found");
  }
  
  const existingCourse = await Course.findOne({
    courseCode,
    academicSessionId,
  });
  
  if (existingCourse) {
    throw new Error(
      "Course already exists for this academic session"
    );
  }
  
  const course = new Course({
    courseCode,
    courseTitle,
    unit,
    semester,
    level,
    academicSessionId,
  });
  
  await course.save();
  
  return course;
};

export const updateCourse = async (
  input: UpdateCourseInput
) => {
  const {
    courseId,
    courseCode,
    courseTitle,
    unit,
    semester,
    level,
    academicSessionId,
  } = input;

  const course = await Course.findById(courseId);

  if (!course) {
    throw new Error("Course not found");
  }

  const academicSession = await AcademicSession.findById(
    academicSessionId
  );

  if (!academicSession) {
    throw new Error("Academic session not found");
  }

  const existingCourse = await Course.findOne({
    courseCode,
    academicSessionId,
    _id: { $ne: courseId },
  });

  if (existingCourse) {
    throw new Error(
      "Course already exists for this academic session"
    );
  }

  course.courseCode = courseCode;
  course.courseTitle = courseTitle;
  course.unit = unit;
  course.semester = semester;
  course.level = level;
  course.academicSessionId = academicSessionId as any;

  await course.save();

  return course;
};

export const deleteCourse = async (
  courseId: string
) => {
  const course = await Course.findById(courseId);

  if (!course) {
    throw new Error("Course not found");
  }

  await CourseAssignment.deleteMany({
      courseId,
  });
  
  await course.deleteOne();

  return;
};