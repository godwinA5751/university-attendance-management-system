"use client";

import { useState } from "react";
import { Button, Input } from "@/components/ui";
import { CreateAcademicSessionInput } from "@/types/academicSession";
import { Plus } from "lucide-react";

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

  const [errors, setErrors] = useState({
    sessionName: "",
    startDate: "",
    endDate: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    setErrors((prev) => ({
      ...prev,
      [e.target.name]: "",
    }));
  };

  const validate = () => {
    const newErrors = {
      sessionName: "",
      startDate: "",
      endDate: "",
    };

    let valid = true;

    if (!formData.sessionName.trim()) {
      newErrors.sessionName =
        "Academic session name is required.";
      valid = false;
    }

    if (!formData.startDate) {
      newErrors.startDate =
        "Start date is required.";
      valid = false;
    }

    if (!formData.endDate) {
      newErrors.endDate =
        "End date is required.";
      valid = false;
    }

    if (
      formData.startDate &&
      formData.endDate
    ) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);

      if (end <= start) {
        newErrors.endDate =
          "End date must be after the start date.";
        valid = false;
      }
    }

    setErrors(newErrors);

    return valid;
  };

  const handleSubmit = (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!validate()) return;

    onSubmit(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <Input
        label="Academic Session"
        name="sessionName"  
        required
        placeholder="2025/2026"
        value={formData.sessionName}
        onChange={handleChange}
        error={errors.sessionName}
      />

      <Input
        label="Start Date"
        type="date"
        name="startDate"
        required
        value={formData.startDate}
        onChange={handleChange}
        error={errors.startDate}
      />

      <Input
        label="End Date"
        type="date"
        name="endDate"
        required
        value={formData.endDate}
        onChange={handleChange}
        error={errors.endDate}
      />

      <div className="flex justify-end">
        <Button
          type="submit"
          loading={loading}
          leftIcon={<Plus size={18} />}
        >
          Create Session
        </Button>
      </div>
    </form>
  );
}