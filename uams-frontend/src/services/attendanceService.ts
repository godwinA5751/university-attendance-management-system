import api from "@/lib/axios";
import { EnrolledStudent, MarkAttendanceInput } from "@/types/attendance";

export const getCourseEnrollments = async (
  courseId: string,
  date?: string
) => {
  const response = await api.get<{
    message: string;
    data: EnrolledStudent[];
  }>(`/enrollments/course/${courseId}`, {
    params: date ? { date } : undefined,
  });

  return response.data.data;
};

export const markAttendance = async (input: MarkAttendanceInput) => {
  const response = await api.post("/attendance", input);
  return response.data;
};