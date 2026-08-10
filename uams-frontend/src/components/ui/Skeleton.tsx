interface SkeletonProps {
  className?: string;
  rounded?: "full" | "lg" | "md";
}

export default function Skeleton({
  className = "",
  rounded = "lg",
}: SkeletonProps) {
  const radius = {
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full",
  };

  return (
    <div
      className={`
        animate-pulse
        bg-gray-200
        ${radius[rounded]}
        ${className}
      `}
    />
  );
}