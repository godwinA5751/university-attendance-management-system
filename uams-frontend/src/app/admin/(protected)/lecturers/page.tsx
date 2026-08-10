"use client";

import { useCallback, useEffect, useState } from "react";
import { useNotification } from "@/context/NotificationContext";
import axios from "axios";

import { Plus } from "lucide-react"

import {
  Button,
  Modal,
  PageHeader,
  ConfirmDialog,
} from "@/components/ui";

import {
  getLecturers,
  createLecturer,
  updateLecturer,
  deleteLecturer,
} from "@/services/lecturerService";

import LecturerFilter from "@/components/lecturer/LecturerFilters";
import LecturerForm from "@/components/lecturer/LecturerForm";
import LecturerTable from "@/components/lecturer/LecturerTable";

import {
  Lecturer,
  CreateLecturerInput,
} from "@/types/lecturer";


export default function LecturersPage() {
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);

  const { notify } = useNotification();
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [search, setSearch] = useState("");
  
  const [page, setPage] = useState(1);
  
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  
  const [lecturerModalOpen, setLecturerModalOpen] =
    useState(false);
  
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  const [editingLecturer, setEditingLecturer] =
    useState<Lecturer | null>(null);
  
  const [deletingLecturer, setDeletingLecturer] =
    useState<Lecturer | null>(null);
  
  const fetchLecturers = useCallback(async () => {
    try {
      setLoading(true);
  
      const res = await getLecturers({
        page,
        limit: 10,
        search,
      });
  
      setLecturers(res.data);
      setPagination(res.pagination);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        notify(
          "error",
          error?.response?.data?.message ??
            "Failed to fetch lecturers"
        );
        return;
      }
    } finally {
      setLoading(false);
    }
  }, [
    page,
    search,
    notify
  ]);
  
  useEffect(() => {
    setTimeout(() => {
      fetchLecturers();
    }, 0);
  }, [fetchLecturers]);

  const handleCloseLecturerModal = () => {
    setLecturerModalOpen(false);
    setEditingLecturer(null);
  };
  
  const handleSubmitLecturer = async (
    data: CreateLecturerInput
  ) => {
    try {
      setSubmitting(true);
  
      if (editingLecturer) {
        await updateLecturer(editingLecturer._id, data);
  
        notify(
          "success",
          "Lecturer updated successfully"
        );
      } else {
        await createLecturer(data);

        notify(
          "success",
          "Lecturer created successfully"
        );
      }
  
      handleCloseLecturerModal();
  
      fetchLecturers();
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
  
  const handleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };
  
  const handleSelectAll = () => {
    if (selectedIds.length === lecturers.length) {
      setSelectedIds([]);
      return;
    }
  
    setSelectedIds(
      lecturers.map((lecturer) => lecturer._id)
    );
  };
  
  const handleEdit = (lecturer: Lecturer) => {
    setEditingLecturer(lecturer);
    setLecturerModalOpen(true);
  };
  
  const handleDelete = (lecturer: Lecturer) => {
    setDeletingLecturer(lecturer);
  };
  
  const confirmDeleteLecturer = async () => {
    if (!deletingLecturer) return;
  
    try {
      setSubmitting(true);
  
      await deleteLecturer(deletingLecturer._id);
  
      notify(
        "success",
        "Lecturer deleted successfully"
      );
  
      setDeletingLecturer(null);
  
      fetchLecturers();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        notify(
          "error",
          error.response?.data?.message ??
            "Failed to delete lecturer"
        );
      }
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <main className="p-8">
      <PageHeader
        title="Lecturers"
        subtitle="Manage lecturers."
        action={
          <Button
            onClick={() => setLecturerModalOpen(true)}
            leftIcon={<Plus />}
          >
            New Lecturer
          </Button>
        }
      />

      <div className="scroll-custom h-[calc(100vh-200px)] overflow-y-auto mt-19">
        <LecturerFilter
          search={search}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
        />
    
        <LecturerTable
          lecturers={lecturers}
          loading={loading}
          selectedIds={selectedIds}
          onSelect={handleSelect}
          onSelectAll={handleSelectAll}
          onEdit={handleEdit}
          onDelete={handleDelete}
          pagination={pagination}
          onPageChange={setPage}
          onEmptyState={setLecturerModalOpen}
        />
    
        <Modal
          open={lecturerModalOpen}
          onClose={handleCloseLecturerModal}
          title={
            editingLecturer
              ? "Edit Lecturer"
              : "Add Lecturer"
          }
          
          description={
            editingLecturer
              ? "Update lecturer information."
              : "Register a new lecturer."
          }
          size="lg"
        >
          <LecturerForm
            loading={submitting}
            initialValues={editingLecturer ?? undefined}
            onSubmit={handleSubmitLecturer}
          />
        </Modal>
        
        <ConfirmDialog
          open={!!deletingLecturer}
          title="Delete Lecturer"
          description={`Are you sure you want to delete ${deletingLecturer?.firstName} ${deletingLecturer?.lastName}? This action cannot be undone.`}
          confirmText="Delete"
          loading={submitting}
          onCancel={() => setDeletingLecturer(null)}
          onConfirm={confirmDeleteLecturer}
        />
      </div>
    </main>
  );
}