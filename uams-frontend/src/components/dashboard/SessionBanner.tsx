import { CalendarRange, AlertTriangle } from "lucide-react";

interface SessionBannerProps {
  academicSession: string | null;
}

export default function SessionBanner({
  academicSession,
}: SessionBannerProps) {
  if (!academicSession) {
    return (
      <div
        className="
          flex items-center gap-3 rounded-2xl border border-amber-200
          bg-amber-50 p-5
        "
      >
        <AlertTriangle size={20} className="text-amber-600 shrink-0" />
        <div>
          <p className="font-semibold text-amber-800">
            No Active Academic Session
          </p>
          <p className="text-sm text-amber-700">
            Course and enrollment counts below will read as zero until a
            session is activated.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="
        flex items-center gap-4 rounded-2xl p-5 text-white
        bg-linear-to-r from-[#2563EB] via-[#1D4ED8] to-[#172554]
      "
    >
      <div className="rounded-xl bg-white/15 p-2.5">
        <CalendarRange size={20} />
      </div>

      <div>
        <p className="text-sm text-blue-100">Active Academic Session</p>
        <p className="text-lg font-bold">{academicSession}</p>
      </div>
    </div>
  );
}