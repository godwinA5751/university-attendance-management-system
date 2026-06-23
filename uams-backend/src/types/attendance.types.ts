export interface CreateAttendanceInput {
  enrollmentId: string;
  dateTime: Date;
  status: "present" | "absent" | "late";
}