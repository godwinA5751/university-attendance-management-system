"use client";

import {
  CheckCircle,
  CircleAlert,
  Info,
  TriangleAlert,
} from "lucide-react";

interface NotificationProps {
  open: boolean;
  type:
    | "success"
    | "error"
    | "warning"
    | "info";

  message: string;
}

export default function Notification({
  open,
  type,
  message,
}: NotificationProps) {
  if (!open) return null;

  const styles = {
    success: {
      icon: <CheckCircle size={20} />,
      color:
        "bg-green-600 text-white",
    },

    error: {
      icon: <CircleAlert size={20} />,
      color:
        "bg-red-600 text-white",
    },

    warning: {
      icon: <TriangleAlert size={20} />,
      color:
        "bg-yellow-500 text-white",
    },

    info: {
      icon: <Info size={20} />,
      color:
        "bg-blue-600 text-white",
    },
  };

  return (
    <div
      className={`
        fixed
        top-5
        right-5
        z-50

        flex
        items-center
        gap-3

        rounded-xl

        px-5
        py-4

        shadow-xl

        animate-in
        slide-in-from-top

        ${styles[type].color}
      `}
    >
      {styles[type].icon}

      <p className="text-sm font-medium">
        {message}
      </p>
    </div>
  );
}