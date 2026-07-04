import React from "react";

interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({
  label,
  error,
  className = "",
  ...props
}: InputProps) {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label
          htmlFor={props.id}
          className="text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}

      <input
        {...props}
        className={`
          w-full
          rounded-lg
          border
          px-4
          py-2
          outline-none
          transition
          border-gray-300
          focus:ring-2
          focus:ring-blue-500
          focus:border-blue-500
          disabled:bg-gray-100
          disabled:cursor-not-allowed
          ${error ? "border-red-500" : ""}
          ${className}
        `}
      />

      {error && (
        <p className="text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}