import api from "@/lib/axios";

export const getStudents = async (
  page = 1,
  limit = 10
) => {
  const response = await api.get(
    `/api/students?page=${page}&limit=${limit}`
  );

  return response.data;
};