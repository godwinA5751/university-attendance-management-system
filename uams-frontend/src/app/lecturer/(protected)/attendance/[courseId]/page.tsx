"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { Check, X, Clock } from "lucide-react";

import { useNotification } from "@/context/NotificationContext";
import { getCourseEnrollments, markAttendance } from "@/services/attendanceService";
import { EnrolledStudent, AttendanceStatus } from "@/types/attendance";
import { PageHeader, EmptyState, Button, Skeleton } from "@/components/ui";

function todayISODate() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60 * 1000);
  return local.toISOString().split("T")[0];
}

const STATUS_OPTIONS: {
  status: AttendanceStatus;
  label: string;
  icon: typeof Check;
  activeClass: string;
}[] = [
  {
    status: "present",
    label: "Present",
    icon: Check,
    activeClass: "bg-green-600 text-white border-green-600",
  },
  {
    status: "late",
    label: "Late",
    icon: Clock,
    activeClass: "bg-yellow-500 text-white border-yellow-500",
  },
  {
    status: "absent",
    label: "Absent",
    icon: X,
    activeClass: "bg-red-600 text-white border-red-600",
  },
];

export default function TakeAttendancePage() {
  const params = useParams<{ courseId: string }>();
  const courseId = params.courseId;

  const [date, setDate] = useState(todayISODate());
  const [students, setStudents] = useState<EnrolledStudent[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const { notify } = useNotification();
  const router = useRouter();

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCourseEnrollments(courseId, date);
      setStudents(data);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          router.push("/login");
          return;
        }
        notify(
          "error",
          error.response?.data?.message ?? "Failed to load students"
        );
      } else {
        notify("error", "Failed to load students");
      }
    } finally {
      setLoading(false);
    }
  }, [courseId, date, router, notify]);

  useEffect(() => {
    (() => fetchStudents())();
  }, [fetchStudents]);

  const handleMark = async (
    student: EnrolledStudent,
    status: AttendanceStatus
  ) => {
    if (student.status === status) return;

    setSavingId(student.enrollmentId);

    try {
      await markAttendance({
        enrollmentId: student.enrollmentId,
        dateTime: date,
        status,
      });

      setStudents(
        (prev) =>
          prev?.map((s) =>
            s.enrollmentId === student.enrollmentId ? { ...s, status } : s
          ) ?? null
      );

      notify("success", `Marked ${student.studentName} as ${status}`);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        notify(
          "error",
          error.response?.data?.message ?? "Failed to mark attendance"
        );
      } else {
        notify("error", "Failed to mark attendance");
      }
    } finally {
      setSavingId(null);
    }
  };

  return (
    <main className="p-8">
      <PageHeader
        title="Take Attendance"
        subtitle="Mark attendance for enrolled students"
        action={
          <input
            type="date"
            value={date}
            max={todayISODate()}
            onChange={(e) => setDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        }
      />

      <div className="scroll-custom h-[calc(100vh-200px)] overflow-y-auto mt-19">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : !students || students.length === 0 ? (
          <EmptyState
            title="No Students Enrolled"
            description="There are no active enrollments for this course yet."
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-500">
                <tr>
                  <th className="px-4 py-3">Matric No.</th>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Attendance</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {students.map((student) => (
                  <tr key={student.enrollmentId}>
                    <td className="px-4 py-3 font-medium text-gray-700">
                      {student.matricNumber}
                    </td>

                    <td className="px-4 py-3">{student.studentName}</td>

                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {STATUS_OPTIONS.map((option) => {
                          const Icon = option.icon;
                          const isActive = student.status === option.status;
                          const isSaving =
                            savingId === student.enrollmentId;

                          return (
                            <Button
                              key={option.status}
                              variant="outline"
                              loading={isSaving && isActive}
                              disabled={
                                isSaving && !isActive ? true : undefined
                              }
                              onClick={() =>
                                handleMark(student, option.status)
                              }
                              leftIcon={<Icon size={14} />}
                              className={
                                isActive ? option.activeClass : ""
                              }
                            >
                              {option.label}
                            </Button>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}