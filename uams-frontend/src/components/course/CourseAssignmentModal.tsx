"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import { Course } from "@/types/course";
import { Lecturer } from "@/types/lecturer";

import {
  getLecturers,
} from "@/services/lecturerService";

import {
  getAssignedLecturers,
  replaceCourseLecturers,
} from "@/services/courseAssignmentService";

import { useNotification } from "@/context/NotificationContext";

import {
  Modal,
  Button,
  Input,
  EmptyState,
} from "@/components/ui";

import CourseAssignmentSkeleton from "@/components/course/CourseAssignmentSkeleton";

interface CourseAssignmentModalProps {
  open: boolean;
  course: Course | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function CourseAssignmentModal({
  open,
  course,
  onClose,
  onSaved,
}: CourseAssignmentModalProps) {
  const [lecturers, setLecturers] =
    useState<Lecturer[]>([]);
  
  const [selectedLecturerIds, setSelectedLecturerIds] =
    useState<string[]>([]);
  
  const [search, setSearch] = useState("");
  
  const [loading, setLoading] = useState(false);
  
  const [saving, setSaving] = useState(false);
  
  const { notify } = useNotification();
  
  const filteredLecturers = useMemo(() => {
    const keyword = search.toLowerCase();
  
    return lecturers.filter((lecturer) =>
      `${lecturer.firstName} ${lecturer.lastName} ${lecturer.staffNumber}`
        .toLowerCase()
        .includes(keyword)
    );
  }, [lecturers, search]);
  
  const toggleLecturer = (lecturerId: string) => {
    setSelectedLecturerIds((prev) =>
      prev.includes(lecturerId)
        ? prev.filter((id) => id !== lecturerId)
        : [...prev, lecturerId]
    );
  };

  useEffect(() => {
    if (!open || !course) return;
  
    const loadData = async () => {
      try {
        setLoading(true);
  
        const [
          allLecturers,
          assignedLecturers,
        ] = await Promise.all([
          getLecturers(),
          getAssignedLecturers(course._id),
        ]);
  
        setLecturers(allLecturers.data);
  
        setSelectedLecturerIds(
          assignedLecturers.map(
            (lecturer) => lecturer._id
          )
        );
      } catch (error) {
        if (axios.isAxiosError(error)) {
          notify(
            "error",
            error.response?.data?.message ??
              "Failed to load lecturers."
          );
        } else {
          notify(
            "error",
            "Failed to load lecturers."
          );
        }
      } finally {
        setLoading(false);
      }
    };
  
    loadData();
  }, [open, course, notify]);

  const handleSave = async () => {
    if (!course) return;
  
    try {
      setSaving(true);
  
      await replaceCourseLecturers(
        course._id,
        selectedLecturerIds
      );
  
      notify(
        "success",
        "Course lecturers updated successfully.."
      );
  
      onSaved();
  
      onClose();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        notify(
          "error",
          error.response?.data?.message ??
            "Failed to updated lecturers."
        );
      } else {
        notify(
          "error",
          "Failed to updated lecturers."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      title="Manage Lecturers"
      description={
        course
          ? `${course.courseCode} • ${course.courseTitle}`
          : ""
      }
      onClose={onClose}
    >
      <div className="space-y-5">
  
        <Input
          placeholder="Search lecturer..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />
  
        <div className="max-h-80 overflow-y-auto rounded-lg border bg-background">
  
          {loading ? (
            <CourseAssignmentSkeleton />
          ) : filteredLecturers.length === 0 ? (
  
            <EmptyState
              title="No lecturers"
              description="No lecturers found."
            />
  
          ) : (
  
            filteredLecturers.map((lecturer) => (
  
              <label
                key={lecturer._id}
                className="flex items-center gap-3 p-4 border-b last:border-b-0 hover:bg-muted/50 cursor-pointer transition-colors"
              >
  
                <input
                  type="checkbox"
                  checked={selectedLecturerIds.includes(
                    lecturer._id
                  )}
                  onChange={() =>
                    toggleLecturer(
                      lecturer._id
                    )
                  }
                />
  
                <div>
  
                  <p className="font-medium">
                    {lecturer.firstName} {lecturer.lastName}
                  </p>
  
                  <p className="text-sm text-muted-foreground">
                    {lecturer.staffNumber}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {lecturer.department}
                  </p>

                </div>
  
              </label>
  
            ))
  
          )}
  
        </div>
  
        <div className="flex justify-end gap-3">
  
          <Button
            variant="secondary"
            onClick={onClose}
          >
            Cancel
          </Button>
  
          <Button
            loading={saving}
            onClick={handleSave}
          >
            Save
          </Button>
  
        </div>
  
      </div>
    </Modal>
  );
}