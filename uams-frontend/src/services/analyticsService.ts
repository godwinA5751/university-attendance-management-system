import api from "@/lib/axios";
import { CourseAttendanceStats, StudentAttendanceStats } from "@/types/analytics";

export const getCourseAnalytics = async (courseId: string) => {
  const response = await api.get<{
    message: string;
    data: CourseAttendanceStats;
  }>(`/analytics/course/${courseId}`);

  return response.data.data;
};

export const getStudentAnalytics = async (studentId: string) => {
  const response = await api.get<{
    message: string;
    data: StudentAttendanceStats;
  }>(`/analytics/student/${studentId}`);

  return response.data.data;
};