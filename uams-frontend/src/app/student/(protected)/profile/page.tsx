"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Building2, GraduationCap, IdCard, CalendarDays } from "lucide-react";

import { useNotification } from "@/context/NotificationContext";
import { getMyProfile } from "@/services/studentService";
import { StudentProfile } from "@/types/student";
import { PageHeader, Card, Skeleton } from "@/components/ui";

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { notify } = useNotification();
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await getMyProfile();
        setProfile(data);
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 401) {
            router.push("/login");
            return;
          }
          notify(
            "error",
            error.response?.data?.message ?? "Failed to load profile"
          );
        } else {
          notify("error", "Failed to load profile");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router, notify]);

  return (
    <main className="px-4 py-8 md:p-8">
      <PageHeader title="Profile" subtitle="Your student account details"
      className="left-2 right-2 lg:left-4 lg:right-4" />

      <div className="scroll-custom h-[calc(100vh-240px)] overflow-y-auto mt-20 md:pt-5 max-w-lg">
        {loading ? (
          <Skeleton className="h-64 rounded-xl" />
        ) : !profile ? (
          <p className="text-gray-500">Unable to load profile.</p>
        ) : (
          <Card>
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-700">
                {profile.firstName[0]}
                {profile.lastName[0]}
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {profile.firstName}{" "}
                  {profile.middleName ? `${profile.middleName} ` : ""}
                  {profile.lastName}
                </h2>
                <p className="text-gray-500 text-sm">Student</p>
              </div>
            </div>

            <div className="mt-6 space-y-4 text-sm text-gray-700">
              <div className="flex items-center gap-3">
                <IdCard size={18} className="text-gray-400" />
                <span>{profile.matricNumber}</span>
              </div>

              <div className="flex items-center gap-3">
                <Building2 size={18} className="text-gray-400" />
                <span>{profile.department}</span>
              </div>

              <div className="flex items-center gap-3">
                <GraduationCap size={18} className="text-gray-400" />
                <span>
                  {profile.faculty} — {profile.currentLevel} Level
                </span>
              </div>

              <div className="flex items-center gap-3">
                <CalendarDays size={18} className="text-gray-400" />
                <span>Admitted {profile.admissionYear}</span>
              </div>
            </div>
          </Card>
        )}
      </div>
    </main>
  );
}