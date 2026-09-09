import api from "@/lib/axios";
import { CreateEnrollmentInput } from "@/types/enrollment";

export const createEnrollment = async (
  input: CreateEnrollmentInput
) => {
  const response = await api.post("/enrollments", input);
  return response.data;
};