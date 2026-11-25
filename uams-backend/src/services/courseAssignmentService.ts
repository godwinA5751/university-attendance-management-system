import mongoose from "mongoose";
import type {
  AssignLecturersInput,
  ReplaceLecturersInput,
  RemoveLecturerInput,
} from "../types/courseAssignment.types.js";

import { Course } from "../models/Course.js";
import { Lecturer } from "../models/Lecturer.js";
import { CourseAssignment } from "../models/CourseAssignment.js";
import { AcademicSession } from "../models/AcademicSession.js";

const getActiveSession = async (
  session?: mongoose.ClientSession
) => {
  const activeSession = await AcademicSession.findOne({
    isActive: true,
  }).session(session ?? null);

  if (!activeSession) {
    throw new Error("No active academic session found");
  }

  return activeSession;
};

export const assignLecturersToCourse = async (
  input: AssignLecturersInput
) => {
  const { courseId, lecturerIds } = input;

  const uniqueLecturerIds = [...new Set(lecturerIds)];

  const mongoSession = await mongoose.startSession();

  try {
    const result = await mongoSession.withTransaction(async () => {
      const course = await Course.findById(courseId)
        .session(mongoSession);

      if (!course) {
        throw new Error("Course not found");
      }

      const activeSession = await getActiveSession(mongoSession);

      const lecturers = await Lecturer.find({
        _id: { $in: uniqueLecturerIds },
      }).session(mongoSession);

      if (lecturers.length !== uniqueLecturerIds.length) {
        throw new Error("One or more lecturers not found");
      }

      for (const lecturerId of uniqueLecturerIds) {
        await CourseAssignment.updateOne(
          {
            courseId,
            lecturerId,
            academicSessionId: activeSession._id,
          },
          {
            $setOnInsert: {
              courseId,
              lecturerId,
              academicSessionId: activeSession._id,
            },
          },
          {
            upsert: true,
            session: mongoSession,
          }
        );
      }

      const assignments = await CourseAssignment.find({
        courseId,
        academicSessionId: activeSession._id,
      })
        .populate({
          path: "courseId",
          populate: { path: "curriculumId" },
        })
        .populate({
          path: "lecturerId",
          populate: {
            path: "userId",
            select: "firstName lastName",
          },
        })
        .session(mongoSession);

      return assignments
        .filter((assignment: any) =>
          assignment.lecturerId &&
          assignment.lecturerId.userId
        )
        .map((assignment: any) => {
          const lecturer = assignment.lecturerId;
          const user = lecturer.userId;
          const course = assignment.courseId;

          return {
            _id: assignment._id,
            course,
            curriculum: course.curriculumId,
            lecturer: {
              _id: lecturer._id,
              staffNumber: lecturer.staffNumber,
              department: lecturer.department,
              faculty: lecturer.faculty,
              lecturerName: `${user.firstName} ${user.lastName}`,
            },
          };
        });
    });

    if (!result) {
      throw new Error("Lecturer assignment transaction failed");
    }

    return result;
  } finally {
    await mongoSession.endSession();
  }
};

export const replaceCourseLecturers = async (
  input: ReplaceLecturersInput
) => {
  const { courseId, lecturerIds } = input;

  const uniqueLecturerIds = [...new Set(lecturerIds)];

  const mongoSession = await mongoose.startSession();

  try {
    const result = await mongoSession.withTransaction(async () => {
      const course = await Course.findById(courseId)
        .session(mongoSession);

      if (!course) {
        throw new Error("Course not found");
      }

      const activeSession = await getActiveSession(mongoSession);

      const lecturers = await Lecturer.find({
        _id: { $in: uniqueLecturerIds },
      }).session(mongoSession);

      if (lecturers.length !== uniqueLecturerIds.length) {
        throw new Error("One or more lecturers not found");
      }

      await CourseAssignment.deleteMany(
        {
          courseId,
          academicSessionId: activeSession._id,
        },
        { session: mongoSession }
      );

      if (uniqueLecturerIds.length > 0) {
        await CourseAssignment.insertMany(
          uniqueLecturerIds.map((lecturerId) => ({
            courseId,
            lecturerId,
            academicSessionId: activeSession._id,
          })),
          { session: mongoSession }
        );
      }

      const assignments = await CourseAssignment.find({
        courseId,
        academicSessionId: activeSession._id,
      })
        .populate({
          path: "courseId",
          populate: { path: "curriculumId" },
        })
        .populate({
          path: "lecturerId",
          populate: {
            path: "userId",
            select: "firstName lastName",
          },
        })
        .session(mongoSession);

      return assignments
        .filter((assignment: any) =>
          assignment.lecturerId &&
          assignment.lecturerId.userId
        )
        .map((assignment: any) => {
          const lecturer = assignment.lecturerId;
          const user = lecturer.userId;
          const course = assignment.courseId;

          return {
            _id: assignment._id,
            course,
            curriculum: course.curriculumId,
            lecturer: {
              _id: lecturer._id,
              staffNumber: lecturer.staffNumber,
              department: lecturer.department,
              faculty: lecturer.faculty,
              lecturerName: `${user.firstName} ${user.lastName}`,
            },
          };
        });
    });

    if (!result) {
      throw new Error("Lecturer replacement transaction failed");
    }

    return result;
  } finally {
    await mongoSession.endSession();
  }
};

export const removeLecturerFromCourse = async (
  input: RemoveLecturerInput
) => {
  const {
    courseId,
    lecturerId,
  } = input;

  const course = await Course.findById(
    courseId
  );

  if (!course) {
    throw new Error("Course not found");
  }

  const activeSession =
    await getActiveSession();

  const assignment =
    await CourseAssignment.findOne({
      courseId,
      lecturerId,
      academicSessionId:
        activeSession._id,
    });

  if (!assignment) {
    throw new Error(
      "Lecturer is not assigned to this course"
    );
  }

  await assignment.deleteOne();

  return {
    message:
      "Lecturer removed successfully",
  };
};

export const getAssignedLecturersForCourse =
  async (courseId: string) => {
    const course =
      await Course.findById(courseId);

    if (!course) {
      throw new Error(
        "Course not found"
      );
    }

    const activeSession =
      await getActiveSession();

    const assignments =
      await CourseAssignment.find({
        courseId,
        academicSessionId:
          activeSession._id,
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
        const lecturer =
          assignment.lecturerId;

        const user =
          lecturer.userId;

        return {
          _id: lecturer._id,
          staffNumber:
            lecturer.staffNumber,
          department:
            lecturer.department,
          faculty:
            lecturer.faculty,
          lecturerName:
            `${user.firstName} ${user.lastName}`,
        };
      });
  };

export const getLecturersForCourse =
  async (courseId: string) => {
    const activeSession =
      await getActiveSession();

    const assignments =
      await CourseAssignment.find({
        courseId,
        academicSessionId:
          activeSession._id,
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
        const lecturer =
          assignment.lecturerId;

        const user =
          lecturer.userId;

        return {
          _id: lecturer._id,
          staffNumber:
            lecturer.staffNumber,
          department:
            lecturer.department,
          faculty:
            lecturer.faculty,
          lecturerName:
            `${user.firstName} ${user.lastName}`,
        };
      });
  };

export const getLecturersGroupedByCourse =
  async () => {
    const activeSession =
      await getActiveSession();

    const assignments =
      await CourseAssignment.find({
        academicSessionId:
          activeSession._id,
      }).populate({
        path: "lecturerId",
        populate: {
          path: "userId",
          select: "firstName lastName",
        },
      });

    const grouped:
      Record<string, any[]> = {};

    assignments.forEach(
      (assignment: any) => {
        // Skip orphaned assignments
        if (
          !assignment.lecturerId ||
          !assignment.lecturerId.userId
        ) {
          return;
        }

        const key =
          assignment.courseId.toString();

        const lecturer =
          assignment.lecturerId;

        const user =
          lecturer.userId;

        const formattedLecturer = {
          _id: lecturer._id,
          staffNumber:
            lecturer.staffNumber,
          department:
            lecturer.department,
          faculty:
            lecturer.faculty,
          lecturerName:
            `${user.firstName} ${user.lastName}`,
        };

        if (!grouped[key]) {
          grouped[key] = [];
        }

        grouped[key].push(
          formattedLecturer
        );
      }
    );

    return grouped;
  };