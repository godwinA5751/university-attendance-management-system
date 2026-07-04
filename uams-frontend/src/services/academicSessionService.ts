import api from "@/lib/axios";
import {
  AcademicSession,
  AcademicSessionResponse,
  CreateAcademicSessionInput,
} from "@/types/academicSession";

export const getAcademicSessions = async (): Promise<AcademicSession[]> => {
  const response = await api.get<AcademicSessionResponse>(
    "/api/academic-sessions"
  );

  return response.data.data;
};

export const createAcademicSession = async (data: CreateAcademicSessionInput) => {
  const response = await api.post(
    "/api/academic-sessions",
    data
  );

  return response.data;
};

export const activateAcademicSession = async (id: string) => {
  const response = await api.patch(
    `/api/academic-sessions/${id}/activate`
  );

  return response.data;
};

export const deleteAcademicSession = async (id: string) => {
  const response = await api.delete(
    `/api/academic-sessions/${id}`
  );

  return response.data;
};