
import mongoose from "mongoose";
import { AttendanceSession } from "../models/AttendanceSession.js";
import { CourseAssignment } from "../models/CourseAssignment.js";
import { LectureVenue } from "../models/LectureVenue.js";
import { AcademicSession } from "../models/AcademicSession.js";
import { LecturerScheduleLock } from "../models/LecturerScheduleLock.js";
import { CourseEnrollment } from "../models/CourseEnrollment.js";
import { Attendance } from "../models/Attendance.js";
import type {
  CreateAttendanceSessionInput,
  UpdateAttendanceSessionInput,
} from "../types/attendance.types.js";

const validateSchedule = (start: Date, end: Date) => {
  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    start >= end
  ) {
    throw new Error("Invalid attendance session schedule");
  }
};

const ensureNoOverlap = async (
  lecturerId: string,
  start: Date,
  end: Date,
  excludeId?: string
) => {
  const filter: Record<string, unknown> = {
    lecturerId,
    status: { $in: ["scheduled", "open"] },
    scheduledStartAt: { $lt: end },
    scheduledEndAt: { $gt: start },
  };

  if (excludeId) {
    filter._id = { $ne: excludeId };
  }

  const conflict = await AttendanceSession.exists(filter);

  if (conflict) {
    throw new Error("Lecturer has an overlapping attendance session");
  }
};

const withLecturerScheduleLock = async <T>(
  lecturerId: string,
  callback: (session: mongoose.ClientSession) => Promise<T>
): Promise<T> => {
  // Ensure the persistent lock document exists before starting
  // the scheduling transaction.
  try {
    await LecturerScheduleLock.updateOne(
      { lecturerId },
      {
        $setOnInsert: {
          lecturerId,
          version: 0,
        },
      },
      { upsert: true }
    );
  } catch (error) {
    // Another request may have created this lecturer's lock
    // document at the same time.
    if (
      !(
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === 11000
      )
    ) {
      throw error;
    }
  }

  const mongoSession = await mongoose.startSession();

  try {
    let result: T | undefined;

    await mongoSession.withTransaction(async () => {
      // This write serializes scheduling operations for this lecturer.
      const lock = await LecturerScheduleLock.findOneAndUpdate(
        { lecturerId },
        { $inc: { version: 1 } },
        {
          new: true,
          session: mongoSession,
        }
      );

      if (!lock) {
        throw new Error("Unable to acquire lecturer scheduling lock");
      }

      result = await callback(mongoSession);
    });

    if (result === undefined) {
      throw new Error("Scheduling transaction did not complete");
    }

    return result;
  } finally {
    await mongoSession.endSession();
  }
};

export const createAttendanceSession = async (
  lecturerId: string,
  data: CreateAttendanceSessionInput
) => {
  if (
    !mongoose.isValidObjectId(data.courseAssignmentId) ||
    !mongoose.isValidObjectId(data.venueId)
  ) {
    throw new Error("Invalid course assignment or venue ID");
  }

  const start = new Date(data.scheduledStartAt);
  const end = new Date(data.scheduledEndAt);

  validateSchedule(start, end);

  return withLecturerScheduleLock(lecturerId, async (mongoSession) => {
    const assignment = await CourseAssignment.findOne({
      _id: data.courseAssignmentId,
      lecturerId,
    }).session(mongoSession);

    if (!assignment) {
      throw new Error("Course assignment not found");
    }

    const academicSession = await AcademicSession.findOne({
      _id: assignment.academicSessionId,
      isActive: true,
    }).session(mongoSession);

    if (!academicSession) {
      throw new Error(
        "Cannot create attendance session for an inactive academic session"
      );
    }

    const venue = await LectureVenue.findOne({
      _id: data.venueId,
      lecturerId,
      isActive: true,
    }).session(mongoSession);

    if (!venue) {
      throw new Error("Active venue not found");
    }

    await ensureNoOverlap(lecturerId, start, end);

    const [attendanceSession] = await AttendanceSession.create(
      [
        {
          courseAssignmentId: assignment._id,
          courseId: assignment.courseId,
          lecturerId: assignment.lecturerId,
          academicSessionId: assignment.academicSessionId,
          venueId: venue._id,
          venueSnapshot: {
            venueName: venue.venueName,
            latitude: venue.latitude,
            longitude: venue.longitude,
            allowedRadius: venue.allowedRadius,
          },
          scheduledStartAt: start,
          scheduledEndAt: end,
          attendanceMethod: data.attendanceMethod,
        },
      ],
      { session: mongoSession }
    );

    return attendanceSession;
  });
};

export const getLecturerAttendanceSessions = async (
  lecturerId: string
) => {
  return AttendanceSession.find({ lecturerId })
    .populate("courseId", "courseCode courseTitle")
    .populate("academicSessionId", "name")
    .sort({ scheduledStartAt: -1 });
};

export const openAttendanceSession = async (
  sessionId: string,
  lecturerId: string
) => {
  if (!mongoose.isValidObjectId(sessionId)) {
    throw new Error("Invalid attendance session ID");
  }

  const now = new Date();

  const session = await AttendanceSession.findOneAndUpdate(
    {
      _id: sessionId,
      lecturerId,
      status: "scheduled",
      scheduledEndAt: { $gt: now },
    },
    {
      $set: {
        status: "open",
        openedAt: now,
      },
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!session) {
    const existingSession = await AttendanceSession.findOne({
      _id: sessionId,
      lecturerId,
    });

    if (!existingSession) {
      throw new Error("Attendance session not found");
    }

    if (existingSession.status !== "scheduled") {
      throw new Error("Only scheduled sessions can be opened");
    }

    throw new Error("Attendance session schedule has ended");
  }

  return session;
};

export const closeAttendanceSession = async (
  sessionId: string,
  lecturerId: string
) => {
  if (!mongoose.isValidObjectId(sessionId)) {
    throw new Error("Invalid attendance session ID");
  }

  const mongoSession = await mongoose.startSession();

  try {
    let closedSession: any = null;

    await mongoSession.withTransaction(async () => {
      const now = new Date();

      // Atomically close the session.
      const session = await AttendanceSession.findOneAndUpdate(
        {
          _id: sessionId,
          lecturerId,
          status: "open",
        },
        {
          $set: {
            status: "closed",
            closedAt: now,
          },
          $inc: {
            attendanceVersion: 1,
          },
        },
        {
          new: true,
          session: mongoSession,
        }
      );

      if (!session) {
        throw new Error("Open attendance session not found");
      }

      // Get all students actively enrolled in this course
      // for this particular academic session.
      const enrollments = await CourseEnrollment.find({
        courseId: session.courseId,
        academicSessionId: session.academicSessionId,
        status: "active",
      })
        .select("_id studentId")
        .session(mongoSession);

      // Create absent records only where attendance does not
      // already exist for this student and lecture.
      const operations = enrollments.map((enrollment) => ({
        updateOne: {
          filter: {
            attendanceSessionId: session._id,
            studentId: enrollment.studentId,
          },
          update: {
            $setOnInsert: {
              enrollmentId: enrollment._id,
              attendanceSessionId: session._id,
              studentId: enrollment.studentId,
              dateTime: now,
              status: "absent" as const,
              method: "system" as const,
              recordedBy: null,
              recordedAt: now,
              manualReason: null,
            },
          },
          upsert: true,
        },
      }));

      if (operations.length > 0) {
        await Attendance.bulkWrite(operations, {
          session: mongoSession,
        });
      }

      closedSession = session;
    });

    return closedSession;
  } finally {
    await mongoSession.endSession();
  }
};

export const updateAttendanceSession = async (
  sessionId: string,
  lecturerId: string,
  data: UpdateAttendanceSessionInput
) => {
  if (!mongoose.isValidObjectId(sessionId)) {
    throw new Error("Invalid attendance session ID");
  }

  if (
    !data.scheduledStartAt &&
    !data.scheduledEndAt &&
    !data.venueId &&
    !data.attendanceMethod
  ) {
    throw new Error("At least one field must be provided");
  }

  return withLecturerScheduleLock(lecturerId, async (mongoSession) => {
    const attendanceSession = await AttendanceSession.findOne({
      _id: sessionId,
      lecturerId,
    }).session(mongoSession);

    if (!attendanceSession) {
      throw new Error("Attendance session not found");
    }

    if (attendanceSession.status !== "scheduled") {
      throw new Error("Only scheduled sessions can be updated");
    }

    const start = data.scheduledStartAt
      ? new Date(data.scheduledStartAt)
      : attendanceSession.scheduledStartAt;

    const end = data.scheduledEndAt
      ? new Date(data.scheduledEndAt)
      : attendanceSession.scheduledEndAt;

    validateSchedule(start, end);

    await ensureNoOverlap(lecturerId, start, end, sessionId);

    if (data.venueId !== undefined) {
      if (!mongoose.isValidObjectId(data.venueId)) {
        throw new Error("Invalid venue ID");
      }

      const venue = await LectureVenue.findOne({
        _id: data.venueId,
        lecturerId,
        isActive: true,
      }).session(mongoSession);

      if (!venue) {
        throw new Error("Active venue not found");
      }

      attendanceSession.venueId = venue._id;
      attendanceSession.venueSnapshot = {
        venueName: venue.venueName,
        latitude: venue.latitude,
        longitude: venue.longitude,
        allowedRadius: venue.allowedRadius,
      };
    }

    if (data.scheduledStartAt !== undefined) {
      attendanceSession.scheduledStartAt = start;
    }

    if (data.scheduledEndAt !== undefined) {
      attendanceSession.scheduledEndAt = end;
    }

    if (data.attendanceMethod !== undefined) {
      attendanceSession.attendanceMethod = data.attendanceMethod;
    }

    await attendanceSession.save({ session: mongoSession });

    return attendanceSession;
  });
};

export const cancelAttendanceSession = async (
  sessionId: string,
  lecturerId: string
) => {
  const session = await AttendanceSession.findOne({
    _id: sessionId,
    lecturerId,
    status: "scheduled",
  });

  if (!session) {
    throw new Error("Scheduled attendance session not found");
  }

  session.status = "cancelled";
  await session.save();

  return session;
};
