"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

import axios from "axios";

import {
  Curriculum,
  CreateCurriculumInput,
} from "@/types/curriculum";

import {
  getCurriculum,
  createCurriculum,
  updateCurriculum,
  deleteCurriculum,
} from "@/services/curriculumService";

import CurriculumCard from "@/components/curriculum/CurriculumCard";
import CurriculumForm from "@/components/curriculum/CurriculumForm";
import CurriculumSkeleton from "@/components/curriculum/CurriculumSkeleton";

import {
  Button,
  Modal,
  PageHeader,
  EmptyState,
  ConfirmDialog,
} from "@/components/ui";
import { useNotification } from "@/context/NotificationContext";

import { Plus } from "lucide-react";

export default function CurriculumPage() {
  const navigate = useRouter();
  const [curriculum, setCurriculum] = useState<Curriculum[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<
    "delete" | null
  >(null);
  const [editingCurriculum, setEditingCurriculum] = useState<Curriculum | null>(null);
  const [selectedId, setSelectedId] = useState("");
  const { notify } = useNotification();
  const [sessionCount, setSessionCount] = useState(() => {
    const cached = localStorage.getItem('curriculumCount');
    return cached ? parseInt(cached, 10) : 4; // fallback default
  });
  
  useEffect(() => {
    if (curriculum.length > 0) {
      setTimeout(() => {
        setSessionCount(curriculum.length);
        localStorage.setItem('curriculumCount', curriculum.length.toString());
      }, 0);
    }
  }, [curriculum]);

  const fetchCurriculum = useCallback(async () => {
    try {
      setLoading(true);

      const data = await getCurriculum();

      setCurriculum(data);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          navigate.push("/login");
          return;
        }
        notify(
          "error",
          error.response?.data?.message ??
            "Failed to fetch curriculum."
        );
      } else {
        notify(
          "error",
          "Failed to fetch curriculum."
        );
      }
    } finally {
      setLoading(false);
    }
  }, [notify, navigate]);

  useEffect(() => {
    setTimeout(() => {
      fetchCurriculum();
    }, 0);
  }, [fetchCurriculum]);

  const handleCreate = async (
    data: CreateCurriculumInput
  ) => {
    try {
      setCreating(true);

      await createCurriculum(data);
      
      notify(
        "success",
        "Curriculum created successfully."
      );
      
      setShowModal(false);
      
      await fetchCurriculum();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        notify(
          "error",
          error.response?.data?.message ??
            "Failed to create curriculum."
        );
      } else {
        notify(
          "error",
          "Failed to create curriculum."
        );
      }
    } finally {
      setCreating(false);
    }
  };

  const handleUpdate = async (
      data: CreateCurriculumInput
    ) => {
      if (!editingCurriculum) return;
    
      try {
        setLoading(true);
    
        await updateCurriculum(
          editingCurriculum._id,
          data
        );
    
        notify(
          "success",
          "Curriculum updated successfully."
        );
    
        setShowModal(false);
        setEditingCurriculum(null);
    
        await fetchCurriculum();
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          notify(
            "error",
            error.response?.data?.message ??
              "Failed to update curriculum."
          );
        } else {
          notify(
            "error",
            "Failed to update curriculum."
          );
        }
      } finally {
        setLoading(false);
      }
    };

  const handleDelete = async (id: string) => {

    try {
      await deleteCurriculum(id);

      notify(
        "success",
        "Curriculum deleted successfully."
      );
      
      await fetchCurriculum();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        notify(
          "error",
          error.response?.data?.message ??
            "Deletion failed."
        );
      } else {
        notify(
          "error",
          "Deletion failed."
        );
      }
    }
  };

  return (
    <main className="p-4">
      <PageHeader
        title="Curriculum"
        subtitle="Manage academic curriculum."
      
        action={
          <Button
              leftIcon={<Plus size={18} />}
              onClick={() => setShowModal(true)}
          >
              New Curriculum
          </Button>
        }
      />
      <div className="scroll-custom h-[calc(100vh-200px)] overflow-y-auto mt-30">
        {loading ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {Array.from({ length: sessionCount }).map((_, index) => (
              <CurriculumSkeleton key={index}/>
            ))}
          </div>
        ) : (
          curriculum.length === 0 ? (
            <EmptyState
              title="No Curricula"
              description="Create your first curriculum."
          
              action={
                <Button
                    leftIcon={<Plus size={18} />}
                    onClick={() => setShowModal(true)}
                >
                    New Curriculum
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {curriculum.map((curriculumItem) => (
                <CurriculumCard
                  key={curriculumItem._id}
                  curriculum={curriculumItem}
                  onEdit={() => {
                    setEditingCurriculum(curriculumItem); 
                    setShowModal(true)
                  }}
                  onDelete={() => {
                    setSelectedId(curriculumItem._id);
                    setConfirmAction("delete");
                    setConfirmOpen(true);
                  }}
                />
              ))}
            </div>
          )
        )}
  
        <Modal
          open={showModal}
          title="New Curriculum"
          description="Create a new academic curriculum."
          onClose={() => setShowModal(false)}
        >
          <CurriculumForm
            loading={creating}
            onSubmit={
              editingCurriculum ? handleUpdate : handleCreate
            }
            initialValues={editingCurriculum? {
              curriculumName: editingCurriculum.curriculumName,
              year: editingCurriculum.year,} : undefined}
          />
        </Modal>
  
        <ConfirmDialog
          open={confirmOpen}
          title="Delete Curriculum"
          description="This action cannot be undone."
          confirmText="Delete"
          confirmVariant="danger"
          onCancel={() => {
            setConfirmOpen(false);
            setSelectedId("");
            setConfirmAction(null);
          }}
          onConfirm={async () => {
            if (!selectedId || !confirmAction) return;
        
            if (confirmAction === "delete") {
              return await handleDelete(selectedId);
            }
        
            setConfirmOpen(false);
            setSelectedId("");
            setConfirmAction(null);
          }}
          />
      </div>
    </main>
  );
}