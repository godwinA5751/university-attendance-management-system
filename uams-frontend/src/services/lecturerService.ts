import api from "@/lib/axios";
import { Lecturer, CreateLecturerInput, UpdateLecturerInput, GetLecturersParams } from "@/types/lecturer";

export const getLecturers = async (
  params?: GetLecturersParams
) => {
  const response = await api.get("/lecturers", {
    params,
  });

  return response.data;
};

export const getLecturer = async (id: string) => {
  const response = await api.get<{
    message: string;
    data: Lecturer;
  }>(`/lecturers/${id}`);

  return response.data.data;
};

export const createLecturer = async (lecturer: CreateLecturerInput) => {
  const response = await api.post<{
    message: string;
    data: Lecturer;
  }>("/lecturers", lecturer);

  return response.data.data;
};

export const updateLecturer = async (id: string, lecturer: UpdateLecturerInput) => {
  const response = await api.patch<{
    message: string;
    data: Lecturer;
  }>(`/lecturers/${id}`, lecturer);

  return response.data.data;
};

export const deleteLecturer = async (id: string) => {
  const response = await api.delete<{
    message: string;
    data: Lecturer;
  }>(`/lecturers/${id}`);

  return response.data;
};
