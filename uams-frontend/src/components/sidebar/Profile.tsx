"use client";

import { getCurrentUser } from "@/services/authService";
import { User } from "@/types/auth";
import { useEffect, useState } from "react";

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getCurrentUser();
        setUser(response);
      } catch (error) {
        console.error(error);
      }
    };

    fetchUser();
  }, []);

  if (!user) {
    return (
      <div className="flex flex-col items-center py-8 animate-pulse">
        <div className="h-17 w-17 rounded-full bg-blue-400/30" />
        <div className="mt-1 h-5 w-36 rounded bg-blue-400/30" />
        <div className="mt-1 h-4 w-24 rounded bg-blue-400/20" />
      </div>
    );
  }

  const initials = `${user.data.firstName[0]}${user.data.lastName[0]}`;

  return (
    <div className="flex flex-col items-center py-8 h-45">
      {/* Avatar */}
      <div className="relative">
        <div className="flex h-17 w-17 items-center justify-center rounded-full border-4 border-cyan-300 bg-white text-2xl font-bold text-blue-700 shadow-lg">
          {initials}
        </div>

        {/* Online indicator */}
        <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-white bg-green-500" />
      </div>

      {/* Name */}
      <h2 className="mt-1 text-lg font-semibold text-white text-center">
        {user.data.firstName} {user.data.lastName}
      </h2>

      {/* Role */}
      <span className="mt-1 rounded-full bg-white/15 px-3 py-1 text-xs font-medium uppercase tracking-wider text-blue-100">
        {user.data.role}
      </span>
    </div>
  );
}