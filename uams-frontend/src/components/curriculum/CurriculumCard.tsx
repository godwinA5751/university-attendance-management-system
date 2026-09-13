"use client";

import { formatDate } from "@/utils/formatDate";
import { Curriculum } from "@/types/curriculum";
import { Badge, Button, Card } from "@/components/ui";
import { Trash2, Pen } from "lucide-react";

interface CurriculumCardProps {
  curriculum: Curriculum;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}

export default function CurriculumCard({
  curriculum,
  onDelete,
  onEdit,
}: CurriculumCardProps) {

  return (
    <Card className="flex gap-4 items-center justify-between">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">
          {curriculum.curriculumName}
        </h2>

        <div className="text-sm text-gray-600 space-y-1">
          <p>
            <span className="font-medium">Start:</span>{" "}
            {formatDate(curriculum.createdAt)}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 items-center">
        <Badge
          variant="success"
          className="ml-2 w-max"
        >
          {curriculum.year}
        </Badge>

        <div className="flex gap-2">
          <Button
            variant="danger"
            title="Delete curriculum"
            onClick={() => onDelete(curriculum._id)}
          >
            <Trash2 size={16} />
          </Button>
          <Button
            variant="success"
            title="Edit curriculum"
            onClick={() => onEdit(curriculum._id)}
          >
            <Pen size={16} />
          </Button>
        </div>
      </div>
    </Card>
  );
}