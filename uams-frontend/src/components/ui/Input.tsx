import React from "react";

interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export default function Input({
  label,
  error,
  helperText,
  className = "",
  required,
  type = "text",
  ...props
}: InputProps) {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={props.id ?? props.name}
          className="block text-sm font-medium text-gray-700"
        >
          {label}

          {required && (
            <span className="text-red-500 ml-1">*</span>
          )}
        </label>
      )}

      <input
        {...props}
        type={type}
        required={required}
        className={`
          w-full
          rounded-lg
          border
          px-4
          py-2.5
          text-sm
          text-gray-900
          bg-white
          border-gray-300
          outline-none
          transition-all
          duration-200

          focus:border-blue-500
          focus:ring-2
          focus:ring-blue-200

          disabled:bg-gray-100
          disabled:text-gray-500
          disabled:cursor-not-allowed

          ${error ? "border-red-500 focus:border-red-500 focus:ring-red-200" : ""}

          ${type === "date" ? "cursor-pointer" : ""}

          ${className}
        `}
      />

      {error ? (
        <p className="text-sm text-red-500">
          {error}
        </p>
      ) : helperText ? (
        <p className="text-sm text-gray-500">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}