"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import DashboardCard from "@/components/dashboard/DashboardCard";
import { DashboardData } from "@/types/dashboard";
import { getDashboardData } from "@/services/dashboardService";
import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";

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
  const [error, setError] = useState("");
  const navigate = useRouter();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await getDashboardData();
        setDashboard(data);
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 401) {
            navigate.push("/login");
            return;
          }
          setError(
            error.response?.data?.message ??
            "Failed to load dashboard"
          );
        } else {
          setError("Failed to load dashboard");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [navigate]);

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">
          Dashboard
        </h1>
  
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CARD_CONFIG.map((_, index) => (
            <DashboardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (!dashboard) {
    return <p>No dashboard data found.</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {CARD_CONFIG.map((card) => (
          <DashboardCard
            key={card.key}
            title={card.title}
            value={dashboard[card.key]}
          />
        ))}
      </div>
    </div>
  );
}