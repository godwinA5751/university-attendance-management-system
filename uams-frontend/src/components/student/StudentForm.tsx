"use client";

import { useState } from "react";

import {
  Button,
  Input,
  Select,
  MultiSelect,
} from "@/components/ui";

import { Course } from "@/types/course";
import { CreateStudentInput } from "@/types/student";

interface StudentFormProps {
  loading?: boolean;
  
  carryoverCourses: Course[];
  
  onLevelChange?: (level: number) => void;

  initialValues?: Partial<CreateStudentInput>;

  onSubmit: (
    data: CreateStudentInput
  ) => void;
}

export default function StudentForm({
  loading = false,
  carryoverCourses,
  onLevelChange,
  initialValues,
  onSubmit,
}: StudentFormProps) {
  const [formData, setFormData] =
    useState<CreateStudentInput>({
      firstName:
        initialValues?.firstName ?? "",

      lastName:
        initialValues?.lastName ?? "",

      matricNumber:
        initialValues?.matricNumber ?? "",

      faculty:
        initialValues?.faculty ?? "",

      department:
        initialValues?.department ?? "",

      currentLevel:
        initialValues?.currentLevel ?? 100,

      admissionYear:
        initialValues?.admissionYear ??
        new Date().getFullYear(),

      carryOverCourseIds:
        initialValues?.carryOverCourseIds ??
        [],
    });

  const handleChange = <
    K extends keyof CreateStudentInput
  >(
    field: K,
    value: CreateStudentInput[K]
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
          label="Matric Number"
          value={formData.matricNumber}
          onChange={(e) =>
            handleChange(
              "matricNumber",
              e.target.value.toUpperCase()
            )
          }
          disabled={!!initialValues?.matricNumber}
          required
        />

        <Input
          label="Admission Year"
          type="number"
          value={formData.admissionYear}
          onChange={(e) =>
            handleChange(
              "admissionYear",
              Number(e.target.value)
            )
          }
          disabled={!!initialValues?.admissionYear}
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

        <Select
          label="Current Level"
          value={formData.currentLevel}
          onChange={(e) => {
            const level = Number(e.target.value);
        
            handleChange("currentLevel", level);
        
            onLevelChange?.(level);
          }}
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

        <MultiSelect
          label="Carryover Courses"
          options={carryoverCourses.map(
            (course) => ({
              value: course._id,
              label: `${course.courseCode} - ${course.courseTitle}`,
            })
          )}
          value={formData.carryOverCourseIds ?? []}
          onChange={(values) =>
            handleChange(
              "carryOverCourseIds",
              values
            )
          }
          placeholder="Select carryover courses..."
        />
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          loading={loading}
        >
          Save Student
        </Button>
      </div>
    </form>
  );
}