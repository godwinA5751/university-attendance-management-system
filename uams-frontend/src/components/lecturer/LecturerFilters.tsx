"use client";

import { Input } from "@/components/ui";

interface LecturerFilterProps {
  search: string;
  onSearchChange: (value: string) => void;
}

export default function LecturerFilter({
  search,
  onSearchChange,
}: LecturerFilterProps) {
  return (
    <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4">
      <div className="max-w-md">
        <Input
          label="Search"
          placeholder="Search by name or staff number..."
          value={search}
          onChange={(e) =>
            onSearchChange(e.target.value)
          }
        />
      </div>
    </div>
  );
}