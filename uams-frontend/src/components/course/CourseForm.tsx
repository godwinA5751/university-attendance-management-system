"use client";

import { useState } from "react";

import { Button, Input, Select, FormSection, FormGrid, FormActions } from "@/components/ui";

import { AcademicSession } from "@/types/academicSession";

interface CourseFormData {
  courseCode: string;
  courseTitle: string;
  unit: number;
  level: number;
  semester: "First" | "Second";
  academicSessionId: string;
}

interface CourseFormProps {
  loading?: boolean;
  sessions: AcademicSession[];
  initialValues?: Partial<CourseFormData>;
  onSubmit: (data: CourseFormData) => void;
}

export default function CourseForm({
  loading = false,
  sessions,
  initialValues,
  onSubmit,
}: CourseFormProps) {
  const [formData, setFormData] = useState<CourseFormData>({
    courseCode: initialValues?.courseCode ?? "",
    courseTitle: initialValues?.courseTitle ?? "",
    unit: initialValues?.unit ?? 1,
    level: initialValues?.level ?? 100,
    semester: initialValues?.semester ?? "First",
    academicSessionId:
      initialValues?.academicSessionId ?? "",
  });

  const handleChange = (
    field: keyof CourseFormData,
    value: string | number
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
    <FormSection
      onSubmit={handleSubmit}
    >
      <FormGrid columns={2}>
        <Input
          label="Course Code"
          placeholder="CSC201"
          value={formData.courseCode}
          onChange={(e) =>
            handleChange(
              "courseCode",
              e.target.value.toUpperCase()
            )
          }
          required
        />
  
        <Input
          label="Course Title"
          placeholder="Computer Programming"
          value={formData.courseTitle}
          onChange={(e) =>
            handleChange(
              "courseTitle",
              e.target.value
            )
          }
          required
        />
  
        <Input
          label="Unit"
          type="number"
          min={1}
          value={formData.unit}
          onChange={(e) =>
            handleChange(
              "unit",
              Number(e.target.value)
            )
          }
          required
        />
  
        <Select
          label="Level"
          value={formData.level}
          onChange={(e) =>
            handleChange(
              "level",
              Number(e.target.value)
            )
          }
        >
          {[100, 200, 300, 400, 500, 600].map(
            (level) => (
              <option
                key={level}
                value={level}
              >
                {level} Level
              </option>
            )
          )}
        </Select>
  
        <Select
          label="Semester"
          value={formData.semester}
          onChange={(e) =>
            handleChange(
              "semester",
              e.target.value as
                | "First"
                | "Second"
            )
          }
        >
          <option value="First">
            First Semester
          </option>
  
          <option value="Second">
            Second Semester
          </option>
        </Select>
  
        <Select
          label="Academic Session"
          value={formData.academicSessionId}
          onChange={(e) =>
            handleChange(
              "academicSessionId",
              e.target.value
            )
          }
          required
        >
          <option value="">
            Select Academic Session
          </option>
  
          {sessions.map((session) => (
            <option
              key={session._id}
              value={session._id}
            >
              {session.sessionName}
            </option>
          ))}
        </Select>
      </FormGrid>

      <FormActions>
        <Button
          type="submit"
          loading={loading}
        >
          Save Course
        </Button>
      </FormActions>
    </FormSection>
  );
}