import api from "@/lib/axios";
import { Lecturer } from "@/types/lecturer";

export const getLecturers = async () => {
  const response = await api.get<{
    message: string;
    data: Lecturer[];
  }>("/lecturers");

  return response.data.data;
};