import React from "react";

interface BadgeProps {
  children: React.ReactNode;

  variant?:
    | "primary"
    | "secondary"
    | "success"
    | "danger"
    | "warning"
    | "info";

  className?: string;
}

export default function Badge({
  children,
  variant = "primary",
  className = "",
}: BadgeProps) {
  const variants = {
    primary:
      "bg-blue-100 text-blue-700",

    secondary:
      "bg-gray-100 text-gray-700",

    success:
      "bg-green-100 text-green-700",

    danger:
      "bg-red-100 text-red-700",

    warning:
      "bg-yellow-100 text-yellow-800",

    info:
      "bg-sky-100 text-sky-700",
  };

  return (
    <span
      className={`
        inline-flex
        items-center
        rounded-full
        px-3
        py-1
        text-xs
        font-medium
        ${variants[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}