import type {
  AssignLecturersInput,
  ReplaceLecturersInput,
  RemoveLecturerInput,
} from "../types/courseAssignment.types.js";

import { Course } from "../models/Course.js";
import { Lecturer } from "../models/Lecturer.js";
import { CourseAssignment } from "../models/CourseAssignment.js";
import { AcademicSession } from "../models/AcademicSession.js";

const getActiveSession = async () => {
  const activeSession = await AcademicSession.findOne({
    isActive: true,
  });

  if (!activeSession) {
    throw new Error("No active academic session found");
  }

  return activeSession;
};

export const assignLecturersToCourse = async (
  input: AssignLecturersInput
) => {
  const { courseId, lecturerIds } = input;

  const course = await Course.findById(courseId);

  if (!course) {
    throw new Error("Course not found");
  }

  const activeSession = await getActiveSession();

  const uniqueLecturerIds = [
    ...new Set(lecturerIds),
  ];

  const lecturers = await Lecturer.find({
    _id: {
      $in: uniqueLecturerIds,
    },
  });

  if (
    lecturers.length !==
    uniqueLecturerIds.length
  ) {
    throw new Error(
      "One or more lecturers not found"
    );
  }

  for (const lecturerId of uniqueLecturerIds) {
    await CourseAssignment.updateOne(
      {
        courseId,
        lecturerId,
        academicSessionId:
          activeSession._id,
      },
      {
        courseId,
        lecturerId,
        academicSessionId:
          activeSession._id,
      },
      {
        upsert: true,
      }
    );
  }

  const assignments =
    await CourseAssignment.find({
      courseId,
      academicSessionId:
        activeSession._id,
    })
      .populate({
        path: "courseId",
        populate: {
          path: "curriculumId",
        },
      })
      .populate({
        path: "lecturerId",
        populate: {
          path: "userId",
          select: "firstName lastName",
        },
      });

  return assignments
    .filter((assignment: any) =>
      assignment.lecturerId &&
      assignment.lecturerId.userId
    )
    .map((assignment: any) => {
      const lecturer =
        assignment.lecturerId;

      const user =
        lecturer.userId;

      const course =
        assignment.courseId;

      return {
        _id: assignment._id,
        course,
        curriculum:
          course.curriculumId,
        lecturer: {
          _id: lecturer._id,
          staffNumber:
            lecturer.staffNumber,
          department:
            lecturer.department,
          faculty:
            lecturer.faculty,
          lecturerName:
            `${user.firstName} ${user.lastName}`,
        },
      };
    });
};

export const replaceCourseLecturers = async (
  input: ReplaceLecturersInput
) => {
  const { courseId, lecturerIds } = input;

  const course = await Course.findById(
    courseId
  );

  if (!course) {
    throw new Error("Course not found");
  }

  const activeSession =
    await getActiveSession();

  const uniqueLecturerIds = [
    ...new Set(lecturerIds),
  ];

  const lecturers = await Lecturer.find({
    _id: {
      $in: uniqueLecturerIds,
    },
  });

  if (
    lecturers.length !==
    uniqueLecturerIds.length
  ) {
    throw new Error(
      "One or more lecturers not found"
    );
  }

  // Remove existing assignments
  // for this course in the active session
  await CourseAssignment.deleteMany({
    courseId,
    academicSessionId:
      activeSession._id,
  });

  // Create new assignments
  if (uniqueLecturerIds.length > 0) {
    await CourseAssignment.insertMany(
      uniqueLecturerIds.map(
        (lecturerId) => ({
          courseId,
          lecturerId,
          academicSessionId:
            activeSession._id,
        })
      )
    );
  }

  const assignments =
    await CourseAssignment.find({
      courseId,
      academicSessionId:
        activeSession._id,
    })
      .populate({
        path: "courseId",
        populate: {
          path: "curriculumId",
        },
      })
      .populate({
        path: "lecturerId",
        populate: {
          path: "userId",
          select: "firstName lastName",
        },
      });

  return assignments
    .filter((assignment: any) =>
      assignment.lecturerId &&
      assignment.lecturerId.userId
    )
    .map((assignment: any) => {
      const lecturer =
        assignment.lecturerId;

      const user =
        lecturer.userId;

      const course =
        assignment.courseId;

      return {
        _id: assignment._id,
        course,
        curriculum:
          course.curriculumId,
        lecturer: {
          _id: lecturer._id,
          staffNumber:
            lecturer.staffNumber,
          department:
            lecturer.department,
          faculty:
            lecturer.faculty,
          lecturerName:
            `${user.firstName} ${user.lastName}`,
        },
      };
    });
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