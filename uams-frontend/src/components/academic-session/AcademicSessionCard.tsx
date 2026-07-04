"use client";

import { AcademicSession } from "@/types/academicSession";
import { formatDate } from "@/utils/formatDate";

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
    <div className="border rounded-xl p-5 shadow-sm bg-white flex justify-between items-center">
      <div>
        <h2 className="text-lg font-semibold">
          {session.sessionName}
        </h2>

        <p className="text-sm text-gray-600">
          Start: {formatDate(session.startDate)}
        </p>

        <p className="text-sm text-gray-600">
          End: {formatDate(session.endDate)}
        </p>

        <span
          className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
            session.isActive
              ? "bg-green-100 text-green-700"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          {session.isActive ? "Active" : "Inactive"}
        </span>
      </div>

      <div className="flex gap-2">
        {!session.isActive && (
          <button
            onClick={() => onActivate(session._id)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Activate
          </button>
        )}

        <button
          onClick={() => onDelete(session._id)}
          disabled={session.isActive}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Delete
        </button>
      </div>
    </div>
  );
}