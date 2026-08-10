"use client";

import { Input, Select } from "@/components/ui";
import { AcademicSession } from "@/types/academicSession";

interface StudentFilterProps {
  search: string;
  level?: number;
  academicSessionId?: string;

  sessions: AcademicSession[];

  onSearchChange: (value: string) => void;
  onLevelChange: (level?: number) => void;
  onAcademicSessionChange: (sessionId?: string) => void;
}

export default function StudentFilter({
  search,
  level,
  academicSessionId,
  sessions,
  onSearchChange,
  onLevelChange,
  onAcademicSessionChange,
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
          label="Academic Session"
          value={academicSessionId ?? ""}
          onChange={(e) =>
            onAcademicSessionChange(
              e.target.value || undefined
            )
          }
        >
          <option value="">
            All Sessions
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
      </div>
    </div>
  );
}