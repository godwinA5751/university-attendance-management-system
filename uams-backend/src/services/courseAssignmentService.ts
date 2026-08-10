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

  const assignments = await CourseAssignment.find({ courseId })
    .populate("courseId")
    .populate({
      path: "lecturerId",
      populate: {
        path: "userId",
        select: "firstName lastName",
      },
    })
    .populate("academicSessionId");

  return assignments.map((assignment) => {
    const lecturer = assignment.lecturerId as any;
    const user = lecturer.userId as any;

    return {
      _id: assignment._id,
      course: assignment.courseId,
      academicSession: assignment.academicSessionId,
      lecturer: {
        _id: lecturer._id,
        staffNumber: lecturer.staffNumber,
        department: lecturer.department,
        faculty: lecturer.faculty,
        lecturerName: `${user.firstName} ${user.lastName}`,
      },
    };
  });
};

export const replaceCourseLecturers = async (
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

  const assignments = await CourseAssignment.find({
    courseId,
    academicSessionId: course.academicSessionId,
  })
    .populate("courseId")
    .populate({
      path: "lecturerId",
      populate: {
        path: "userId",
        select: "firstName lastName",
      },
    })
    .populate("academicSessionId");

  return assignments.map((assignment) => {
    const lecturer = assignment.lecturerId as any;
    const user = lecturer.userId as any;

    return {
      _id: assignment._id,
      course: assignment.courseId,
      academicSession: assignment.academicSessionId,
      lecturer: {
        _id: lecturer._id,
        staffNumber: lecturer.staffNumber,
        department: lecturer.department,
        faculty: lecturer.faculty,
        lecturerName: `${user.firstName} ${user.lastName}`,
      },
    };
  });
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

export const getAssignedLecturersForCourse = async (
  courseId: string
) => {
  const course = await Course.findById(courseId);

  if (!course) {
    throw new Error("Course not found");
  }

  const assignments = await CourseAssignment.find({
    courseId,
    academicSessionId: course.academicSessionId,
  }).populate({
    path: "lecturerId",
    populate: {
      path: "userId",
      select: "firstName lastName",
    },
  });

  return assignments
    .filter(
      (assignment: any) =>
        assignment.lecturerId &&
        assignment.lecturerId.userId
    )
    .map((assignment: any) => {
      const lecturer = assignment.lecturerId;
      const user = lecturer.userId;
  
      return {
        _id: lecturer._id,
        staffNumber: lecturer.staffNumber,
        department: lecturer.department,
        faculty: lecturer.faculty,
        lecturerName: `${user.firstName} ${user.lastName}`,
      };
    });
};

export const getLecturersForCourse = async (courseId: string) => {
  const assignments = await CourseAssignment.find({ courseId }).populate({
    path: "lecturerId",
    populate: {
      path: "userId",
      select: "firstName lastName",
    },
  });

  return assignments.map((assignment) => {
    const lecturer = assignment.lecturerId as any;
    const user = lecturer.userId as any;
    return {
      _id: lecturer._id,
      staffNumber: lecturer.staffNumber,
      department: lecturer.department,
      faculty: lecturer.faculty,
      lecturerName: `${user.firstName} ${user.lastName}`,
    };
  });
};

export const getLecturersGroupedByCourse = async () => {
  const assignments = await CourseAssignment.find().populate({
    path: "lecturerId",
    populate: {
      path: "userId",
      select: "firstName lastName",
    },
  });

  const grouped: Record<string, any[]> = {};

  assignments.forEach((assignment: any) => {
    // Skip orphaned assignments
    if (!assignment.lecturerId || !assignment.lecturerId.userId) {
      return;
    }

    const key = assignment.courseId.toString();
    const lecturer = assignment.lecturerId;
    const user = lecturer.userId;

    const formattedLecturer = {
      _id: lecturer._id,
      staffNumber: lecturer.staffNumber,
      department: lecturer.department,
      faculty: lecturer.faculty,
      lecturerName: `${user.firstName} ${user.lastName}`,
    };

    if (!grouped[key]) {
      grouped[key] = [];
    }

    grouped[key].push(formattedLecturer);
  });

  return grouped;
};