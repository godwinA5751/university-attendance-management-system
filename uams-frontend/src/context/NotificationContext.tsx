"use client";

import {
  createContext,
  useContext,
  useState,
  useRef,
  ReactNode,
} from "react";

import Notification from "@/components/ui/Notification";

type NotificationType =
  | "success"
  | "error"
  | "warning"
  | "info";

interface NotificationState {
  open: boolean;
  type: NotificationType;
  message: string;
}

interface NotificationContextType {
  notify: (
    type: NotificationType,
    message: string
  ) => void;
}

const NotificationContext =
  createContext<NotificationContextType | null>(null);

export function NotificationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [notification, setNotification] =
    useState<NotificationState>({
      open: false,
      type: "info",
      message: "",
    });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const notify = (
    type: NotificationType,
    message: string
  ) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setNotification({
      open: true,
      type,
      message,
    });

    timeoutRef.current = setTimeout(() => {
      setNotification((prev) => ({
        ...prev,
        open: false,
      }));

      timeoutRef.current = null;
    }, 3000);
  };

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}

      <Notification
        open={notification.open}
        type={notification.type}
        message={notification.message}
      />
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotification must be used inside NotificationProvider"
    );
  }

  return context;
}