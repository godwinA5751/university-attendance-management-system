"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

import axios from "axios";

import {
  AcademicSession,
  CreateAcademicSessionInput,
} from "@/types/academicSession";

import {
  getAcademicSessions,
  createAcademicSession,
  activateAcademicSession,
  deleteAcademicSession,
} from "@/services/academicSessionService";

import AcademicSessionCard from "@/components/academic-session/AcademicSessionCard";
import AcademicSessionForm from "@/components/academic-session/AcademicSessionForm";
import AcademicSessionSkeleton from "@/components/academic-session/AcademicSessionSkeleton";

import {
  Button,
  Modal,
  PageHeader,
  EmptyState,
  ConfirmDialog,
} from "@/components/ui";
import { useNotification } from "@/context/NotificationContext";

import { Plus } from "lucide-react";

export default function AcademicSessionsPage() {
  const navigate = useRouter();
  const [sessions, setSessions] = useState<AcademicSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<
    "activate" | "delete" | null
  >(null);
  const [selectedId, setSelectedId] = useState("");
  const { notify } = useNotification();
  const [sessionCount, setSessionCount] = useState(() => {
    const cached = localStorage.getItem('academicSessionCount');
    return cached ? parseInt(cached, 10) : 4; // fallback default
  });
  
  useEffect(() => {
    if (sessions.length > 0) {
      setTimeout(() => {
        setSessionCount(sessions.length);
        localStorage.setItem('academicSessionCount', sessions.length.toString());
      }, 0);
    }
  }, [sessions]);

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);

      const data = await getAcademicSessions();

      setSessions(data);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          navigate.push("/login");
          return;
        }
        notify(
          "error",
          error.response?.data?.message ??
            "Failed to fetch academic sessions."
        );
      } else {
        notify(
          "error",
          "Failed to fetch academic sessions."
        );
      }
    } finally {
      setLoading(false);
    }
  }, [notify, navigate]);

  useEffect(() => {
    setTimeout(() => {
      fetchSessions();
    }, 0);
  }, [fetchSessions]);

  const handleCreate = async (
    data: CreateAcademicSessionInput
  ) => {
    try {
      setCreating(true);

      await createAcademicSession(data);
      
      notify(
        "success",
        "Academic session created successfully."
      );
      
      setShowModal(false);
      
      await fetchSessions();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        notify(
          "error",
          error.response?.data?.message ??
            "Failed to create session."
        );
      } else {
        notify(
          "error",
          "Failed to create session."
        );
      }
    } finally {
      setCreating(false);
    }
  };

  const handleActivate = async (id: string) => {

    try {
      await activateAcademicSession(id);

      notify(
        "success",
        "Academic session activated successfully."
      );
      
      await fetchSessions();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        notify(
          "error",
          error.response?.data?.message ??
            "Activation failed."
        );
      } else {
        notify(
          "error",
          "Activation failed."
        );
      }
    }
  };

  const handleDelete = async (id: string) => {

    try {
      await deleteAcademicSession(id);

      notify(
        "success",
        "Academic session deleted successfully."
      );
      
      await fetchSessions();
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
    <main className="p-8">
      <PageHeader
        title="Academic Sessions"
        subtitle="Manage academic sessions."
      
        action={
          <Button
              leftIcon={<Plus size={18} />}
              onClick={() => setShowModal(true)}
          >
              New Session
          </Button>
        }
      />
      <div className="scroll-custom h-[calc(100vh-200px)] overflow-y-auto mt-19">
        {loading ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {Array.from({ length: sessionCount }).map((_, index) => (
              <AcademicSessionSkeleton key={index} isActive={index === 0} />
            ))}
          </div>
        ) : (
          sessions.length === 0 ? (
            <EmptyState
              title="No Academic Sessions"
              description="Create your first academic session."
          
              action={
                <Button
                    leftIcon={<Plus size={18} />}
                    onClick={() => setShowModal(true)}
                >
                    New Session
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {sessions.map((session) => (
                <AcademicSessionCard
                  key={session._id}
                  session={session}
                  onActivate={() => {
                    setSelectedId(session._id);
                    setConfirmAction("activate");
                    setConfirmOpen(true);
                  }}
                  onDelete={() => {
                    setSelectedId(session._id);
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
          title="New Academic Session"
          description="Create a new academic session."
          onClose={() => setShowModal(false)}
        >
          <AcademicSessionForm
            loading={creating}
            onSubmit={handleCreate}
          />
        </Modal>
  
        <ConfirmDialog
          open={confirmOpen}
          title={
            confirmAction === "activate"
              ? "Activate Academic Session"
              : "Delete Academic Session"
          }
          description={
            confirmAction === "activate"
              ? "This will deactivate the current active academic session."
              : "This action cannot be undone."
          }
          confirmText={
            confirmAction === "activate"
              ? "Activate"
              : "Delete"
          }
          confirmVariant={
            confirmAction === "activate"
              ? "success"
              : "danger"
          }
          onCancel={() => {
            setConfirmOpen(false);
            setSelectedId("");
            setConfirmAction(null);
          }}
          onConfirm={async () => {
            if (!selectedId || !confirmAction) return;
        
            if (confirmAction === "activate") {
              await handleActivate(selectedId);
            } else {
              await handleDelete(selectedId);
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