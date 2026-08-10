"use client";

import { useEffect, useRef, useState } from "react";

type Option = {
  label: string;
  value: string;
};

interface MultiSelectProps {
  label?: string;
  placeholder?: string;
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
}

export default function MultiSelect({
  label,
  placeholder = "Select...",
  options,
  value,
  onChange,
  error,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);

  const containerRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (
      e: MouseEvent
    ) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          e.target as Node
        )
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
  }, []);

  const toggleOption = (
    optionValue: string
  ) => {
    if (value.includes(optionValue)) {
      onChange(
        value.filter(
          (item) => item !== optionValue
        )
      );
    } else {
      onChange([...value, optionValue]);
    }
  };

  const selectedLabels = options
    .filter((option) =>
      value.includes(option.value)
    )
    .map((option) => option.label);

  return (
    <div
      ref={containerRef}
      className="flex flex-col gap-1 relative"
    >
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() =>
          setOpen(!open)
        }
        className="
          h-10
          rounded-lg
          border
          border-gray-300
          bg-white
          px-3
          text-left
          text-sm
          flex
          items-center
          justify-between
          cursor-pointer
        "
      >
        <span className="truncate">
          {selectedLabels.length > 0
            ? selectedLabels.join(", ")
            : placeholder}
        </span>

        <span
          className={`transition-transform ${
            open ? "rotate-180" : ""
          }`}
        >
          ▼
        </span>
      </button>

      {open && (
        <div
          className="
            absolute
            top-full
            mt-1
            w-full
            rounded-lg
            border
            bg-white
            shadow-lg
            z-50
            max-h-64
            overflow-y-auto
          "
        >
          {options.length === 0 ? (
            <div className="p-3 text-sm text-gray-500">
              No options available.
            </div>
          ) : (
            options.map((option) => (
              <label
                key={option.value}
                className="
                  flex
                  items-center
                  gap-3
                  px-4
                  py-3
                  hover:bg-gray-50
                  cursor-pointer
                "
              >
                <input
                  type="checkbox"
                  checked={value.includes(
                    option.value
                  )}
                  onChange={() =>
                    toggleOption(
                      option.value
                    )
                  }
                />

                <span className="text-sm">
                  {option.label}
                </span>
              </label>
            ))
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}