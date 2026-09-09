"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Building2, GraduationCap, IdCard } from "lucide-react";

import { useNotification } from "@/context/NotificationContext";
import { getMyProfile } from "@/services/lecturerService";
import { LecturerProfile } from "@/types/lecturer";
import { PageHeader, Card, Skeleton } from "@/components/ui";

export default function LecturerProfilePage() {
  const [profile, setProfile] = useState<LecturerProfile | null>(null);
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
    <main className="p-8">
      <PageHeader title="Profile" subtitle="Your lecturer account details" />

      <div className="scroll-custom h-[calc(100vh-200px)] overflow-y-auto mt-19 max-w-lg">
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
                  {profile.firstName} {profile.lastName}
                </h2>
                <p className="text-gray-500 text-sm">Lecturer</p>
              </div>
            </div>

            <div className="mt-6 space-y-4 text-sm text-gray-700">
              <div className="flex items-center gap-3">
                <IdCard size={18} className="text-gray-400" />
                <span>{profile.staffNumber}</span>
              </div>

              <div className="flex items-center gap-3">
                <Building2 size={18} className="text-gray-400" />
                <span>{profile.department}</span>
              </div>

              <div className="flex items-center gap-3">
                <GraduationCap size={18} className="text-gray-400" />
                <span>{profile.faculty}</span>
              </div>
            </div>
          </Card>
        )}
      </div>
    </main>
  );
}