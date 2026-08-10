"use client";

import {
  Button,
  Checkbox,
  Pagination,
  EmptyState,
  Badge
} from "@/components/ui";
import StudentSkeleton from "./StudentSkeleton";
import { Pencil, Trash2, ArrowUp, Plus } from "lucide-react";
import { Student } from "@/types/student";

interface StudentTableProps {
  students: Student[];
  loading: boolean;

  selectedIds: string[];

  onSelect: (id: string) => void;
  onSelectAll: () => void;

  onEdit: (student: Student) => void;
  onPromote: (student: Student) => void;
  onDelete: (student: Student) => void;

  pagination: {
    page: number;
    totalPages: number;
  };

  onPageChange: (page: number) => void;
  onEmptyState: (open: boolean) => void;
}

export default function StudentTable({
  students,
  loading,
  selectedIds,
  onSelect,
  onSelectAll,
  onEdit,
  onPromote,
  onDelete,
  pagination,
  onPageChange,
  onEmptyState
}: StudentTableProps) {
  if (loading) {
    return <StudentSkeleton />;
  }

  if (students.length === 0 && onEmptyState) {
    return <EmptyState
      title="No Student"
      description="Add your first student."
      action={
        <Button
          leftIcon={<Plus size={18} />}
          onClick={() => onEmptyState(true)}
        >
          New Student
        </Button>
      }
    />;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="w-14 px-4 py-3">
                <Checkbox
                  checked={
                    students.length > 0 &&
                    selectedIds.length === students.length
                  }
                  onChange={onSelectAll}
                />
              </th>

              <th className="px-4 py-3 text-left text-sm font-semibold">
                Matric Number
              </th>

              <th className="px-4 py-3 text-left text-sm font-semibold">
                Student
              </th>

              <th className="px-4 py-3 text-left text-sm font-semibold">
                Faculty
              </th>

              <th className="px-4 py-3 text-left text-sm font-semibold">
                Department
              </th>

              <th className="px-4 py-3 text-left text-sm font-semibold">
                Level
              </th>

              <th className="px-4 py-3 text-left text-sm font-semibold">
                Admission
              </th>

              <th className="px-4 py-3 text-right text-sm font-semibold">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {students.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="py-16 text-center text-gray-500"
                >
                  No students found.
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr
                  key={student._id}
                  className="border-b transition hover:bg-gray-50"
                >
                  <td className="px-4 py-4">
                    <Checkbox
                      checked={selectedIds.includes(
                        student._id
                      )}
                      onChange={() =>
                        onSelect(student._id)
                      }
                    />
                  </td>

                  <td className="p-4 text-sm">
                    {student.matricNumber}
                  </td>

                  <td className="p-4 font-medium">
                    {student.firstName} {student.lastName}
                  </td>

                  <td className="p-4 text-sm">
                    {student.faculty}
                  </td>

                  <td className="p-4 text-sm">
                    {student.department}
                  </td>

                  <td className="p-4">
                    <Badge>
                      {student.currentLevel}
                    </Badge>
                  </td>

                  <td className="p-4 text-sm">
                    {student.admissionYear}
                  </td>

                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        onClick={() =>
                          onEdit(student)
                        }
                      >
                        <Pencil size={16} />
                      </Button>

                      <Button
                        variant="ghost"
                        onClick={() =>
                          onPromote(student)
                        }
                      >
                        <ArrowUp size={16} />
                      </Button>

                      <Button
                        variant="ghost"
                        onClick={() =>
                          onDelete(student)
                        }
                      >
                        <Trash2
                          size={16}
                          className="text-red-500"
                        />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="border-t px-6 py-4">
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
}