import api from "@/lib/axios";
import { Lecturer } from "@/types/lecturer";

export const getAssignedLecturers = async (
  courseId: string
) => {
  const response = await api.get<{
    message: string;
    data: Lecturer[];
  }>(
    `/course-assignments/${courseId}/lecturers`
  );

  return response.data.data;
};

export const replaceCourseLecturers = async (
  courseId: string,
  lecturerIds: string[]
) => {
  const response = await api.patch(
    `/course-assignments/${courseId}`,
    {
      lecturerIds,
    }
  );

  return response.data.data;
};