"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Check, X, Clock, MinusCircle } from "lucide-react";

import { useNotification } from "@/context/NotificationContext";
import { getCourses } from "@/services/courseService";
import { getCourseEnrollments } from "@/services/attendanceService";

import { Course } from "@/types/course";
import { EnrolledStudent, AttendanceStatus } from "@/types/attendance";

import {
  PageHeader,
  Card,
  Select,
  Input,
  Badge,
  EmptyState,
  Skeleton,
} from "@/components/ui";

function todayISODate() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60 * 1000);
  return local.toISOString().split("T")[0];
}

const STATUS_BADGE: Record<AttendanceStatus | "unmarked", { label: string; variant: "success" | "danger" | "warning" | "secondary"; icon: typeof Check }> = {
  present: { label: "Present", variant: "success", icon: Check },
  late: { label: "Late", variant: "warning", icon: Clock },
  absent: { label: "Absent", variant: "danger", icon: X },
  unmarked: { label: "Not Marked", variant: "secondary", icon: MinusCircle },
};

export default function AttendancePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState("");
  const [date, setDate] = useState(todayISODate());

  const [loadingCourses, setLoadingCourses] = useState(true);
  const [students, setStudents] = useState<EnrolledStudent[] | null>(null);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const { notify } = useNotification();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoadingCourses(true);
        const res = await getCourses({ limit: 1000 });
        setCourses(res.data);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          notify(
            "error",
            error.response?.data?.message ?? "Failed to load courses"
          );
        }
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchCourses();
  }, [notify]);

  const fetchStudents = useCallback(async () => {
    if (!courseId) return;

    try {
      setLoadingStudents(true);
      const data = await getCourseEnrollments(courseId, date);
      setStudents(data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        notify(
          "error",
          error.response?.data?.message ?? "Failed to load attendance"
        );
      }
    } finally {
      setLoadingStudents(false);
    }
  }, [courseId, date, notify]);

  useEffect(() => {
    (() => fetchStudents)();
  }, [fetchStudents]);

  return (
    <main className="p-8">
      <PageHeader
        title="Attendance"
        subtitle="View recorded attendance for a course on a given date"
      />

      <div className="scroll-custom h-[calc(100vh-200px)] overflow-y-auto mt-19 space-y-6">
        <Card>
          {loadingCourses ? (
            <Skeleton className="h-20 rounded-xl" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Course"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
              >
                <option value="">Select a course</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.courseCode} — {course.courseTitle} (
                    {course.academicSessionId.sessionName})
                  </option>
                ))}
              </Select>

              <Input
                type="date"
                label="Date"
                value={date}
                max={todayISODate()}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          )}
        </Card>

        {!courseId ? (
          <EmptyState
            title="Select a Course"
            description="Choose a course and date above to view attendance records."
          />
        ) : loadingStudents ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-14 rounded-xl" />
            ))}
          </div>
        ) : !students || students.length === 0 ? (
          <EmptyState
            title="No Students Enrolled"
            description="There are no active enrollments for this course."
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-500">
                <tr>
                  <th className="px-4 py-3">Matric No.</th>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {students.map((student) => {
                  const badge =
                    STATUS_BADGE[student.status ?? "unmarked"];
                  const Icon = badge.icon;

                  return (
                    <tr key={student.enrollmentId}>
                      <td className="px-4 py-3 font-medium text-gray-700">
                        {student.matricNumber}
                      </td>
                      <td className="px-4 py-3">{student.studentName}</td>
                      <td className="px-4 py-3">
                        <Badge variant={badge.variant}>
                          <Icon size={12} className="mr-1" />
                          {badge.label}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}