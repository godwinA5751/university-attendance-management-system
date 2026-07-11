import React from "react";
import { twMerge } from "tailwind-merge";

import Spinner from "./Spinner";

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;

  variant?:
    | "primary"
    | "secondary"
    | "success"
    | "danger"
    | "warning"
    | "logout";


  loading?: boolean;

  leftIcon?: React.ReactNode;

  rightIcon?: React.ReactNode;

  fullWidth?: boolean;
}

export default function Button({
  children,
  variant = "primary",
  loading = false,
  disabled,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = "",
  ...props
}: ButtonProps) {
  const variants = {
    primary:
      "bg-blue-600 hover:bg-blue-700 text-white",

    secondary:
      "bg-gray-200 hover:bg-gray-300 text-gray-800",

    success:
      "bg-green-600 hover:bg-green-700 text-white",

    danger:
      "bg-red-600 hover:bg-red-700 text-white",

    warning:
      "bg-yellow-500 hover:bg-yellow-600 text-white",

    logout:
      "bg-transparent border border-white/20 justify-start gap-2 text-white",
  };

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={twMerge(
        `
        inline-flex
        items-center
        justify-center
        gap-2
        rounded-lg
        px-4
        py-2.5
        text-sm
        font-medium
        transition-all
        duration-200
        cursor-pointer
        disabled:opacity-50
        disabled:cursor-not-allowed
        ${variants[variant]}
        ${fullWidth ? "w-full" : ""}
        `,
        className
      )}
    >
      {loading ? (
        <Spinner size="sm" />
      ) : (
        <>
          {leftIcon}

          <span>{children}</span>

          {rightIcon}
        </>
      )}
    </button>
  );
}