import api from "@/lib/axios";
import {
  Curriculum,
  CurriculumResponse,
  CreateCurriculumInput,
  UpdateCurriculumInput,
} from "@/types/curriculum";

export const getCurriculum = async (): Promise<Curriculum[]> => {
  const response = await api.get<CurriculumResponse>(
    "/curricula"
  );

  return response.data.data;
};

export const createCurriculum = async (data: CreateCurriculumInput) => {
  const response = await api.post(
    "/curricula",
    data
  );

  return response.data;
};

export const getCurriculumById = async (id: string) => {
  const response = await api.get<CurriculumResponse>(
    `/curricula/${id}`
  );

  return response.data.data[0];
};

export const updateCurriculum = async (id: string, data: UpdateCurriculumInput) => {
  const response = await api.put(
    `/curricula/${id}`,
    data
  );

  return response.data;
};

export const deleteCurriculum = async (id: string) => {
  const response = await api.delete(
    `/curricula/${id}`
  );

  return response.data;
};