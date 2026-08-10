import api from "@/lib/axios";

import {
  Student,
  CreateStudentInput,
  UpdateStudentInput,
  PromoteStudentInput,
} from "@/types/student";

export type StudentPaginationResponse = {
  data: Student[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

type GetStudentsParams = {
  page?: number;
  limit?: number;
  search?: string;
  level?: number;
  academicSessionId?: string;
};

export const getStudents = async (
  params?: GetStudentsParams
): Promise<StudentPaginationResponse> => {
  const response = await api.get("/students", {
    params,
  });

  return response.data;
};

export const getStudent = async (
  studentId: string
): Promise<{ data: Student }> => {
  const response = await api.get(
    `/students/${studentId}`
  );

  return response.data;
};

export const createStudent = async (
  data: CreateStudentInput
) => {
  const response = await api.post(
    "/students",
    data
  );

  return response.data;
};

export const updateStudent = async (
  studentId: string,
  data: UpdateStudentInput
) => {
  const response = await api.patch(
    `/students/${studentId}`,
    data
  );

  return response.data;
};

export const promoteStudent = async (
  studentId: string,
  data: PromoteStudentInput
) => {
  const response = await api.patch(
    `/students/${studentId}/promote`,
    data
  );

  return response.data;
};

export const deleteStudent = async (
  studentId: string
) => {
  const response = await api.delete(
    `/students/${studentId}`
  );

  return response.data;
};