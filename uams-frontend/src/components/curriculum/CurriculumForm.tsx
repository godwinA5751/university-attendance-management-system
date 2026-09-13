"use client";

import { useState } from "react";
import { Button, Input, FormGrid, FormSection, FormActions} from "@/components/ui";
import { CreateCurriculumInput } from "@/types/curriculum";

interface CurriculumFormData {
  curriculumName: string;
  year: number;
}

interface CurriculumFormProps {
  loading: boolean;
  onSubmit: (data: CreateCurriculumInput) => void;
  initialValues?: Partial<CurriculumFormData>;
}

export default function CurriculumForm({
  loading,
  onSubmit,
  initialValues,
}: CurriculumFormProps) {
  const [formData, setFormData] = useState<CreateCurriculumInput>({
    curriculumName: initialValues?.curriculumName ?? "",
    year: initialValues?.year ?? new Date().getFullYear(),
  });

  const [errors, setErrors] = useState({
    curriculumName: "",
    year: "",
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
      curriculumName: "",
      year: "",
    };

    let valid = true;

    if (!formData.curriculumName.trim()) {
      newErrors.curriculumName =
        "Curriculum name is required.";
      valid = false;
    }

    if (!formData.year) {
      newErrors.year =
        "Year is required.";
      valid = false;
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
    <FormSection
      onSubmit={handleSubmit}
    >
      <FormGrid columns={2}>
        <Input
          label="Curriculum Name"
          name="curriculumName"
          required
          placeholder="Enter curriculum name"
          value={formData.curriculumName}
          onChange={handleChange}
          error={errors.curriculumName}
        />

        <Input
          label="Year"
          type="number"
          name="year"
          required
          placeholder="Enter year"
          min={1900}
          max={2100}
          step={1}
          value={formData.year}
          onChange={handleChange}
          error={errors.year}
        />
      </FormGrid>

      <FormActions>
        <Button
          type="submit"
          loading={loading}
        >
          Save Curriculum
        </Button>
      </FormActions>
    </FormSection>
  );
}