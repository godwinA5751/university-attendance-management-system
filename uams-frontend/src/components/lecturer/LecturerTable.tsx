"use client";

import {
  Button,
  Checkbox,
  Pagination,
  EmptyState,
} from "@/components/ui";
import LecturerSkeleton from "./LecturerSkeleton";
import { Pencil, Trash2, Plus } from "lucide-react";
import { Lecturer } from "@/types/lecturer";

interface LecturerTableProps {
  lecturers: Lecturer[];
  loading: boolean;

  selectedIds: string[];

  onSelect: (id: string) => void;
  onSelectAll: () => void;

  onEdit: (lecturer: Lecturer) => void;
  onDelete: (lecturer: Lecturer) => void;

  pagination: {
    page: number;
    totalPages: number;
  };

  onPageChange: (page: number) => void;
  onEmptyState: (open: boolean) => void;
}

export default function LecturerTable({
  lecturers,
  loading,
  selectedIds,
  onSelect,
  onSelectAll,
  onEdit,
  onDelete,
  pagination,
  onPageChange,
  onEmptyState
}: LecturerTableProps) {
  if (loading) {
    return <LecturerSkeleton />;
  }

  if (lecturers.length === 0 && onEmptyState) {
    return <EmptyState
      title="No Lecturer"
      description="Add your first lecturer."
      action={
        <Button
          leftIcon={<Plus size={18} />}
          onClick={() => onEmptyState(true)}
        >
          New Lecturer
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
                    lecturers.length > 0 &&
                    selectedIds.length === lecturers.length
                  }
                  onChange={onSelectAll}
                />
              </th>

              <th className="px-4 py-3 text-left text-sm font-semibold">
                Staff Number
              </th>

              <th className="px-4 py-3 text-left text-sm font-semibold">
                Lecturer
              </th>

              <th className="px-4 py-3 text-left text-sm font-semibold">
                Faculty
              </th>

              <th className="px-4 py-3 text-left text-sm font-semibold">
                Department
              </th>

              <th className="px-4 py-3 text-right text-sm font-semibold">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {lecturers.map((lecturer) => (
              <tr
                key={lecturer._id}
                className="border-b transition hover:bg-gray-50"
              >
                <td className="px-4 py-4">
                  <Checkbox
                    checked={selectedIds.includes(
                      lecturer._id
                    )}
                    onChange={() =>
                      onSelect(lecturer._id)
                    }
                  />
                </td>

                <td className="p-4 text-sm">
                  {lecturer.staffNumber}
                </td>

                <td className="p-4 font-medium">
                  {lecturer.firstName} {lecturer.lastName}
                </td>

                <td className="p-4 text-sm">
                  {lecturer.faculty}
                </td>

                <td className="p-4 text-sm">
                  {lecturer.department}
                </td>

                <td className="p-4">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      onClick={() =>
                        onEdit(lecturer)
                      }
                    >
                      <Pencil size={16} />
                    </Button>

                    <Button
                      variant="ghost"
                      onClick={() =>
                        onDelete(lecturer)
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
            ))}
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