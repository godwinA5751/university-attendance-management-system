import mongoose from "mongoose";
import { AcademicSession } from "../models/AcademicSession.js";
import { CourseAssignment } from "../models/CourseAssignment.js";
import type { CreateAcademicSessionInput } from "../types/academicSession.types.js";

export const getAcademicSessions = async () => {
  return await AcademicSession.find()
    .sort({ isActive: -1, createdAt: -1 });
};

export const createAcademicSession = async (
  input: CreateAcademicSessionInput
) => {
  const { sessionName, startDate, endDate } = input;

  const existingSession = await AcademicSession.findOne({
    sessionName,
  });

  if (existingSession) {
    throw new Error("Session already exists");
  }

  if (new Date(startDate) >= new Date(endDate)) {
    throw new Error("startDate must be before endDate");
  }

  const session = new AcademicSession({
    sessionName,
    startDate,
    endDate,
    isActive: false,
  });

  await session.save();

  return session;
};

export const deleteAcademicSession = async (id: string) => {
  const mongoSession = await mongoose.startSession();

  try {
    const result = await mongoSession.withTransaction(async () => {
      const session = await AcademicSession.findById(id)
        .session(mongoSession);

      if (!session) {
        throw new Error("Academic session not found");
      }

      if (session.isActive) {
        throw new Error("Cannot delete the active academic session");
      }

      const assignmentExists = await CourseAssignment.exists({
        academicSessionId: session._id,
      }).session(mongoSession);

      if (assignmentExists) {
        throw new Error(
          "Cannot delete an academic session with lecturer course assignments."
        );
      }

      await session.deleteOne({ session: mongoSession });

      return { message: "Academic session deleted successfully" };
    });

    if (!result) {
      throw new Error("Academic session deletion failed");
    }

    return result;
  } finally {
    await mongoSession.endSession();
  }
};

export const activateAcademicSession = async (sessionId: string) => {
  const mongoSession = await mongoose.startSession();

  try {
    const result = await mongoSession.withTransaction(async () => {
      const session = await AcademicSession.findById(sessionId)
        .session(mongoSession);

      if (!session) {
        throw new Error("Session not found");
      }

      await AcademicSession.updateMany(
        { _id: { $ne: sessionId } },
        { isActive: false },
        { session: mongoSession }
      );

      session.isActive = true;
      await session.save({ session: mongoSession });

      return session;
    });

    if (!result) {
      throw new Error("Academic session activation failed");
    }

    return result;
  } finally {
    await mongoSession.endSession();
  }
};