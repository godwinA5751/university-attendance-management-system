import { AcademicSession } from "../models/AcademicSession.js";
import { CourseEnrollment } from "../models/CourseEnrollment.js";
import type { CreateAcademicSessionInput } from "../types/academicSession.types.js";

export const getAcademicSessions = async () => {
  return await AcademicSession.find()
    .sort({ createdAt: -1 });
};

export const createAcademicSession = async (
  input: CreateAcademicSessionInput
) => {
  const { sessionName, startDate, endDate } = input;

  // 1. Check duplicate session
  const existingSession = await AcademicSession.findOne({
    sessionName,
  });

  if (existingSession) {
    throw new Error("Session already exists");
  }

  // 2. Validate date logic
  if (new Date(startDate) >= new Date(endDate)) {
    throw new Error("startDate must be before endDate");
  }

  // 3. Create session
  const session = new AcademicSession({
    sessionName,
    startDate,
    endDate,
    isActive: false, // enforced by default
  });

  await session.save();

  return session;
};

export const deleteAcademicSession = async (id: string) => {
  const session = await AcademicSession.findById(id);

  if (!session) {
    throw new Error("Academic session not found");
  }

  if (session.isActive) {
    throw new Error("Cannot delete the active academic session");
  }

  const enrollmentExists = await CourseEnrollment.exists({
      academicSessionId: id,
  });
  
  if (enrollmentExists) {
      throw new Error(
          "Cannot delete an academic session with enrollments."
      );
  }

  await session.deleteOne();
};

export const activateAcademicSession = async (sessionId: string) => {
  const session = await AcademicSession.findById(sessionId);

  if (!session) {
    throw new Error("Session not found");
  }

  await AcademicSession.updateMany(
    { _id: { $ne: sessionId } },
    { isActive: false }
  );

  session.isActive = true;
  await session.save();

  return session;
};