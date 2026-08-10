"use client";

import { useEffect, useState } from "react";

import {
  Button,
  Modal,
  MultiSelect,
  Select,
} from "@/components/ui";

import { Course } from "@/types/course";
import { Student } from "@/types/student";

interface StudentPromotionModalProps {
  open: boolean;
  loading?: boolean;

  student: Student | null;

  courses: Course[];

  onClose: () => void;

  onSubmit: (data: {
    newLevel: number;
    carryOverCourseIds: string[];
  }) => void;
}

export default function StudentPromotionModal({
  open,
  loading = false,
  student,
  courses,
  onClose,
  onSubmit,
}: StudentPromotionModalProps) {
  const [newLevel, setNewLevel] = useState(100);

  const [carryOverCourseIds, setCarryOverCourseIds] =
    useState<string[]>([]);

  useEffect(() => {
    if (student) {
      setTimeout(() => {
        setNewLevel(student.currentLevel + 100);
        setCarryOverCourseIds([]);
      }, 0);
    }
  }, [student]);

  const handleSubmit = (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    onSubmit({
      newLevel,
      carryOverCourseIds,
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Promote Student"
      description="Promote student to the next level."
      size="md"
    >
      {student && (
        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="font-medium">
              {student.firstName} {student.lastName}
            </p>

            <p className="text-sm text-gray-500">
              {student.matricNumber}
            </p>
          </div>

          <Select
            label="New Level"
            value={newLevel}
            onChange={(e) =>
              setNewLevel(Number(e.target.value))
            }
          >
            {[100, 200, 300, 400, 500, 600].map(
              (level) => (
                <option
                  key={level}
                  value={level}
                  disabled={
                    level <= student.currentLevel
                  }
                >
                  {level} Level
                </option>
              )
            )}
          </Select>

          <MultiSelect
            label="Carryover Courses"
            placeholder="Select carryover courses..."
            options={courses.map((course) => ({
              value: course._id,
              label: `${course.courseCode} - ${course.courseTitle}`,
            }))}
            value={carryOverCourseIds}
            onChange={setCarryOverCourseIds}
          />

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              loading={loading}
            >
              Promote Student
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}