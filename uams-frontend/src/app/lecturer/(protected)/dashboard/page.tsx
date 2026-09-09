"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Users, ClipboardCheck, ArrowRight } from "lucide-react";

import { useNotification } from "@/context/NotificationContext";
import { getMyDashboard } from "@/services/lecturerService";
import { LecturerDashboardCourse } from "@/types/lecturer";
import { PageHeader, EmptyState, Card, Button } from "@/components/ui";
import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";

export default function LecturerDashboardPage() {
  const [courses, setCourses] = useState<LecturerDashboardCourse[] | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const { notify } = useNotification();
  const router = useRouter();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const data = await getMyDashboard();
        setCourses(data);
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 401) {
            router.push("/login");
            return;
          }
          notify(
            "error",
            error.response?.data?.message ?? "Failed to load dashboard"
          );
        } else {
          notify("error", "Failed to load dashboard");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [router, notify]);

  const averageRate = (course: LecturerDashboardCourse) => {
    if (course.students.length === 0) return 0;
    const sum = course.students.reduce(
      (acc, s) => acc + s.attendanceRate,
      0
    );
    return Number((sum / course.students.length).toFixed(2));
  };

  return (
    <main className="p-8">
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your assigned courses and attendance"
      />

      <div className="scroll-custom h-[calc(100vh-200px)] overflow-y-auto mt-19">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <DashboardSkeleton key={index} />
            ))}
          </div>
        ) : !courses || courses.length === 0 ? (
          <EmptyState
            title="No Courses Assigned"
            description="You have not been assigned to any courses yet. Contact an administrator if this seems wrong."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card key={course.courseId}>
                <h2 className="text-lg font-bold text-blue-700">
                  {course.courseTitle}
                </h2>

                <div className="mt-4 space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Users size={16} />
                    <span>{course.totalStudents} {course.totalStudents === 1 ? "student" : "students"}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <ClipboardCheck size={16} />
                    <span>
                      {course.totalAttendanceRecords} {course.totalAttendanceRecords === 1 ? "attendance record" : "attendance records"}
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-gray-500 text-sm">
                    Avg. attendance rate
                  </p>
                  <p className="text-2xl font-bold">
                    {averageRate(course)}%
                  </p>
                </div>

                <div className="mt-6">
                  <Link href={`/lecturer/attendance/${course.courseId}`}>
                    <Button
                      variant="primary"
                      fullWidth
                      rightIcon={<ArrowRight size={16} />}
                    >
                      Take Attendance
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}