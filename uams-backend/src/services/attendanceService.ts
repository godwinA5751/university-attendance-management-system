import mongoose from "mongoose";
import { AttendanceSession } from "../models/AttendanceSession.js";
import { AcademicSession } from "../models/AcademicSession.js";
import { Lecturer } from "../models/Lecturer.js";
import type { RecordManualAttendanceInput } from "../types/attendance.types.js";
import { CourseEnrollment } from "../models/CourseEnrollment.js";
import { Attendance } from "../models/Attendance.js";
import { CourseAssignment } from "../models/CourseAssignment.js";
import { Student } from "../models/Student.js";
import { verifyQrAttendanceToken } from "../utils/qrAttendanceToken.js";
import {
  validateGeoLocation,
  calculateDistanceMeters,
} from "../utils/geolocation.js";
import type { SubmitQrAttendanceInput } from "../types/attendance.types.js";

export const getAttendanceByStudent = async (studentId: string) => {
  const enrollments = await CourseEnrollment.find({ studentId });

  const enrollmentIds = enrollments.map((e) => e._id);

  return Attendance.find({
    enrollmentId: { $in: enrollmentIds },
  });
};

export const getAttendanceByCourse = async (courseId: string) => {
  const enrollments = await CourseEnrollment.find({ courseId });

  const enrollmentIds = enrollments.map((e) => e._id);

  return Attendance.find({
    enrollmentId: { $in: enrollmentIds },
  });
};

export const getAttendanceByEnrollment = async (enrollmentId: string) => {
  if (!mongoose.isValidObjectId(enrollmentId)) {
    throw new Error("Invalid enrollment ID");
  }

  return Attendance.find({ enrollmentId });
};

export const createAttendance = async (
  input: RecordManualAttendanceInput,
  lecturerId: string
) => {
  const { attendanceSessionId, enrollmentId, status, reason } = input;

  if (
    !mongoose.isValidObjectId(attendanceSessionId) ||
    !mongoose.isValidObjectId(enrollmentId)
  ) {
    throw new Error("Invalid attendance session or enrollment ID");
  }

  const allowedStatuses = ["present", "absent", "late"] as const;

  if (!allowedStatuses.includes(status)) {
    throw new Error("Invalid attendance status");
  }

  const mongoSession = await mongoose.startSession();

  try {
    let result: any = null;

    await mongoSession.withTransaction(async () => {
      // Incrementing this field coordinates attendance writes
      // with the transaction that closes the lecture.
      const session = await AttendanceSession.findOneAndUpdate(
        {
          _id: attendanceSessionId,
          lecturerId,
          status: "open",
        },
        {
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

      if (!["manual", "both"].includes(session.attendanceMethod)) {
        throw new Error("Manual attendance is not enabled");
      }

      const enrollment = await CourseEnrollment.findOne({
        _id: enrollmentId,
        courseId: session.courseId,
        academicSessionId: session.academicSessionId,
        status: "active",
      }).session(mongoSession);

      if (!enrollment) {
        throw new Error("Active course enrollment not found");
      }

      const recordedAt = new Date();

      result = await Attendance.findOneAndUpdate(
        {
          attendanceSessionId,
          studentId: enrollment.studentId,
        },
        {
          $set: {
            attendanceSessionId,
            enrollmentId,
            studentId: enrollment.studentId,
            dateTime: recordedAt,
            status,
            method: "manual",
            recordedBy: lecturerId,
            recordedAt,
            manualReason: reason?.trim() || null,
          },
        },
        {
          upsert: true,
          new: true,
          runValidators: true,
          session: mongoSession,
        }
      );
    });

    return result;
  } finally {
    await mongoSession.endSession();
  }
};

export const getLecturerAttendanceReport = async (userId: string) => {
  const lecturer = await Lecturer.findOne({ userId });

  if (!lecturer) {
    throw new Error("Lecturer not found");
  }

  const academicSession = await AcademicSession.findOne({
    isActive: true,
  });

  if (!academicSession) {
    throw new Error("No active academic session found");
  }

  const assignments = await CourseAssignment.find({
    lecturerId: lecturer._id,
    academicSessionId: academicSession._id,
  }).populate("courseId");

  // Get unique courses assigned to this lecturer.
  const courses = new Map<string, any>();

  for (const assignment of assignments) {
    const course = assignment.courseId as any;

    if (course?._id) {
      courses.set(course._id.toString(), course);
    }
  }

  const reports = await Promise.all(
    Array.from(courses.values()).map(async (course) => {
      // Only currently active students count toward expected attendance.
      const enrollments = await CourseEnrollment.find({
        courseId: course._id,
        academicSessionId: academicSession._id,
        status: "active",
      }).select("_id");

      // Only closed sessions count as completed attendance opportunities.
      const closedSessions = await AttendanceSession.find({
        courseId: course._id,
        lecturerId: lecturer._id,
        academicSessionId: academicSession._id,
        status: "closed",
      }).select("_id");

      const enrollmentIds = enrollments.map((enrollment) => enrollment._id);
      const attendanceSessionIds = closedSessions.map(
        (session) => session._id
      );

      let attendanceRecords: any[] = [];

      if (enrollmentIds.length > 0 && attendanceSessionIds.length > 0) {
        attendanceRecords = await Attendance.find({
          enrollmentId: { $in: enrollmentIds },
          attendanceSessionId: { $in: attendanceSessionIds },
        }).select("status");
      }

      const presentCount = attendanceRecords.filter(
        (record) => record.status === "present"
      ).length;

      const lateCount = attendanceRecords.filter(
        (record) => record.status === "late"
      ).length;

      const absentCount = attendanceRecords.filter(
        (record) => record.status === "absent"
      ).length;

      const totalStudents = enrollments.length;
      const totalClosedSessions = closedSessions.length;

      const totalExpectedAttendance =
        totalStudents * totalClosedSessions;

      // Present and late students both count as having attended.
      const attendedCount = presentCount + lateCount;

      const attendanceRate =
        totalExpectedAttendance > 0
          ? Number(
              (
                (attendedCount / totalExpectedAttendance) *
                100
              ).toFixed(2)
            )
          : 0;

      return {
        courseId: course._id,
        courseTitle: course.courseTitle,
        courseCode: course.courseCode,
        academicSessionId: academicSession._id,
        academicSessionName: academicSession.sessionName,

        totalStudents,
        totalClosedSessions,
        totalExpectedAttendance,
        totalAttendanceRecords: attendanceRecords.length,

        presentCount,
        lateCount,
        absentCount,
        attendanceRate,
      };
    })
  );

  return reports;
};

export const submitQrAttendance = async (
  input: SubmitQrAttendanceInput,
  userId: string
) => {
  if (
    !input ||
    typeof input.token !== "string" ||
    !input.token.trim()
  ) {
    throw new Error("QR attendance token is required");
  }

  validateGeoLocation({
    latitude: input.latitude,
    longitude: input.longitude,
    accuracy: input.accuracy,
  });

  const now = Date.now();
  const locationAge = now - input.locationTimestamp;

  if (
    !Number.isFinite(input.locationTimestamp) ||
    locationAge > 2 * 60 * 1000 ||
    locationAge < -30 * 1000
  ) {
    throw new Error(
      "GPS location is stale or has an invalid timestamp. Please retry."
    );
  }

  const { sessionId } = verifyQrAttendanceToken(input.token);

  const student = await Student.findOne({ userId }).select("_id");

  if (!student) {
    throw new Error("Student profile not found");
  }

  const mongoSession = await mongoose.startSession();

  try {
    let result: any = null;

    await mongoSession.withTransaction(async () => {
      const attendanceSession = await AttendanceSession.findOneAndUpdate(
  {
    _id: sessionId,
    status: "open",
          attendanceMethod: { $in: ["self_service", "both"] },
        },
        {
          $inc: { attendanceVersion: 1 },
        },
        {
          new: true,
          session: mongoSession,
        }
      );

      if (!attendanceSession) {
        throw new Error(
          "Attendance session is closed or QR attendance is not enabled"
        );
      }

      if (!attendanceSession.venueSnapshot) {
        throw new Error("Attendance session venue not found");
      }

      const venue = attendanceSession.venueSnapshot;

      if (
        !Number.isFinite(venue.latitude) ||
        !Number.isFinite(venue.longitude) ||
        !Number.isFinite(venue.allowedRadius) ||
        venue.latitude < -90 ||
        venue.latitude > 90 ||
        venue.longitude < -180 ||
        venue.longitude > 180 ||
        venue.allowedRadius <= 0
      ) {
        throw new Error("Attendance session has invalid venue coordinates");
      }

      const distance = calculateDistanceMeters(
        input.latitude,
        input.longitude,
        venue.latitude,
        venue.longitude
      );

      const maximumPossibleDistance = distance + input.accuracy;

      if (maximumPossibleDistance > venue.allowedRadius) {
        throw new Error(
          "Your location is outside the permitted attendance area or GPS accuracy is insufficient."
        );
      }

      const enrollment = await CourseEnrollment.findOne({
        studentId: student._id,
        courseId: attendanceSession.courseId,
        academicSessionId: attendanceSession.academicSessionId,
        status: "active",
      }).session(mongoSession);

      if (!enrollment) {
        throw new Error("Active course enrollment not found");
      }

      const recordedAt = new Date();

      result = await Attendance.create(
        [
          {
            attendanceSessionId: attendanceSession._id,
            enrollmentId: enrollment._id,
            studentId: student._id,
            dateTime: recordedAt,
            status: "present",
            method: "self_service",
            recordedBy: null,
            recordedAt,
            manualReason: null,
          },
        ],
        { session: mongoSession }
      );

      result = result[0];
    });

    return result;
  } finally {
    await mongoSession.endSession();
  }
};