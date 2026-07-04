"use client";

import { useState } from "react";
import { CreateAcademicSessionInput } from "@/types/academicSession";

interface AcademicSessionFormProps {
  loading: boolean;
  onSubmit: (data: CreateAcademicSessionInput) => void;
}

export default function AcademicSessionForm({
  loading,
  onSubmit,
}: AcademicSessionFormProps) {
  const [formData, setFormData] = useState<CreateAcademicSessionInput>({
    sessionName: "",
    startDate: "",
    endDate: "",
  });

  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (
      !formData.sessionName.trim() ||
      !formData.startDate ||
      !formData.endDate
    ) {
      setError("Please fill all fields.");
      return;
    }

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);

    if (end <= start) {
      setError(
        "End date cannot be earlier than the start date."
      );
      return;
    }

    setError("");

    onSubmit(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <input
        type="text"
        name="sessionName"
        placeholder="Academic Session"
        value={formData.sessionName}
        onChange={handleChange}
        className="w-full border rounded-lg px-4 py-2"
      />

      <input
        type="date"
        name="startDate"
        value={formData.startDate}
        onChange={handleChange}
        className="w-full border rounded-lg px-4 py-2"
      />

      <input
        type="date"
        name="endDate"
        value={formData.endDate}
        onChange={handleChange}
        className="w-full border rounded-lg px-4 py-2"
      />

      {error && (
        <p className="text-red-500 text-sm">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Creating..." : "Create Session"}
      </button>
    </form>
  );
}