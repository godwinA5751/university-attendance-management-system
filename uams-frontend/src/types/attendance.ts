export type AttendanceStatus = "present" | "absent" | "late";

export interface EnrolledStudent {
  enrollmentId: string;
  studentId: string;
  matricNumber: string;
  studentName: string;
  status: AttendanceStatus | null;
}

export interface MarkAttendanceInput {
  enrollmentId: string;
  dateTime: string;
  status: AttendanceStatus;
}