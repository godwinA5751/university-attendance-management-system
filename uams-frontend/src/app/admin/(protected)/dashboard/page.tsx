"use client";

import { useEffect, useState } from "react";
import { useNotification } from "@/context/NotificationContext";
import axios from "axios";
import { useRouter } from "next/navigation";
import DashboardCard from "@/components/dashboard/DashboardCard";
import { DashboardData } from "@/types/dashboard";
import { getDashboardData } from "@/services/dashboardService";
import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";
import { PageHeader, EmptyState } from "@/components/ui";

const CARD_CONFIG: {
  title: string;
  key: keyof DashboardData;
}[] = [
  {
    title: "Academic Session",
    key: "academicSession",
  },
  {
    title: "Students",
    key: "totalStudents",
  },
  {
    title: "Courses",
    key: "totalCourses",
  },
  {
    title: "Enrollments",
    key: "totalEnrollments",
  },
  {
    title: "Lecturers",
    key: "totalLecturers",
  },
  {
    title: "Daily Attendance",
    key: "totalAttendance",
  },
  {
    title: "Daily Attendance Rate",
    key: "attendanceRate",
  },
];

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const {notify} = useNotification()
  const navigate = useRouter();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true)
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
            error.response?.data?.message ??
            "Failed to load dashboard"
          );
        } else {
          notify("error","Failed to load dashboard");
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {CARD_CONFIG.map((_, index) => (
                <DashboardSkeleton key={index} />
              ))}
            </div>
        ) : (
            !dashboard ? (
              <EmptyState
                title="No Dashboard Found"
                description="This may be caused by an internal error or a network issues."
              />
        ):(
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CARD_CONFIG.map((card) => (
              <DashboardCard
                key={card.key}
                title={card.title}
                value={dashboard[card.key]}
              />
            ))}
          </div>
            ))}
      </div>
    </main>
  );
}