
import type { Request, Response } from "express";
import { Lecturer } from "../models/Lecturer.js";
import {
  createAttendanceSession,
  getLecturerAttendanceSessions,
  updateAttendanceSession,
  openAttendanceSession,
  closeAttendanceSession,
  cancelAttendanceSession,
  getAttendanceSessionQrToken
} from "../services/attendanceSessionService.js";

const getLecturerId = async (userId: string) => {
  const lecturer = await Lecturer.findOne({ userId });

  if (!lecturer) {
    throw new Error("Lecturer profile not found");
  }

  return lecturer._id.toString();
};

const handleError = (res: Response, error: unknown) => {
  const message =
    error instanceof Error ? error.message : "Internal server error";

  const status =
    message.includes("Invalid") ||
    message.includes("required") ||
    message.includes("must") ||
    message.includes("cannot be empty")
      ? 400
      : message.includes("not found")
        ? 404
        : message.includes("overlap") || message.includes("already")
          ? 409
          : message.includes("not authorized") ||
              message.includes("not allowed")
            ? 403
            : 500;

  return res.status(status).json({ message });
};

export const createAttendanceSessionController = async (
  req: Request,
  res: Response
) => {
  try {
    const lecturerId = await getLecturerId(req.user!.id);

    const input = {
      ...req.body,
      scheduledStartAt: new Date(req.body.scheduledStartAt),
      scheduledEndAt: new Date(req.body.scheduledEndAt),
    };

    const session = await createAttendanceSession(lecturerId, input);

    return res.status(201).json({
      message: "Attendance session created successfully",
      session,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const getLecturerAttendanceSessionsController = async (
  req: Request,
  res: Response
) => {
  try {
    const lecturerId = await getLecturerId(req.user!.id);
    const sessions = await getLecturerAttendanceSessions(lecturerId);

    return res.status(200).json({ sessions });
  } catch (error) {
    return handleError(res, error);
  }
};

export const updateAttendanceSessionController = async (
  req: Request,
  res: Response
) => {
  try {
    const lecturerId = await getLecturerId(req.user!.id);
    const input = { ...req.body };

    if (input.scheduledStartAt !== undefined) {
      input.scheduledStartAt = new Date(input.scheduledStartAt);
    }

    if (input.scheduledEndAt !== undefined) {
      input.scheduledEndAt = new Date(input.scheduledEndAt);
    }

    const session = await updateAttendanceSession(
      req.params.sessionId as string,
      lecturerId,
      input
    );

    return res.status(200).json({
      message: "Attendance session updated successfully",
      session,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const openAttendanceSessionController = async (
  req: Request,
  res: Response
) => {
  try {
    const lecturerId = await getLecturerId(req.user!.id);
    const session = await openAttendanceSession(
      req.params.sessionId as string,
      lecturerId
    );

    return res.status(200).json({
      message: "Attendance session opened successfully",
      session,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const closeAttendanceSessionController = async (
  req: Request,
  res: Response
) => {
  try {
    const lecturerId = await getLecturerId(req.user!.id);
    const session = await closeAttendanceSession(
      req.params.sessionId as string,
      lecturerId
    );

    return res.status(200).json({
      message: "Attendance session closed successfully",
      session,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const cancelAttendanceSessionController = async (
  req: Request,
  res: Response
) => {
  try {
    const lecturerId = await getLecturerId(req.user!.id);
    const session = await cancelAttendanceSession(
      req.params.sessionId as string,
      lecturerId
    );

    return res.status(200).json({
      message: "Attendance session cancelled successfully",
      session,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const getAttendanceSessionQrTokenController = async (
  req: Request,
  res: Response
) => {
  try {
    const lecturerId = await getLecturerId(req.user!.id);

    const result = await getAttendanceSessionQrToken(
      req.params.sessionId as string,
      lecturerId
    );

    return res.status(200).json({
      message: "QR attendance token generated successfully",
      ...result,
    });
  } catch (error) {
    return handleError(res, error);
  }
};