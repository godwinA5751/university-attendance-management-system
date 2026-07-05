"use client";

import { formatDate } from "@/utils/formatDate";
import { AcademicSession } from "@/types/academicSession";
import { Badge, Button, Card } from "@/components/ui";
import { Trash2, RefreshCcw } from "lucide-react";

interface AcademicSessionCardProps {
  session: AcademicSession;
  onActivate: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function AcademicSessionCard({
  session,
  onActivate,
  onDelete,
}: AcademicSessionCardProps) {

  return (
    <Card className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">
          {session.sessionName}
        </h2>

        <div className="text-sm text-gray-600 space-y-1">
          <p>
            <span className="font-medium">Start:</span>{" "}
            {formatDate(session.startDate)}
          </p>

          <p>
            <span className="font-medium">End:</span>{" "}
            {formatDate(session.endDate)}
          </p>
        </div>

        <Badge
          variant={
            session.isActive
              ? "success"
              : "secondary"
          }
        >
          {session.isActive ? "Active" : "Inactive"}
        </Badge>
      </div>

      <div className="flex gap-3">
        {!session.isActive && (
          <Button
            variant="success"
            title="Activate academic session"
            leftIcon={<RefreshCcw size={16} />}
            onClick={() => onActivate(session._id)}
          >
            Activate
          </Button>
        )}

        <Button
            variant="danger"
            leftIcon={<Trash2 size={16} />}
            disabled={session.isActive}
            title={
                session.isActive
                    ? "Deactivate this session before deleting it."
                    : "Delete academic session"
            }
            onClick={() => onDelete(session._id)}
        >
            Delete
        </Button>
      </div>
    </Card>
  );
}