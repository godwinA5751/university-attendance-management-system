"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

import axios from "axios";

import { Plus } from "lucide-react";

import { Course } from "@/types/course";
import { AcademicSession } from "@/types/academicSession";

import {
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse 
} from "@/services/courseService";

import { useNotification } from "@/context/NotificationContext";

import { getAcademicSessions } from "@/services/academicSessionService";

import CourseAssignmentModal from "@/components/course/CourseAssignmentModal";
import CourseCard from "@/components/course/CourseCard";
import CourseForm from "@/components/course/CourseForm";
import CourseFilters from "@/components/course/CourseFilters";
import CourseSkeleton from "@/components/course/CourseSkeleton";

import {
  Button,
  Modal,
  EmptyState,
  PageHeader,
  ConfirmDialog 
} from "@/components/ui";

import { CreateCourseInput } from "@/types/course";

export default function CoursesPage() {
  const navigate = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [sessions, setSessions] = useState<AcademicSession[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [showModal, setShowModal] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] =
    useState("");
  const [assignmentOpen, setAssignmentOpen] =
    useState(false);
  
  const [selectedCourse, setSelectedCourse] =
    useState<Course | null>(null);
  
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("");
  const [semester, setSemester] = useState("");
  const [academicSessionId, setAcademicSessionId] =
    useState("");
  const [editingCourse, setEditingCourse] =
    useState<Course | null>(null);
  
  const { notify } = useNotification();
  
  const [page, setPage] = useState(1);
  
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
  
      const response = await getCourses({
        page,
        search,
        level: level ? Number(level) : undefined,
        semester: semester as "First" | "Second" | undefined,
        academicSessionId:
          academicSessionId || undefined,
      });
  
      setCourses(response.data);
      setPagination(response.pagination);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          navigate.push("/login");
          return;
        }
        notify(
          "error",
          error.response?.data?.message ??
            "Failed to fetch courses."
        );
      } else {
        notify(
          "error",
          "Failed to fetch courses."
        );
      }
    } finally {
      setLoading(false);
    }
  }, [
    page,
    search,
    level,
    semester,
    academicSessionId,
    notify,
    navigate
  ]);

  const fetchSessions = useCallback(async () => {
    try {
      const sessions =
        await getAcademicSessions();
  
      setSessions(sessions);
    } catch {
      notify(
        "error",
        "Failed to fetch academic sessions."
      );
    }
  }, [notify]);

  useEffect(() => {
    const loadSessions = async () => {
      await fetchSessions();
    };
  
    loadSessions();
  }, [fetchSessions]);
  
  useEffect(() => {
    const loadCourses = async () => {
      await fetchCourses();
    };
  
    loadCourses();
  }, [fetchCourses]);

  const handleCreate = async (data: CreateCourseInput) => {
    try {
      setSaving(true);
  
      await createCourse(data);
  
      notify(
        "success",
        "Course created successfully."
      );
      
      setShowModal(false);
  
      await fetchCourses();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        notify(
          "error",
          error.response?.data?.message ??
            "Failed to create course."
        );
      } else {
         notify("error", "Failed to create course.");
       }
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (
    data: CreateCourseInput
  ) => {
    if (!editingCourse) return;
  
    try {
      setSaving(true);
  
      await updateCourse(
        editingCourse._id,
        data
      );
  
      notify(
        "success",
        "Course updated successfully."
      );
  
      setShowModal(false);
      setEditingCourse(null);
  
      await fetchCourses();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        notify(
          "error",
          error.response?.data?.message ??
            "Failed to update course."
        );
      } else {
        notify(
          "error",
          "Failed to update course."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (
    courseId: string
  ) => {
    try {
      await deleteCourse(courseId);
  
      notify(
        "success",
        "Course deleted successfully."
      );
  
      const isLastItemOnPage =
        courses.length === 1;
  
      const isNotFirstPage =
        page > 1;
  
      if (
        isLastItemOnPage &&
        isNotFirstPage
      ) {
        setPage((prev) => prev - 1);
      } else {
        await fetchCourses();
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        notify(
          "error",
          error.response?.data?.message ??
            "Failed to delete course."
        );
      } else {
        notify(
          "error",
          "Failed to delete course."
        );
      }
    }
  };
  
  const handleResetFilters = () => {
    setSearch("");
    setLevel("");
    setSemester("");
    setAcademicSessionId("");
    setPage(1);
  };
  
  return (
    <main className="p-8">
      <PageHeader
        title="Courses"
        subtitle="Manage all courses."
        action={
          <Button
            leftIcon={<Plus size={18} />}
            onClick={() => {
              setEditingCourse(null);
              setShowModal(true);
            }}
          >
            New Course
          </Button>
        }
      />
      <div className="scroll-custom h-[calc(100vh-200px)] overflow-y-auto mt-19">
        <CourseFilters
          search={search}
          level={level}
          semester={semester}
          academicSessionId={academicSessionId}
          sessions={sessions}
          onSearchChange={setSearch}
          onLevelChange={(value) => {
            setLevel(value);
            setPage(1);
          }}
          onSemesterChange={(value) => {
            setSemester(value);
            setPage(1);
          }}
          onSessionChange={(value) => {
            setAcademicSessionId(value);
            setPage(1);
          }}
          onReset={handleResetFilters}
        />
    
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <CourseSkeleton key={index} />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <EmptyState
            title="No Courses"
            description="Create your first course."
            action={
              <Button
                leftIcon={<Plus size={18} />}
                onClick={() => setShowModal(true)}
              >
                New Course
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {courses.map((course) => (
              <CourseCard
                key={course._id}
                course={course}
                onEdit={() => {
                  setEditingCourse(course);
                  setShowModal(true);
                }}
                onDelete={() => {
                  setSelectedCourseId(course._id);
                  setConfirmOpen(true);
                }}
                onAssignLecturers={() => {
                    setSelectedCourse(course);
                    setAssignmentOpen(true);
                }}
              />
            ))}
          </div>
        )}
  
        <Modal
          open={showModal}
          title={
            editingCourse
              ? "Edit Course"
              : "New Course"
          }
          description={
            editingCourse
              ? "Edit course details."
              : "Create a new course."
          }
          onClose={() => {
              setShowModal(false);
              setEditingCourse(null);
          }}
        >
          <CourseForm
              loading={saving}
              sessions={sessions}
              initialValues={
                  editingCourse
                      ? {
                          courseCode:
                            editingCourse.courseCode,
                          courseTitle:
                            editingCourse.courseTitle,
                          unit: editingCourse.unit,
                          level: editingCourse.level,
                          semester:
                            editingCourse.semester,
                          academicSessionId:
                            editingCourse
                              .academicSessionId._id,
                        }
                      : undefined
              }
              onSubmit={
                  editingCourse
                      ? handleUpdate
                      : handleCreate
              }
          />
  
        </Modal>
        
        <CourseAssignmentModal
          open={assignmentOpen}
          course={selectedCourse}
          onClose={() => {
            setAssignmentOpen(false);
            setSelectedCourse(null);
          }}
          onSaved={fetchCourses}
        />
  
        <ConfirmDialog
          open={confirmOpen}
          title="Delete Course"
          description="This action cannot be undone."
          confirmText="Delete"
          confirmVariant="danger"
          onCancel={() => {
            setConfirmOpen(false);
            setSelectedCourseId("");
          }}
          onConfirm={async () => {
            if (!selectedCourseId) return;
        
            await handleDelete(selectedCourseId);
        
            setConfirmOpen(false);
            setSelectedCourseId("");
          }}
        />
    
        {!loading && pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
    
            <Button
              variant="secondary"
              disabled={page === 1}
              onClick={() =>
                setPage((prev) => prev - 1)
              }
            >
              Previous
            </Button>
    
            <span className="text-sm text-gray-600">
              Page {pagination.page} of{" "}
              {pagination.totalPages}
            </span>
    
            <Button
              variant="secondary"
              disabled={
                page === pagination.totalPages
              }
              onClick={() =>
                setPage((prev) => prev + 1)
              }
            >
              Next
            </Button>
    
          </div>
        )}
      </div>
    </main>
  );
}