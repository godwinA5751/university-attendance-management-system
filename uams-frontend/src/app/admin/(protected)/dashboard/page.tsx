"use client";

import { useEffect, useState } from "react";
import { useNotification } from "@/context/NotificationContext";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Users,
  BookOpen,
  UserCheck,
  ClipboardCheck,
  Percent,
} from "lucide-react";

import { DashboardData } from "@/types/dashboard";
import { getDashboardData } from "@/services/dashboardService";
import { PageHeader, EmptyState } from "@/components/ui";
import StatCard from "@/components/dashboard/StatCard";
import SessionBanner from "@/components/dashboard/SessionBanner";
import AdminDashboardSkeleton from "@/components/dashboard/AdminDashboardSkeleton";

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { notify } = useNotification();
  const navigate = useRouter();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const data = await getDashboardData();
        setDashboard(data);
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 401) {
            navigate.push("/login");
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
  }, [navigate, notify]);

  return (
    <main className="p-8">
      <PageHeader
        title="Dashboard"
        subtitle="Summary of all activities in the system"
      />

      <div className="scroll-custom h-[calc(100vh-200px)] overflow-y-auto mt-19">
        {loading ? (
          <AdminDashboardSkeleton />
        ) : !dashboard ? (
          <EmptyState
            title="No Dashboard Found"
            description="This may be caused by an internal error or a network issue."
          />
        ) : (
          <>
            <SessionBanner academicSession={dashboard.academicSession} />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              <StatCard
                label="Students"
                value={dashboard.totalStudents}
                icon={GraduationCap}
                accent="blue"
              />

              <StatCard
                label="Lecturers"
                value={dashboard.totalLecturers}
                icon={Users}
                accent="violet"
              />

              <StatCard
                label="Courses This Session"
                value={dashboard.totalCourses}
                icon={BookOpen}
                accent="blue"
              />

              <StatCard
                label="Enrollments This Session"
                value={dashboard.totalEnrollments}
                icon={UserCheck}
                accent="violet"
              />

              <StatCard
                label="Today's Attendance"
                value={dashboard.totalAttendance}
                icon={ClipboardCheck}
                accent="amber"
              />

              <StatCard
                label="Today's Attendance Rate"
                value={`${dashboard.attendanceRate}%`}
                icon={Percent}
                accent={
                  dashboard.attendanceRate >= 75
                    ? "green"
                    : dashboard.attendanceRate >= 50
                    ? "amber"
                    : "red"
                }
              />
            </div>
          </>
        )}
      </div>
    </main>
  );
}