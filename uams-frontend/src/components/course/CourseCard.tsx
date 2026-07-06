"use client";

import { Course } from "@/types/course";

import { Card, Badge, Button } from "@/components/ui";

import {
  GraduationCap,
  BookOpen,
  BookMarked,
  UserPlus,
  Pencil,
  Trash2,
} from "lucide-react";

interface CourseCardProps {
  course: Course;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onAssignLecturers: (id: string) => void;
}

export default function CourseCard({
  course,
  onEdit,
  onDelete,
  onAssignLecturers,
}: CourseCardProps) {
  return (
    <Card>
      <div className="flex justify-between items-start">

        <div>

          <h2 className="text-lg font-bold text-blue-700">
            {course.courseCode}
          </h2>

          <p className="text-gray-700 mt-1">
            {course.courseTitle}
          </p>

        </div>

        <Badge variant="success">
          {course.academicSessionId.sessionName}
        </Badge>

      </div>

      <div className="mt-5 space-y-2 text-sm text-gray-600">

        <div className="flex items-center gap-2">
          <GraduationCap size={16} />
          <span>{course.level} Level</span>
        </div>

        <div className="flex items-center gap-2">
          <BookOpen size={16} />
          <span>{course.semester} Semester</span>
        </div>

        <div className="flex items-center gap-2">
          <BookMarked size={16} />
          <span>{course.unit} Units</span>
        </div>

      </div>

      <div className="mt-5">

        <h3 className="text-sm font-medium mb-2">
          Lecturers
        </h3>

        {course.lecturers.length === 0 ? (
          <p className="text-gray-500 italic text-sm">
            No lecturers assigned
          </p>
        ) : (
          <ul className="space-y-1 text-sm">
            {course.lecturers.map((lecturer) => (
              <li key={lecturer._id}>
                • {lecturer.lecturerName}
              </li>
            ))}
          </ul>
        )}

      </div>

      <div className="flex justify-end gap-2 mt-6">

        <Button
          variant="secondary"
          leftIcon={<Pencil size={16} />}
          onClick={() => onEdit(course._id)}
        >
          Edit
        </Button>

        <Button
          variant="primary"
          leftIcon={<UserPlus size={16} />}
          onClick={() =>
            onAssignLecturers(course._id)
          }
        >
          Manage Lecturers
        </Button>

        <Button
          variant="danger"
          leftIcon={<Trash2 size={16} />}
          onClick={() => onDelete(course._id)}
        >
          Delete
        </Button>

      </div>
    </Card>
  );
}