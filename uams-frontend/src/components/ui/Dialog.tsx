"use client";

import { ReactNode, useEffect } from "react";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function Dialog({
  open,
  onClose,
  children,
}: DialogProps) {
  useEffect(() => {
    if (!open) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
        <div
          onClick={(e) => e.stopPropagation()}
          className="
            w-full
            max-w-md
            rounded-3xl
            bg-white
            shadow-2xl
            p-8
            animate-in
            fade-in
            zoom-in-95
          "
        >
          {children}
        </div>
      </div>
    </>
  );
}