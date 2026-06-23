import { Lecturer } from "../models/Lecturer.js";

export const getLecturerFromUserId = async (userId: string) => {
  const lecturer = await Lecturer.findOne({ userId });

  if (!lecturer) {
    throw new Error("Lecturer not found");
  }

  return lecturer;
};