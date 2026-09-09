import api from "@/lib/axios";
import {
  Lecturer,
  CreateLecturerInput,
  UpdateLecturerInput,
  GetLecturersParams,
  LecturerCourse,
  LecturerDashboardCourse,
  LecturerProfile,
} from "@/types/lecturer";

// ---- Self-service endpoints (used by the logged-in lecturer) ----

export const getMyCourses = async () => {
  const response = await api.get<{
    message: string;
    data: LecturerCourse[];
  }>("/lecturers/courses");

  return response.data.data;
};

export const getMyDashboard = async () => {
  const response = await api.get<{
    message: string;
    data: LecturerDashboardCourse[];
  }>("/analytics/lecturer/dashboard");

  return response.data.data;
};

export const getMyProfile = async () => {
  const response = await api.get<{
    message: string;
    data: LecturerProfile;
  }>("/lecturers/profile");

  return response.data.data;
};

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