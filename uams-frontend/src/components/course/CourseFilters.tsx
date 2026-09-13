"use client";

import { Input, Button, Select } from "@/components/ui";
import { Curriculum } from "@/types/curriculum";

interface CourseFiltersProps {
  search: string;
  level: string;
  semester: string;
  curriculumId: string;

  curriculum: Curriculum[];

  onSearchChange: (value: string) => void;
  onLevelChange: (value: string) => void;
  onSemesterChange: (value: string) => void;
  onCurriculumChange: (value: string) => void;

  onReset: () => void;
}

export default function CourseFilters({
  search,
  level,
  semester,
  curriculumId,
  curriculum,

  onSearchChange,
  onLevelChange,
  onSemesterChange,
  onCurriculumChange,
  onReset,
}: CourseFiltersProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">

      <Input
        placeholder="Search course..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />

      <Select
        value={level}
        onChange={(e) => onLevelChange(e.target.value)}
      >
        <option value="">All Levels</option>
        <option value="100">100 Level</option>
        <option value="200">200 Level</option>
        <option value="300">300 Level</option>
        <option value="400">400 Level</option>
        <option value="500">500 Level</option>
        <option value="600">600 Level</option>
      </Select>

      <Select
        value={semester}
        onChange={(e) => onSemesterChange(e.target.value)}
      >
        <option value="">All Semesters</option>
        <option value="First">First Semester</option>
        <option value="Second">Second Semester</option>
      </Select>

      <Select
        value={curriculumId}
        onChange={(e) => onCurriculumChange(e.target.value)}
      >
        <option value="">All Curriculum</option>

        {curriculum.map((cur) => (
          <option
            key={cur._id}
            value={cur._id}
          >
            {cur.curriculumName}
          </option>
        ))}
      </Select>

      <Button
        variant="secondary"
        onClick={onReset}
      >
        Reset Filters
      </Button>

    </div>
  );
}