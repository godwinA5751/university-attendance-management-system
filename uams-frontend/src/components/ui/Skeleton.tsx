interface SkeletonProps {
  className?: string;
}

export default function Skeleton({
  className = "",
}: SkeletonProps) {
  return (
    <div
      className={`
        animate-pulse
        rounded-full
        bg-gray-200
        ${className}
      `}
    />
  );
}