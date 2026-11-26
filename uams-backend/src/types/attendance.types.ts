export type AttendanceStatus = "present" | "absent" | "late";

export type AttendanceMethod = "manual" | "self_service";

export type SessionAttendanceMethod =
  | "manual"
  | "self_service"
  | "both";

export type AttendanceSessionStatus =
  | "scheduled"
  | "open"
  | "closed"
  | "cancelled";

export interface CreateAttendanceSessionInput {
  courseAssignmentId: string;
  venueId: string;
  scheduledStartAt: Date;
  scheduledEndAt: Date;
  attendanceMethod: SessionAttendanceMethod;
}

export interface RecordManualAttendanceInput {
  attendanceSessionId: string;
  enrollmentId: string;
  status: AttendanceStatus;
  reason?: string;
}

export interface UpdateAttendanceSessionInput {
  scheduledStartAt?: Date;
  scheduledEndAt?: Date;
  venueId?: string;
  attendanceMethod?: SessionAttendanceMethod;
}

export interface CreateLectureVenueInput {
  venueName: string;
  latitude: number;
  longitude: number;
  allowedRadius: number;
}

export interface UpdateLectureVenueInput {
  venueName?: string;
  latitude?: number;
  longitude?: number;
  allowedRadius?: number;
  isActive?: boolean;
}