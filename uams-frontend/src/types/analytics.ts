export interface CourseAttendanceStats {
  totalAttendanceRecords: number;
  presentCount: number;
  absentCount: number;
  attendanceRate: number;
}

export interface StudentCourseStats {
  courseCode: string;
  courseTitle: string;
  attendanceRate: number;
  classesAttended: number;
  totalClasses: number;
  classesMissed: number;
}

export interface StudentAttendanceStats {
  overallAttendanceRate: number;
  courses: StudentCourseStats[];
}