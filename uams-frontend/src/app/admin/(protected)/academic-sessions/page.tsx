"use client";

import { useEffect, useState } from "react";
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

export default function AcademicSessionsPage() {
  const [sessions, setSessions] = useState<AcademicSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");

  const fetchSessions = async () => {
    try {
      setLoading(true);

      const data = await getAcademicSessions();

      setSessions(data);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.message ??
            "Failed to fetch academic sessions."
        );
      } else {
        setError("Failed to fetch academic sessions.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      fetchSessions();
    }, 0);
  }, []);

  const handleCreate = async (
    data: CreateAcademicSessionInput
  ) => {
    try {
      setCreating(true);

      await createAcademicSession(data);

      setShowModal(false);

      await fetchSessions();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        alert(
          error.response?.data?.message ??
            "Failed to create session."
        );
      } else {
        alert("Failed to create session.");
      }
    } finally {
      setCreating(false);
    }
  };

  const handleActivate = async (id: string) => {
    const confirm = window.confirm(
      "Activate this academic session?"
    );

    if (!confirm) return;

    try {
      await activateAcademicSession(id);

      await fetchSessions();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        alert(
          error.response?.data?.message ??
            "Activation failed."
        );
      } else {
        alert("Activation failed.");
      }
    }
  };

  const handleDelete = async (id: string) => {
    const confirm = window.confirm(
      "Delete this academic session?"
    );

    if (!confirm) return;

    try {
      await deleteAcademicSession(id);

      await fetchSessions();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        alert(
          error.response?.data?.message ??
            "Deletion failed."
        );
      } else {
        alert("Deletion failed.");
      }
    }
  };

  return (
    <main className="p-8">

      <div className="flex justify-between items-center mb-6">

        <h1 className="text-3xl font-bold">
          Academic Sessions
        </h1>

        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
        >
          New Session
        </button>

      </div>

      {error && (
        <p className="text-red-500 mb-4">
          {error}
        </p>
      )}

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <AcademicSessionSkeleton key={index} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">

          {sessions.map((session) => (
            <AcademicSessionCard
              key={session._id}
              session={session}
              onActivate={handleActivate}
              onDelete={handleDelete}
            />
          ))}

        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">

          <div className="bg-white rounded-xl p-6 w-125">

            <div className="flex justify-between items-center mb-5">

              <h2 className="text-xl font-semibold">
                New Academic Session
              </h2>

              <button
                onClick={() => setShowModal(false)}
                className="text-xl"
              >
                ×
              </button>

            </div>

            <AcademicSessionForm
              loading={creating}
              onSubmit={handleCreate}
            />

          </div>

        </div>
      )}

    </main>
  );
}