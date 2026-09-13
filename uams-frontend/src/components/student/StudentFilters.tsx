"use client";

import { Input, Select } from "@/components/ui";
import { Curriculum } from "@/types/curriculum";

interface StudentFilterProps {
  search: string;
  level?: number;
  curriculumId?: string;

  curriculum: Curriculum[];

  onSearchChange: (value: string) => void;
  onLevelChange: (level?: number) => void;
  onCurriculumChange: (curriculumId?: string) => void;
}

export default function StudentFilter({
  search,
  level,
  curriculumId,
  curriculum,
  onSearchChange,
  onLevelChange,
  onCurriculumChange,
}: StudentFilterProps) {
  return (
    <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Input
          label="Search"
          placeholder="Search by name or matric number..."
          value={search}
          onChange={(e) =>
            onSearchChange(e.target.value)
          }
        />

        <Select
          label="Level"
          value={level ?? ""}
          onChange={(e) =>
            onLevelChange(
              e.target.value
                ? Number(e.target.value)
                : undefined
            )
          }
        >
          <option value="">
            All Levels
          </option>

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
          label="Curriculum"
          value={curriculumId ?? ""}
          onChange={(e) =>
            onCurriculumChange(
              e.target.value || undefined
            )
          }
        >
          <option value="">
            All Curriculum
          </option>

          {curriculum.map((curr) => (
            <option
              key={curr._id}
              value={curr._id}
            >
              {curr.curriculumName}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}