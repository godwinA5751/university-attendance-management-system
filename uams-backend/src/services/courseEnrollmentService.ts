import { CourseEnrollment } from "../models/CourseEnrollment.js";
import type { CreateCourseEnrollmentInput } from "../types/courseEnrollment.types.js";
import { Student } from "../models/Student.js";
import { Course } from "../models/Course.js";
import { AcademicSession } from "../models/AcademicSession.js";
import { Attendance } from "../models/Attendance.js";

export const createCourseEnrollment = async (
  input: CreateCourseEnrollmentInput
) => {
  const { studentId, courseId, academicSessionId } = input;

  // 1. Verify student exists
  const student = await Student.findById(studentId);
  if (!student) {
    throw new Error("Student not found");
  }

  // 2. Verify course exists
  const course = await Course.findById(courseId);
  if (!course) {
    throw new Error("Course not found");
  }

  // 3. Verify session exists
  const session = await AcademicSession.findById(academicSessionId);
  if (!session) {
    throw new Error("Academic session not found");
  }

  // 4. Prevent duplicate enrollment (VERY IMPORTANT)
  const existingEnrollment = await CourseEnrollment.findOne({
    studentId,
    courseId,
    academicSessionId,
  });

  if (existingEnrollment) {
    throw new Error("Student already enrolled in this course for this session");
  }

  // 5. Create enrollment
  const enrollment = new CourseEnrollment({
    studentId,
    courseId,
    academicSessionId,
    status: "active",
  });

  await enrollment.save();

  return enrollment;
};
/**
 * Returns active enrollments for a course, populated with student
 * name/matric, for use on the lecturer's "take attendance" screen.
 * Optionally reports whether each student already has an attendance
 * record for the given date.
 */
export const getEnrollmentsForCourse = async (
  courseId: string,
  dateTime?: string
) => {
  const course = await Course.findById(courseId);
  if (!course) {
    throw new Error("Course not found");
  }

  const enrollments = await CourseEnrollment.find({
    courseId,
    status: "active",
  }).populate({
    path: "studentId",
    populate: {
      path: "userId",
      select: "firstName lastName",
    },
  });

  let markedMap = new Map<string, string>();

  if (dateTime) {
    const day = new Date(dateTime);
    const startOfDay = new Date(day);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(day);
    endOfDay.setHours(23, 59, 59, 999);

    const enrollmentIds = enrollments.map((e) => e._id);

    const records = await Attendance.find({
      enrollmentId: { $in: enrollmentIds },
      dateTime: { $gte: startOfDay, $lte: endOfDay },
    });

    markedMap = new Map(
      records.map((r) => [r.enrollmentId.toString(), r.status])
    );
  }

  return enrollments
    .filter((e: any) => e.studentId && e.studentId.userId)
    .map((e: any) => {
      const student = e.studentId;
      const user = student.userId;

      return {
        enrollmentId: e._id,
        studentId: student._id,
        matricNumber: student.matricNumber,
        studentName: `${user.firstName} ${user.lastName}`,
        status: markedMap.get(e._id.toString()) ?? null,
      };
    });
};