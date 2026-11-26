
import mongoose from "mongoose";
import { Student } from "../models/Student.js";
import { Course } from "../models/Course.js";
import { CourseEnrollment } from "../models/CourseEnrollment.js";
import { createCourseEnrollment } from "./courseEnrollmentService.js";

type EnrollStudentIntoLevelCoursesInput = {
  studentId: string;
  level: number;
  curriculumId: string;
  academicSessionId: string;
  carryOverCourseIds?: string[];
  maxCarryOverLevel?: number;
  requirePreviousEnrollment?: boolean;
  session?: mongoose.ClientSession;
};

type EnrollExistingStudentsIntoCourseInput = {
  courseId: string;
  level: number;
  curriculumId: string;
  academicSessionId: string;
  session?: mongoose.ClientSession;
};

type AdminEnrollmentCorrectionInput = {
  studentId: string;
  level: number;
  curriculumId: string;
  academicSessionId: string;
  carryOverCourseIds?: string[];
  levelChanged: boolean;
  session: mongoose.ClientSession;
};

const validateObjectIds = (ids: string[]) => {
  if (ids.some((id) => !mongoose.isValidObjectId(id))) {
    throw new Error("One or more course IDs are invalid.");
  }
};

const isDuplicateEnrollment = (error: unknown) =>
  error instanceof Error &&
  error.message ===
    "Student already enrolled in this course for this session";

export const syncStudentEnrollmentsAfterAdminUpdate = async ({
  studentId,
  level,
  curriculumId,
  academicSessionId,
  carryOverCourseIds = [],
  levelChanged,
  session,
}: AdminEnrollmentCorrectionInput) => {
  const uniqueCarryOverIds = [...new Set(carryOverCourseIds)];

  validateObjectIds(uniqueCarryOverIds);

  if (
    !mongoose.isValidObjectId(studentId) ||
    !mongoose.isValidObjectId(curriculumId) ||
    !mongoose.isValidObjectId(academicSessionId)
  ) {
    throw new Error("Invalid student, curriculum, or academic session ID.");
  }

  const student = await Student.findOne({
    _id: studentId,
    curriculumId,
  }).session(session);

  if (!student) {
    throw new Error("Student not found in the specified curriculum.");
  }

  const levelCourses = levelChanged
    ? await Course.find({
        level,
        curriculumId,
      }).session(session)
    : [];

  const carryOverCourses = uniqueCarryOverIds.length
    ? await Course.find({
        _id: { $in: uniqueCarryOverIds },
        curriculumId,
        level: { $lt: level },
      }).session(session)
    : [];

  if (carryOverCourses.length !== uniqueCarryOverIds.length) {
    throw new Error(
      "Carryover courses must belong to the student's curriculum and be below their current level."
    );
  }

  const coursesToKeep = [
    ...levelCourses.map((course) => course._id.toString()),
    ...carryOverCourses.map((course) => course._id.toString()),
  ];

  const uniqueCourseIds = [...new Set(coursesToKeep)];

  if (levelChanged) {
    await CourseEnrollment.updateMany(
      {
        studentId,
        academicSessionId,
        status: "active",
        courseId: { $nin: uniqueCourseIds },
      },
      {
        $set: { status: "dropped" },
      },
      { session }
    );
  }

  for (const courseId of uniqueCourseIds) {
    const existingEnrollment = await CourseEnrollment.findOne({
      studentId,
      courseId,
      academicSessionId,
    }).session(session);

    if (!existingEnrollment) {
      await createCourseEnrollment(
        { studentId, courseId, academicSessionId },
        session
      );
      continue;
    }

    // Do not reactivate or overwrite completed enrollment history.
    if (existingEnrollment.status === "dropped") {
      existingEnrollment.status = "active";
      await existingEnrollment.save({ session });
    }
  }
};

export const enrollStudentIntoLevelCourses = async ({
  studentId,
  level,
  curriculumId,
  academicSessionId,
  carryOverCourseIds = [],
  maxCarryOverLevel = level,
  requirePreviousEnrollment = true,
  session,
}: EnrollStudentIntoLevelCoursesInput) => {
  if (
    !mongoose.isValidObjectId(studentId) ||
    !mongoose.isValidObjectId(curriculumId) ||
    !mongoose.isValidObjectId(academicSessionId)
  ) {
    throw new Error("Invalid student, curriculum, or academic session ID.");
  }

  const student = await Student.findOne({
    _id: studentId,
    curriculumId,
  }).session(session ?? null);

  if (!student) {
    throw new Error("Student not found in the specified curriculum.");
  }

  const levelCourses = await Course.find({
    level,
    curriculumId,
  }).session(session ?? null);

  const uniqueCarryOverIds = [...new Set(carryOverCourseIds)];

  validateObjectIds(uniqueCarryOverIds);

  const validCarryOverCourses = uniqueCarryOverIds.length
    ? await Course.find({
        _id: { $in: uniqueCarryOverIds },
        curriculumId,
        level: { $lte: maxCarryOverLevel },
      }).session(session ?? null)
    : [];

  if (validCarryOverCourses.length !== uniqueCarryOverIds.length) {
    throw new Error(
      "One or more carryover courses are invalid or above the allowed previous level."
    );
  }

  if (requirePreviousEnrollment && uniqueCarryOverIds.length) {
    const previousEnrollments = await CourseEnrollment.find({
      studentId,
      courseId: { $in: uniqueCarryOverIds },
      academicSessionId: { $ne: academicSessionId },
    }).session(session ?? null);

    const previouslyEnrolledCourseIds = new Set(
      previousEnrollments.map((enrollment) => enrollment.courseId.toString())
    );

    if (
      uniqueCarryOverIds.some(
        (courseId) => !previouslyEnrolledCourseIds.has(courseId)
      )
    ) {
      throw new Error(
        "Students can only carry over courses they were previously enrolled in."
      );
    }
  }

  const allCourseIds = [
    ...levelCourses.map((course) => course._id.toString()),
    ...validCarryOverCourses.map((course) => course._id.toString()),
  ];

  const uniqueCourseIds = [...new Set(allCourseIds)];

  for (const courseId of uniqueCourseIds) {
    try {
      await createCourseEnrollment(
        { studentId, courseId, academicSessionId },
        session
      );
    } catch (error) {
      if (isDuplicateEnrollment(error)) {
        continue;
      }

      throw error;
    }
  }
};

export const enrollExistingStudentsIntoCourse = async ({
  courseId,
  level,
  curriculumId,
  academicSessionId,
  session,
}: EnrollExistingStudentsIntoCourseInput) => {
  if (
    !mongoose.isValidObjectId(courseId) ||
    !mongoose.isValidObjectId(academicSessionId)
  ) {
    throw new Error("Invalid course or academic session ID.");
  }

  const course = await Course.findOne({
    _id: courseId,
    level,
    curriculumId,
  }).session(session ?? null);

  if (!course) {
    throw new Error("Course not found in the specified curriculum and level.");
  }

  const students = await Student.find({
    currentLevel: level,
    curriculumId,
  }).session(session ?? null);

  for (const student of students) {
    try {
      await createCourseEnrollment(
        {
          studentId: student._id.toString(),
          courseId,
          academicSessionId,
        },
        session
      );
    } catch (error) {
      if (isDuplicateEnrollment(error)) {
        continue;
      }

      throw error;
    }
  }
};
