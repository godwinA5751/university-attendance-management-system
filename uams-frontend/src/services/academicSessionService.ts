import api from "@/lib/axios";
import {
  AcademicSession,
  AcademicSessionResponse,
  CreateAcademicSessionInput,
} from "@/types/academicSession";

export const getAcademicSessions = async (): Promise<AcademicSession[]> => {
  const response = await api.get<AcademicSessionResponse>(
    "/academic-sessions"
  );

  return response.data.data;
};

export const createAcademicSession = async (data: CreateAcademicSessionInput) => {
  const response = await api.post(
    "/academic-sessions",
    data
  );

  return response.data;
};

export const activateAcademicSession = async (id: string) => {
  const response = await api.patch(
    `/academic-sessions/${id}/activate`
  );

  return response.data;
};

export const deleteAcademicSession = async (id: string) => {
  const response = await api.delete(
    `/academic-sessions/${id}`
  );

  return response.data;
};