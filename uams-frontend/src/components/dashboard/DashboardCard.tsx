interface DashboardCardProps {
  title: string;
  value: string | number;
}

export default function DashboardCard({
  title,
  value,
}: DashboardCardProps) {
  return (
    <div className="rounded-lg p-5 shadow-lg bg-sky-200/30 items-center flex flex-col hover:bg-sky-200/40">
      <p className="text-gray-500">{title}</p>

      <h2 className="md:text-3xl text-2xl font-bold">
        {value}
      </h2>
    </div>
  );
}