import mongoose from "mongoose";
import type { CreateCourseInput, UpdateCourseInput } from "../types/course.types.js";
import { Curriculum } from "../models/Curriculum.js";
import { Course } from "../models/Course.js";
import { CourseAssignment } from "../models/CourseAssignment.js";
import { CourseEnrollment } from "../models/CourseEnrollment.js";
import { Attendance } from "../models/Attendance.js";
import { AcademicSession } from "../models/AcademicSession.js";
import { enrollExistingStudentsIntoCourse } from "./enrollmentSyncService.js";

export const getAllCourses = async (
  query: any
) => {
  // const courses = await Course.find().populate("academicSessionId");

  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  
  const skip = (page - 1) * limit;
  
  const filter: any = {};
  
  const level = query.level
    ? Number(query.level)
    : undefined;
  
  const maxLevel = query.maxLevel
    ? Number(query.maxLevel)
    : undefined;
  
  if (level !== undefined) {
    filter.level = level;
  } else if (maxLevel !== undefined) {
    filter.level = {
      $lt: maxLevel,
    };
  }
  
  if (query.semester) {
    filter.semester = query.semester;
  }
  
  if (query.curriculumId) {
    filter.curriculumId = query.curriculumId;
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
    .populate("curriculumId")
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
  const course = await Course.findById(courseId).populate("curriculumId");

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
    curriculumId,
  } = input;

  const mongoSession = await mongoose.startSession();

  try {
    const result = await mongoSession.withTransaction(async () => {
      const curriculum = await Curriculum.findById(
        curriculumId
      ).session(mongoSession);

      if (!curriculum) {
        throw new Error("Curriculum not found");
      }

      const academicSession = await AcademicSession.findOne({
        isActive: true,
      }).session(mongoSession);

      if (!academicSession) {
        throw new Error("No active academic session found");
      }

      const existingCourse = await Course.findOne({
        courseCode,
        curriculumId,
      }).session(mongoSession);

      if (existingCourse) {
        throw new Error(
          "Course already exists for this curriculum"
        );
      }

      const course = new Course({
        courseCode,
        courseTitle,
        unit,
        semester,
        level,
        curriculumId,
      });

      await course.save({ session: mongoSession });

      await enrollExistingStudentsIntoCourse({
        courseId: course._id.toString(),
        level: course.level,
        curriculumId: course.curriculumId.toString(),
        academicSessionId: academicSession._id.toString(),
        session: mongoSession,
      });

      return course;
    });

    if (!result) {
      throw new Error("Course creation transaction failed");
    }

    return result;
  } finally {
    await mongoSession.endSession();
  }
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
    curriculumId,
  } = input;

  const course = await Course.findById(courseId);

  if (!course) {
    throw new Error("Course not found");
  }

  const curriculum = await Curriculum.findById(
    curriculumId
  );

  if (!curriculum) {
    throw new Error("Curriculum not found");
  }

  const existingCourse = await Course.findOne({
    courseCode,
    curriculumId,
    _id: { $ne: courseId },
  });

  if (existingCourse) {
    throw new Error(
      "Course already exists for this curriculum"
    );
  }

  course.courseCode = courseCode;
  course.courseTitle = courseTitle;
  course.unit = unit;
  course.semester = semester;
  course.level = level;
  course.curriculumId = curriculumId as any;

  await course.save();

  return course;
};

export const deleteCourse = async (courseId: string) => {
  const mongoSession = await mongoose.startSession();

  try {
    const result = await mongoSession.withTransaction(async () => {
      const course = await Course.findById(courseId).session(mongoSession);

      if (!course) {
        throw new Error("Course not found");
      }

      const enrollments = await CourseEnrollment.find({
        courseId,
      })
        .select("_id")
        .session(mongoSession);

      const enrollmentIds = enrollments.map(
        (enrollment) => enrollment._id
      );

      await Attendance.deleteMany(
        {
          enrollmentId: { $in: enrollmentIds },
        },
        { session: mongoSession }
      );

      await CourseEnrollment.deleteMany(
        { courseId },
        { session: mongoSession }
      );

      await CourseAssignment.deleteMany(
        { courseId },
        { session: mongoSession }
      );

      await course.deleteOne({ session: mongoSession });

      return { message: "Course deleted successfully" };
    });

    if (!result) {
      throw new Error("Course deletion transaction failed");
    }

    return result;
  } finally {
    await mongoSession.endSession();
  }
};