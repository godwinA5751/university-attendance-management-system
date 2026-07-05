import type {
  AssignLecturersInput,
  ReplaceLecturersInput,
  RemoveLecturerInput,
} from "../types/courseAssignment.types.js";

import { Course } from "../models/Course.js";
import { Lecturer } from "../models/Lecturer.js";
import { CourseAssignment } from "../models/CourseAssignment.js";

export const assignLecturersToCourse = async (
  input: AssignLecturersInput
) => {
  const { courseId, lecturerIds } = input;

  const course = await Course.findById(courseId);

  if (!course) {
    throw new Error("Course not found");
  }

  const lecturers = await Lecturer.find({
    _id: { $in: lecturerIds },
  });

  if (lecturers.length !== lecturerIds.length) {
    throw new Error("One or more lecturers not found");
  }

  const uniqueLecturerIds = [...new Set(lecturerIds)];

  for (const lecturerId of uniqueLecturerIds) {
    await CourseAssignment.updateOne(
      {
        courseId,
        lecturerId,
        academicSessionId: course.academicSessionId,
      },
      {
        courseId,
        lecturerId,
        academicSessionId: course.academicSessionId,
      },
      {
        upsert: true,
      }
    );
  }

  return await CourseAssignment.find({
    courseId,
  })
    .populate("courseId")
    .populate("lecturerId")
    .populate("academicSessionId");
};

export const replaceLecturersForCourse = async (
  input: ReplaceLecturersInput
) => {
  const { courseId, lecturerIds } = input;

  const course = await Course.findById(courseId);

  if (!course) {
    throw new Error("Course not found");
  }

  const lecturers = await Lecturer.find({
    _id: { $in: lecturerIds },
  });

  if (lecturers.length !== lecturerIds.length) {
    throw new Error("One or more lecturers not found");
  }

  const uniqueLecturerIds = [...new Set(lecturerIds)];

  // Remove existing assignments
  await CourseAssignment.deleteMany({
    courseId,
    academicSessionId: course.academicSessionId,
  });

  // Create new assignments
  await CourseAssignment.insertMany(
    uniqueLecturerIds.map((lecturerId) => ({
      courseId,
      lecturerId,
      academicSessionId: course.academicSessionId,
    }))
  );

  return await CourseAssignment.find({
    courseId,
    academicSessionId: course.academicSessionId,
  })
    .populate("courseId")
    .populate("lecturerId")
    .populate("academicSessionId");
};

export const removeLecturerFromCourse = async (
  input: RemoveLecturerInput
) => {
  const { courseId, lecturerId } = input;

  const course = await Course.findById(courseId);

  if (!course) {
    throw new Error("Course not found");
  }

  const assignment = await CourseAssignment.findOne({
    courseId,
    lecturerId,
    academicSessionId: course.academicSessionId,
  });

  if (!assignment) {
    throw new Error("Lecturer is not assigned to this course");
  }

  await assignment.deleteOne();

  return {
    message: "Lecturer removed successfully",
  };
};

export const getLecturersForCourse = async (
  courseId: string
) => {
  const assignments = await CourseAssignment.find({
    courseId,
  }).populate("lecturerId");

  return assignments.map(
    (assignment) => assignment.lecturerId
  );
};

export const getLecturersGroupedByCourse = async () => {
  const assignments = await CourseAssignment.find()
    .populate("lecturerId");

  const grouped: Record<string, any[]> = {};

  assignments.forEach((assignment) => {
    const key = assignment.courseId.toString();

    if (!grouped[key]) {
      grouped[key] = [];
    }

    grouped[key].push(assignment.lecturerId);
  });

  return grouped;
};