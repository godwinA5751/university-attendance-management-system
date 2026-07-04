export interface DashboardData {
  academicSession: string;
  totalStudents: number;
  totalCourses: number;
  totalEnrollments: number;
  totalLecturers: number;
  totalAttendance: number;
  attendanceRate: number;
}

export interface DashboardResponse {
  message: string;
  data: DashboardData;
}