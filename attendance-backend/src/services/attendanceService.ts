import { CourseEnrollment } from "../models/CourseEnrollment.js";
import { Attendance } from "../models/Attendance.js";
import type { CreateAttendanceInput } from "../types/attendance.types.js";
import { Course } from "../models/Course.js";

export const getAttendanceByStudent = async (studentId: string) => {
  const enrollments = await CourseEnrollment.find({ studentId });

  const enrollmentIds = enrollments.map((e) => e._id);

  const attendance = await Attendance.find({
    enrollmentId: { $in: enrollmentIds },
  });

  return attendance;
};

export const getAttendanceByCourse = async (courseId: string) => {
  const enrollments = await CourseEnrollment.find({ courseId });

  const enrollmentIds = enrollments.map((e) => e._id);

  const attendance = await Attendance.find({
    enrollmentId: { $in: enrollmentIds },
  });

  return attendance;
};

export const getAttendanceByEnrollment = async (enrollmentId: string) => {
  const attendance = await Attendance.find({ enrollmentId });

  return attendance;
};

export const createAttendance = async (input: CreateAttendanceInput, lecturerId: string) => {
  const { enrollmentId, dateTime, status } = input;

  // 1. Check enrollment
  const enrollment = await CourseEnrollment.findById(enrollmentId);
  if (!enrollment) throw new Error("Enrollment not found");

  if (enrollment.status !== "active") {
    throw new Error("Cannot record attendance for inactive enrollment");
  }

  // 2. Check course
  const course = await Course.findById(enrollment.courseId);
  if (!course) throw new Error("Course not found");

  // 3. AUTH CHECK (NEW PART)
  const isLecturerAssigned = course.lecturerIds.some(
    (id) => id.toString() === lecturerId
  );

  if (!isLecturerAssigned) {
    throw new Error("Not authorized to mark attendance for this course");
  }

  // 4. Validate date
  const attendanceDate = new Date(dateTime);
  if (isNaN(attendanceDate.getTime())) {
    throw new Error("Invalid attendance date");
  }

  // 5. Prevent duplicates
  const duplicate = await Attendance.findOne({
    enrollmentId,
    dateTime: attendanceDate,
  });

  if (duplicate) {
    throw new Error("Attendance already recorded");
  }

  // 6. Create attendance
  const attendance = new Attendance({
    enrollmentId,
    dateTime: attendanceDate,
    status,
  });

  await attendance.save();

  return attendance;
};

export const getLecturerAttendanceReport = async (lecturerId: string) => {
  // 1. Get lecturer courses
  const courses = await Course.find({
    lecturerIds: lecturerId,
  });

  const courseIds = courses.map((c) => c._id);

  // 2. Get enrollments for these courses
  const enrollments = await CourseEnrollment.find({
    courseId: { $in: courseIds },
  });

  const enrollmentIds = enrollments.map((e) => e._id);

  // 3. Get attendance records
  const attendance = await Attendance.find({
    enrollmentId: { $in: enrollmentIds },
  });

  // 4. Build report per course
  const report = courses.map((course) => {
    const courseEnrollments = enrollments.filter(
      (e) => e.courseId.toString() === course._id.toString()
    );

    const courseEnrollmentIds = courseEnrollments.map((e) =>
      e._id.toString()
    );

    const courseAttendance = attendance.filter((a) =>
      courseEnrollmentIds.includes(a.enrollmentId.toString())
    );

    const presentCount = courseAttendance.filter(
      (a) => a.status === "present"
    ).length;

    const total = courseAttendance.length;

    const attendanceRate =
      total === 0 ? 0 : (presentCount / total) * 100;

    return {
      courseId: course._id,
      courseTitle: course.courseTitle,
      courseCode: course.courseCode,
      totalStudents: courseEnrollments.length,
      totalAttendanceRecords: total,
      attendanceRate: Number(attendanceRate.toFixed(2)),
    };
  });

  return report;
};