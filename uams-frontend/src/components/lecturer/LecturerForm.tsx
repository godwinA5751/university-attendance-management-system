"use client";

import { useState } from "react";

import {
  Button,
  Input
} from "@/components/ui";

import { CreateLecturerInput } from "@/types/lecturer";

interface LecturerFormProps {
  loading?: boolean;

  initialValues?: Partial<CreateLecturerInput>;

  onSubmit: (
    data: CreateLecturerInput
  ) => void;
}

export default function LecturerForm({
  loading = false,
  initialValues,
  onSubmit,
}: LecturerFormProps) {
  const [formData, setFormData] =
    useState<CreateLecturerInput>({
      firstName:
        initialValues?.firstName ?? "",

      lastName:
        initialValues?.lastName ?? "",

      staffNumber:
        initialValues?.staffNumber ?? "",

      faculty:
        initialValues?.faculty ?? "",

      department:
        initialValues?.department ?? "",
    });

  const handleChange = <
    K extends keyof CreateLecturerInput
  >(
    field: K,
    value: CreateLecturerInput[K]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    onSubmit(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <Input
          label="First Name"
          value={formData.firstName}
          onChange={(e) =>
            handleChange(
              "firstName",
              e.target.value
            )
          }
          required
        />

        <Input
          label="Last Name"
          value={formData.lastName}
          onChange={(e) =>
            handleChange(
              "lastName",
              e.target.value
            )
          }
          required
        />

        <Input
          label="Staff Number"
          value={formData.staffNumber}
          onChange={(e) =>
            handleChange(
              "staffNumber",
              e.target.value.toUpperCase()
            )
          }
          disabled={!!initialValues?.staffNumber}
          required
        />

        <Input
          label="Faculty"
          value={formData.faculty}
          onChange={(e) =>
            handleChange(
              "faculty",
              e.target.value
            )
          }
          required
        />

        <Input
          label="Department"
          value={formData.department}
          onChange={(e) =>
            handleChange(
              "department",
              e.target.value
            )
          }
          required
        />
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          loading={loading}
        >
          Save Lecturer
        </Button>
      </div>
    </form>
  );
}