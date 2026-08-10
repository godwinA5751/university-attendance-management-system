"use client";

import { useCallback, useEffect, useState } from "react";
import { useNotification } from "@/context/NotificationContext";
import axios from "axios";
import { useRouter } from "next/navigation";

import { Plus } from "lucide-react"

import {
  Button,
  Modal,
  PageHeader,
  ConfirmDialog,
} from "@/components/ui";

import {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  promoteStudent,
} from "@/services/studentService";

import { getAcademicSessions } from "@/services/academicSessionService";
import { getCourses } from "@/services/courseService";

import StudentFilter from "@/components/student/StudentFilters";
import StudentForm from "@/components/student/StudentForm";
import StudentPromotionModal from "@/components/student/StudentPromotionModal";
import StudentTable from "@/components/student/StudentTable";

import { Student } from "@/types/student";
import { AcademicSession } from "@/types/academicSession";
import { Course } from "@/types/course";
import { CreateStudentInput } from "@/types/student";


export default function StudentsPage() {
  const navigate = useRouter
  const [students, setStudents] = useState<Student[]>([]);
  const [sessions, setSessions] = useState<AcademicSession[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [carryoverCourses, setCarryoverCourses] =
    useState<Course[]>([]);

  const { notify } = useNotification();
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [search, setSearch] = useState("");
  
  const [level, setLevel] = useState<number>();
  
  const [academicSessionId, setAcademicSessionId] =
    useState<string>();
  
  const [page, setPage] = useState(1);
  
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  const [studentModalOpen, setStudentModalOpen] =
    useState(false);
  
  const [promotionModalOpen, setPromotionModalOpen] =
    useState(false);
  
  const [selectedStudent, setSelectedStudent] =
    useState<Student | null>(null);
  
  const [editingStudent, setEditingStudent] =
    useState<Student | null>(null);
  
  const [deletingStudent, setDeletingStudent] =
    useState<Student | null>(null);
  
  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
  
      const res = await getStudents({
        page,
        limit: 10,
        search,
        level,
        academicSessionId,
      });
  
      setStudents(res.data);
      setPagination(res.pagination);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        notify(
          "error",
          error?.response?.data?.message ??
            "Failed to fetch students"
        );
        return;
      }
    } finally {
      setLoading(false);
    }
  }, [
    page,
    search,
    level,
    academicSessionId,
    notify
  ]);
  
  const fetchSessions = useCallback(async () => {
    try {
      const academicSession = await getAcademicSessions();
  
      setSessions(academicSession);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        notify(
          "error",
          error?.response?.data?.message ??
            "Failed to fetch academic sessions"
        );
        return;
      }
    }
  }, [notify]);
  
  const fetchCourses = useCallback(async () => {
    try {
      const res = await getCourses({
        limit: 1000,
      });
  
      setCourses(res.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        notify(
          "error",
          error?.response?.data?.message ??
            "Failed to fetch courses"
        );
        return;
      }
    }
  }, [notify]);

  const fetchCarryoverCourses = async (level: number) => {
    try {
      const res = await getCourses({
        maxLevel: level,
        limit: 1000,
      });
      setCarryoverCourses(res.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        notify(
          "error",
          error?.response?.data?.message ??
            "Failed to fetch carryover courses"
        );
        return;
    }
    };
  }
  
  useEffect(() => {
    setTimeout(() => {
      fetchStudents();
    }, 0);
  }, [fetchStudents]);
  
  useEffect(() => {
    setTimeout(() => {
      fetchSessions();
    }, 0);
    setTimeout(() => {
      fetchCourses();
    }, 0);
  }, [
    fetchSessions,
    fetchCourses,
  ]);

  const handleCloseStudentModal = () => {
    setStudentModalOpen(false);
    setEditingStudent(null);
  };
  
  const handleSubmitStudent = async (
    data: CreateStudentInput
  ) => {
    try {
      setSubmitting(true);
  
      if (editingStudent) {
        await updateStudent(editingStudent._id, data);
  
        notify(
          "success",
          "Student updated successfully"
        );
      } else {
        await createStudent(data);
  
        notify(
          "success",
          "Student created successfully"
        );
      }
  
      handleCloseStudentModal();
  
      fetchStudents();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        notify(
          "error",
          error.response?.data?.message ??
            "Operation failed"
        );
      }
    } finally {
      setSubmitting(false);
    }
  };
  
  const handlePromoteStudent = async ({
    newLevel,
    carryOverCourseIds,
  }: {
    newLevel: number;
    carryOverCourseIds: string[];
  }) => {
    if (!selectedStudent) return;
  
    try {
      setSubmitting(true);
  
      await promoteStudent(selectedStudent._id, {
        newLevel,
        carryOverCourseIds,
      });
  
      notify(
        "success",
        "Student promoted successfully"
      );
  
      setPromotionModalOpen(false);
  
      setSelectedStudent(null);
  
      fetchStudents();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        notify(
          "error",
          error?.response?.data?.message ??
            "Failed to promote student"
        );
        return;
      }
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };
  
  const handleSelectAll = () => {
    if (selectedIds.length === students.length) {
      setSelectedIds([]);
      return;
    }
  
    setSelectedIds(
      students.map((student) => student._id)
    );
  };
  
  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setStudentModalOpen(true);
  };
  
  const handleDelete = (student: Student) => {
    setDeletingStudent(student);
  };
  
  const confirmDeleteStudent = async () => {
    if (!deletingStudent) return;
  
    try {
      setSubmitting(true);
  
      await deleteStudent(deletingStudent._id);
  
      notify(
        "success",
        "Student deleted successfully"
      );
  
      setDeletingStudent(null);
  
      fetchStudents();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        notify(
          "error",
          error.response?.data?.message ??
            "Failed to delete student"
        );
      }
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleOpenPromotion = async (
    student: Student
  ) => {
    setSelectedStudent(student);
    const nextLevel = student.currentLevel + 100;

    try {
      const res = await getCourses({
        maxLevel: nextLevel,
        academicSessionId,
        limit: 1000,
      });
    
      setCourses(res.data);
      setPromotionModalOpen(true);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        notify(
          "error",
          error.response?.data?.message ??
            "Failed to fetch courses"
        );
      }
    }
  };
  
  const handleClosePromotion = () => {
    setPromotionModalOpen(false);
    setSelectedStudent(null);
  };
  
  return (
    <main className="p-8">
      <PageHeader
        title="Students"
        subtitle="Manage students and promotions."
        action={
          <Button
            onClick={() => setStudentModalOpen(true)}
            leftIcon={<Plus />}
          >
            New Student
          </Button>
        }
      />

      <div className="scroll-custom h-[calc(100vh-200px)] overflow-y-auto mt-19">
        <StudentFilter
          search={search}
          level={level}
          academicSessionId={academicSessionId}
          sessions={sessions}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          onLevelChange={(value) => {
            setLevel(value);
            setPage(1);
          }}
          onAcademicSessionChange={(value) => {
            setAcademicSessionId(value);
            setPage(1);
          }}
        />
    
        <StudentTable
          students={students}
          loading={loading}
          selectedIds={selectedIds}
          onSelect={handleSelect}
          onSelectAll={handleSelectAll}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onPromote={handleOpenPromotion}
          pagination={pagination}
          onPageChange={setPage}
          onEmptyState={setStudentModalOpen}
        />
    
        <Modal
          open={studentModalOpen}
          onClose={handleCloseStudentModal}
          title={
            editingStudent
              ? "Edit Student"
              : "Add Student"
          }
          
          description={
            editingStudent
              ? "Update student information."
              : "Register a new student."
          }
          size="lg"
        >
          <StudentForm
            loading={submitting}
            carryoverCourses={carryoverCourses}
            onLevelChange={fetchCarryoverCourses}
            initialValues={editingStudent ?? undefined}
            onSubmit={handleSubmitStudent}
          />
        </Modal>
    
        <StudentPromotionModal
          open={promotionModalOpen}
          loading={submitting}
          student={selectedStudent}
          courses={courses}
          onClose={handleClosePromotion}
          onSubmit={handlePromoteStudent}
        />
        
        <ConfirmDialog
          open={!!deletingStudent}
          title="Delete Student"
          description={`Are you sure you want to delete ${deletingStudent?.firstName} ${deletingStudent?.lastName}? This action cannot be undone.`}
          confirmText="Delete"
          loading={submitting}
          onCancel={() => setDeletingStudent(null)}
          onConfirm={confirmDeleteStudent}
        />
      </div>
    </main>
  );
}