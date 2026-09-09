"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { UserPlus } from "lucide-react";

import { useNotification } from "@/context/NotificationContext";
import { getStudents } from "@/services/studentService";
import { getCourses } from "@/services/courseService";
import { createEnrollment } from "@/services/enrollmentService";
import { getCourseEnrollments } from "@/services/attendanceService";

import { Student } from "@/types/student";
import { Course } from "@/types/course";
import { EnrolledStudent } from "@/types/attendance";

import {
  PageHeader,
  Card,
  Select,
  Button,
  EmptyState,
  Skeleton,
} from "@/components/ui";

export default function EnrollmentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  const [studentId, setStudentId] = useState("");
  const [courseId, setCourseId] = useState("");

  const [loadingOptions, setLoadingOptions] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [enrolled, setEnrolled] = useState<EnrolledStudent[] | null>(null);
  const [loadingEnrolled, setLoadingEnrolled] = useState(false);

  const { notify } = useNotification();

  const selectedCourse = useMemo(
    () => courses.find((c) => c._id === courseId) ?? null,
    [courses, courseId]
  );

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoadingOptions(true);

        const [studentsRes, coursesRes] = await Promise.all([
          getStudents({ limit: 1000 }),
          getCourses({ limit: 1000 }),
        ]);

        setStudents(studentsRes.data);
        setCourses(coursesRes.data);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          notify(
            "error",
            error.response?.data?.message ?? "Failed to load options"
          );
        }
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchOptions();
  }, [notify]);

  const fetchEnrolled = useCallback(
    async (id: string) => {
      try {
        setLoadingEnrolled(true);
        const data = await getCourseEnrollments(id);
        setEnrolled(data);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          notify(
            "error",
            error.response?.data?.message ??
              "Failed to load current enrollments"
          );
        }
      } finally {
        setLoadingEnrolled(false);
      }
    },
    [notify]
  );

  useEffect(() => {
    if (courseId) {
      (() => fetchEnrolled(courseId))();
    } else {
      (() => setEnrolled(null))();
    }
  }, [courseId, fetchEnrolled]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!studentId || !selectedCourse) {
      notify("error", "Select a student and a course");
      return;
    }

    try {
      setSubmitting(true);

      await createEnrollment({
        studentId,
        courseId: selectedCourse._id,
        academicSessionId: selectedCourse.academicSessionId._id,
      });

      notify("success", "Student enrolled successfully");
      setStudentId("");
      fetchEnrolled(selectedCourse._id);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        notify(
          "error",
          error.response?.data?.message ?? "Failed to enroll student"
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="p-8">
      <PageHeader
        title="Manual Enrollment"
        subtitle="Enroll a student into a course — for borrowed courses, carryovers, or corrections. Standard enrollment happens automatically on student creation and promotion."
      />

      <div className="scroll-custom h-[calc(100vh-200px)] overflow-y-auto mt-19 space-y-6">
        <Card className="max-w-2xl">
          {loadingOptions ? (
            <Skeleton className="h-40 rounded-xl" />
          ) : (
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <Select
                label="Student"
                required
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
              >
                <option value="">Select a student</option>
                {students.map((student) => (
                  <option key={student._id} value={student._id}>
                    {student.firstName} {student.lastName} —{" "}
                    {student.matricNumber}
                  </option>
                ))}
              </Select>

              <Select
                label="Course"
                required
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
              >
                <option value="">Select a course</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.courseCode} — {course.courseTitle} (Level{" "}
                    {course.level}, {course.academicSessionId.sessionName})
                  </option>
                ))}
              </Select>

              {selectedCourse && (
                <p className="md:col-span-2 text-sm text-gray-500">
                  Academic session:{" "}
                  <span className="font-medium text-gray-700">
                    {selectedCourse.academicSessionId.sessionName}
                  </span>{" "}
                  — derived from the selected course.
                </p>
              )}

              <div className="md:col-span-2">
                <Button
                  type="submit"
                  variant="primary"
                  loading={submitting}
                  leftIcon={<UserPlus size={16} />}
                >
                  Enroll Student
                </Button>
              </div>
            </form>
          )}
        </Card>

        {courseId && (
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">
              Currently Enrolled — {selectedCourse?.courseCode}
            </h3>

            {loadingEnrolled ? (
              <Skeleton className="h-32 rounded-xl" />
            ) : !enrolled || enrolled.length === 0 ? (
              <EmptyState
                title="No Enrollments Yet"
                description="No students are currently enrolled in this course."
              />
            ) : (
              <div className="overflow-hidden rounded-xl border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left text-gray-500">
                    <tr>
                      <th className="px-4 py-3">Matric No.</th>
                      <th className="px-4 py-3">Student</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {enrolled.map((student) => (
                      <tr key={student.enrollmentId}>
                        <td className="px-4 py-3 font-medium text-gray-700">
                          {student.matricNumber}
                        </td>
                        <td className="px-4 py-3">{student.studentName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}
      </div>
    </main>
  );
}