"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { BarChart3, Users2 } from "lucide-react";

import { useNotification } from "@/context/NotificationContext";
import { getCourses } from "@/services/courseService";
import { getStudents } from "@/services/studentService";
import { getCourseAnalytics, getStudentAnalytics } from "@/services/analyticsService";

import { Course } from "@/types/course";
import { Student } from "@/types/student";
import { CourseAttendanceStats, StudentAttendanceStats } from "@/types/analytics";

import { PageHeader, Card, Select, EmptyState, Skeleton, Badge } from "@/components/ui";

export default function AnalyticsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const [courseId, setCourseId] = useState("");
  const [courseStats, setCourseStats] = useState<CourseAttendanceStats | null>(null);
  const [loadingCourseStats, setLoadingCourseStats] = useState(false);

  const [studentId, setStudentId] = useState("");
  const [studentStats, setStudentStats] = useState<StudentAttendanceStats | null>(null);
  const [loadingStudentStats, setLoadingStudentStats] = useState(false);

  const { notify } = useNotification();

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoadingOptions(true);
        const [coursesRes, studentsRes] = await Promise.all([
          getCourses({ limit: 1000 }),
          getStudents({ limit: 1000 }),
        ]);
        setCourses(coursesRes.data);
        setStudents(studentsRes.data);
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

  useEffect(() => {
    if (!courseId) {
      (() => setCourseStats(null))();
      return;
    }

    const fetchStats = async () => {
      try {
        setLoadingCourseStats(true);
        const data = await getCourseAnalytics(courseId);
        setCourseStats(data);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          notify(
            "error",
            error.response?.data?.message ?? "Failed to load course analytics"
          );
        }
      } finally {
        setLoadingCourseStats(false);
      }
    };

    fetchStats();
  }, [courseId, notify]);

  useEffect(() => {
    if (!studentId) {
      (() => setStudentStats(null))();
      return;
    }

    const fetchStats = async () => {
      try {
        setLoadingStudentStats(true);
        const data = await getStudentAnalytics(studentId);
        setStudentStats(data);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          notify(
            "error",
            error.response?.data?.message ?? "Failed to load student analytics"
          );
        }
      } finally {
        setLoadingStudentStats(false);
      }
    };

    fetchStats();
  }, [studentId, notify]);

  return (
    <main className="p-8">
      <PageHeader
        title="Analytics"
        subtitle="Drill into attendance performance by course or by student"
      />

      <div className="scroll-custom h-[calc(100vh-200px)] overflow-y-auto mt-19 space-y-6">
        {/* Course analytics */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={18} className="text-blue-700" />
            <h3 className="font-semibold text-gray-900">Course Analytics</h3>
          </div>

          {loadingOptions ? (
            <Skeleton className="h-20 rounded-xl" />
          ) : (
            <Select
              label="Course"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="max-w-md"
            >
              <option value="">Select a course</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.courseCode} — {course.courseTitle} (
                  {course.academicSessionId.sessionName})
                </option>
              ))}
            </Select>
          )}

          <div className="mt-5">
            {!courseId ? (
              <p className="text-sm text-gray-500">
                Select a course to see its attendance breakdown.
              </p>
            ) : loadingCourseStats ? (
              <Skeleton className="h-24 rounded-xl" />
            ) : !courseStats ? (
              <EmptyState
                title="No Data"
                description="No attendance records found for this course yet."
              />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatBlock
                  label="Total Records"
                  value={courseStats.totalAttendanceRecords}
                />
                <StatBlock
                  label="Present"
                  value={courseStats.presentCount}
                  variant="success"
                />
                <StatBlock
                  label="Absent"
                  value={courseStats.absentCount}
                  variant="danger"
                />
                <StatBlock
                  label="Attendance Rate"
                  value={`${courseStats.attendanceRate}%`}
                  variant="primary"
                />
              </div>
            )}
          </div>
        </Card>

        {/* Student analytics */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Users2 size={18} className="text-blue-700" />
            <h3 className="font-semibold text-gray-900">Student Analytics</h3>
          </div>

          {loadingOptions ? (
            <Skeleton className="h-20 rounded-xl" />
          ) : (
            <Select
              label="Student"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="max-w-md"
            >
              <option value="">Select a student</option>
              {students.map((student) => (
                <option key={student._id} value={student._id}>
                  {student.firstName} {student.lastName} —{" "}
                  {student.matricNumber}
                </option>
              ))}
            </Select>
          )}

          <div className="mt-5">
            {!studentId ? (
              <p className="text-sm text-gray-500">
                Select a student to see their per-course attendance.
              </p>
            ) : loadingStudentStats ? (
              <Skeleton className="h-24 rounded-xl" />
            ) : !studentStats || studentStats.courses.length === 0 ? (
              <EmptyState
                title="No Data"
                description="No attendance records found for this student yet."
              />
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">
                    Overall Attendance Rate
                  </span>
                  <Badge variant="primary">
                    {studentStats.overallAttendanceRate}%
                  </Badge>
                </div>

                <div className="overflow-hidden rounded-xl border border-gray-200">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-left text-gray-500">
                      <tr>
                        <th className="px-4 py-3">Course</th>
                        <th className="px-4 py-3">Attended</th>
                        <th className="px-4 py-3">Missed</th>
                        <th className="px-4 py-3">Rate</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                      {studentStats.courses.map((course) => (
                        <tr key={course.courseCode}>
                          <td className="px-4 py-3 font-medium text-gray-700">
                            {course.courseCode} — {course.courseTitle}
                          </td>
                          <td className="px-4 py-3">
                            {course.classesAttended}/{course.totalClasses}
                          </td>
                          <td className="px-4 py-3">
                            {course.classesMissed}
                          </td>
                          <td className="px-4 py-3">
                            {course.attendanceRate}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </main>
  );
}

function StatBlock({
  label,
  value,
  variant = "secondary",
}: {
  label: string;
  value: string | number;
  variant?: "success" | "danger" | "primary" | "secondary";
}) {
  return (
    <div className="rounded-xl border border-gray-200 p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1">
        <Badge variant={variant}>{value}</Badge>
      </p>
    </div>
  );
}