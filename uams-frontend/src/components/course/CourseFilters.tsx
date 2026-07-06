"use client";

import { Input, Button, Select } from "@/components/ui";
import { AcademicSession } from "@/types/academicSession";

interface CourseFiltersProps {
  search: string;
  level: string;
  semester: string;
  academicSessionId: string;

  sessions: AcademicSession[];

  onSearchChange: (value: string) => void;
  onLevelChange: (value: string) => void;
  onSemesterChange: (value: string) => void;
  onSessionChange: (value: string) => void;

  onReset: () => void;
}

export default function CourseFilters({
  search,
  level,
  semester,
  academicSessionId,
  sessions,
  onSearchChange,
  onLevelChange,
  onSemesterChange,
  onSessionChange,
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
        value={academicSessionId}
        onChange={(e) => onSessionChange(e.target.value)}
      >
        <option value="">All Sessions</option>

        {sessions.map((session) => (
          <option
            key={session._id}
            value={session._id}
          >
            {session.sessionName}
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