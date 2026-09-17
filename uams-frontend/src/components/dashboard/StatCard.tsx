import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: "blue" | "green" | "amber" | "red" | "violet";
}

const ACCENTS: Record<NonNullable<StatCardProps["accent"]>,
  { bg: string; text: string }
> = {
  blue: { bg: "bg-blue-50", text: "text-blue-700" },
  green: { bg: "bg-green-50", text: "text-green-700" },
  amber: { bg: "bg-amber-50", text: "text-amber-700" },
  red: { bg: "bg-red-50", text: "text-red-700" },
  violet: { bg: "bg-violet-50", text: "text-violet-700" },
};

export default function StatCard({
  label,
  value,
  icon: Icon,
  accent = "blue",
}: StatCardProps) {
  const { bg, text } = ACCENTS[accent];

  return (
    <div
      className="
        rounded-2xl border border-gray-100 bg-white p-5 shadow-sm
        transition-all duration-200
        hover:-translate-y-0.5 hover:shadow-md
      "
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{label}</p>

        <div className={`rounded-xl p-2 ${bg}`}>
          <Icon size={18} className={text} />
        </div>
      </div>

      <h2 className="mt-3 text-3xl font-bold text-gray-900">{value}</h2>
    </div>
  );
}