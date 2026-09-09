export interface AssignLecturer {
  _id: string;
  lecturerName: string;
  staffNumber: string;
  department: string;
  faculty: string;
}

export interface Lecturer {
  _id: string;
  firstName: string;
  lastName: string;
  staffNumber: string;
  department: string;
  faculty: string;
}

export type CreateLecturerInput = {
  firstName: string;
  lastName: string;
  staffNumber: string;
  department: string;
  faculty: string;
};

export type UpdateLecturerInput = {
  firstName: string;
  lastName: string;
  department: string;
  faculty: string;
};

export type GetLecturersParams = {
  page?: number;
  limit?: number;
  search?: string;
};

export interface LecturerCourse {
  _id: string;
  courseCode: string;
  courseTitle: string;
  unit: number;
  semester: "First" | "Second";
  level: number;
}

export interface LecturerDashboardStudent {
  studentId: string;
  attendanceRate: number;
}

export interface LecturerDashboardCourse {
  courseId: string;
  courseTitle: string;
  totalStudents: number;
  totalAttendanceRecords: number;
  students: LecturerDashboardStudent[];
}

export interface LecturerProfile {
  firstName: string;
  lastName: string;
  staffNumber: string;
  department: string;
  faculty: string;
}