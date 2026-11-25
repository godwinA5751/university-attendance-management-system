import mongoose from "mongoose";
import { Student } from "../models/Student.js";
import { Course } from "../models/Course.js";
import { CourseEnrollment } from "../models/CourseEnrollment.js";
import { createCourseEnrollment } from "./courseEnrollmentService.js";

type EnrollStudentIntoLevelCoursesInput = {
  studentId: string;
  level: number;
  curriculumId: string;
  carryOverCourseIds?: string[];
  maxCarryOverLevel?: number;
  requirePreviousEnrollment?: boolean;
};

type EnrollExistingStudentsIntoCourseInput = {
  courseId: string;
  level: number;
  curriculumId: string;
  session?: mongoose.ClientSession;
};


type AdminEnrollmentCorrectionInput = {
  studentId: string;
  level: number;
  curriculumId: string;
  carryOverCourseIds?: string[];
  levelChanged: boolean;
  session: mongoose.ClientSession;
};

export const syncStudentEnrollmentsAfterAdminUpdate = async ({
  studentId,
  level,
  curriculumId,
  carryOverCourseIds = [],
  levelChanged,
  session,
}: AdminEnrollmentCorrectionInput) => {
  const uniqueCarryOverIds = [...new Set(carryOverCourseIds)];

  // Validate carryover IDs.
  if (
    uniqueCarryOverIds.some(
      (id) => !mongoose.Types.ObjectId.isValid(id)
    )
  ) {
    throw new Error("One or more carryover course IDs are invalid.");
  }

  // Find courses for the student's corrected/current level.
  const levelCourses = levelChanged
    ? await Course.find({
        level,
        curriculumId,
      }).session(session)
    : [];

  // Carryovers must be below the student's current level.
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

  // During a level correction, drop active enrollments
  // that are not part of the corrected enrollment set.
  if (levelChanged) {
    await CourseEnrollment.updateMany(
      {
        studentId,
        status: "active",
        courseId: { $nin: coursesToKeep },
      },
      {
        $set: { status: "dropped" },
      },
      { session }
    );
  }

  // Add or reactivate eligible enrollments.
  for (const courseId of coursesToKeep) {
    const existingEnrollment = await CourseEnrollment.findOne({
      studentId,
      courseId,
    }).session(session);

    if (!existingEnrollment) {
      const enrollment = new CourseEnrollment({
        studentId,
        courseId,
        status: "active",
      });

      await enrollment.save({ session });
      continue;
    }

    // Never overwrite completed enrollment history.
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
  carryOverCourseIds = [],
  maxCarryOverLevel = level,
  requirePreviousEnrollment = true,
  session,
}: EnrollStudentIntoLevelCoursesInput & {
  session?: mongoose.ClientSession;
}) => {
  const levelCourses = await Course.find({
    level,
    curriculumId,
  }).session(session ?? null);

  const uniqueCarryOverIds = [...new Set(carryOverCourseIds)];

  if (
    uniqueCarryOverIds.some(
      (id) => !mongoose.Types.ObjectId.isValid(id)
    )
  ) {
    throw new Error("One or more carryover course IDs are invalid.");
  }

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
    }).session(session ?? null);

    if (previousEnrollments.length !== uniqueCarryOverIds.length) {
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
      await createCourseEnrollment({ studentId, courseId }, session);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message ===
          "Student already enrolled in this course for this curriculum"
      ) {
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
  session,
}: EnrollExistingStudentsIntoCourseInput) => {
  const course = await Course.findById(courseId).session(session ?? null);

  if (!course) {
    throw new Error("Course not found");
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
        },
        session
      );
    } catch (error) {
      if (
        error instanceof Error &&
        error.message ===
          "Student already enrolled in this course for this curriculum"
      ) {
        continue;
      }

      throw error;
    }
  }
};