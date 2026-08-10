interface FormGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3;
}

export default function FormGrid({
  children,
  columns = 1,
}: FormGridProps) {
  const gridClass = {
    1: "space-y-5",
    2: "grid grid-cols-1 md:grid-cols-2 gap-5",
    3: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5",
  };
  return (
    <div
      className={gridClass[columns]}
    >
      {children}
    </div>
  );
}