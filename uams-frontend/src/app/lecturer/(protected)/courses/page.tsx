"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GraduationCap, BookOpen, BookMarked, ClipboardCheck } from "lucide-react";

import { useNotification } from "@/context/NotificationContext";
import { getMyCourses } from "@/services/lecturerService";
import { LecturerCourse } from "@/types/lecturer";
import { PageHeader, EmptyState, Card, Button, Skeleton } from "@/components/ui";

export default function LecturerCoursesPage() {
  const [courses, setCourses] = useState<LecturerCourse[] | null>(null);
  const [loading, setLoading] = useState(true);
  const { notify } = useNotification();
  const router = useRouter();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const data = await getMyCourses();
        setCourses(data);
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 401) {
            router.push("/login");
            return;
          }
          notify(
            "error",
            error.response?.data?.message ?? "Failed to load courses"
          );
        } else {
          notify("error", "Failed to load courses");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [router, notify]);

  return (
    <main className="p-8">
      <PageHeader
        title="My Courses"
        subtitle="Courses assigned to you for the active session"
      />

      <div className="scroll-custom h-[calc(100vh-200px)] overflow-y-auto mt-19">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-52 rounded-xl" />
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
              <Card key={course._id}>
                <h2 className="text-lg font-bold text-blue-700">
                  {course.courseCode}
                </h2>

                <p className="text-gray-700 mt-1">{course.courseTitle}</p>

                <div className="mt-5 space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <GraduationCap size={16} />
                    <span>{course.level} Level</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <BookOpen size={16} />
                    <span>{course.semester} Semester</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <BookMarked size={16} />
                    <span>{course.unit} Units</span>
                  </div>
                </div>

                <div className="mt-6">
                  <Link href={`/lecturer/attendance/${course._id}`}>
                    <Button
                      variant="primary"
                      fullWidth
                      leftIcon={<ClipboardCheck size={16} />}
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