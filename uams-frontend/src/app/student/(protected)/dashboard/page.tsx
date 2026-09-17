"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { BookOpen, CheckCircle2, XCircle } from "lucide-react";

import { useNotification } from "@/context/NotificationContext";
import { getMyAttendance } from "@/services/analyticsService";
import { StudentAttendanceStats } from "@/types/analytics";
import { PageHeader, EmptyState, Card, Badge } from "@/components/ui";
import StudentDashboardSkeleton from "@/components/student/StudentDashboardSkeleton";

function rateVariant(rate: number): "success" | "warning" | "danger" {
  if (rate >= 75) return "success";
  if (rate >= 50) return "warning";
  return "danger";
}

export default function StudentDashboardPage() {
  const [stats, setStats] = useState<StudentAttendanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { notify } = useNotification();
  const router = useRouter();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await getMyAttendance();
        setStats(data);
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 401) {
            router.push("/login");
            return;
          }
          notify(
            "error",
            error.response?.data?.message ?? "Failed to load attendance"
          );
        } else {
          notify("error", "Failed to load attendance");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [router, notify]);

  return (
    <main className="px-4 py-8 md:p-8">
      <PageHeader
        title="Dashboard"
        subtitle="Your attendance across enrolled courses"
        className="left-2 right-2 lg:left-2"
      />

      <div className="scroll-custom h-[calc(100vh-200px)] overflow-y-auto mt-10 pt-5 md:mt-20">
        {loading ? (
          <StudentDashboardSkeleton />
        ) : !stats || stats.courses.length === 0 ? (
          <EmptyState
            title="No Courses Yet"
            description="You are not enrolled in any courses yet. Contact an administrator if this seems wrong."
          />
        ) : (
          <>
            <Card className="mb-6 max-w-sm">
              <p className="text-gray-500 text-sm">
                Overall attendance rate
              </p>
              <div className="mt-2 flex items-center gap-3">
                <p className="text-3xl font-bold">
                  {stats.overallAttendanceRate}%
                </p>
                <Badge variant={rateVariant(stats.overallAttendanceRate)}>
                  {rateVariant(stats.overallAttendanceRate) === "success"
                    ? "Good standing"
                    : rateVariant(stats.overallAttendanceRate) === "warning"
                    ? "At risk"
                    : "Low attendance"}
                </Badge>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stats.courses.map((course) => (
                <Card key={course.courseCode}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-blue-700">
                        {course.courseCode}
                      </h2>
                      <p className="text-gray-700 mt-1">
                        {course.courseTitle}
                      </p>
                    </div>
                    <Badge variant={rateVariant(course.attendanceRate)}>
                      {course.attendanceRate}%
                    </Badge>
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <BookOpen size={16} />
                      <span>{course.totalClasses} classes held</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-green-600" />
                      <span>{course.classesAttended} attended</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <XCircle size={16} className="text-red-500" />
                      <span>{course.classesMissed} missed</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}