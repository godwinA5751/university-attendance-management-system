"use client";
import { getCurrentUser } from "@/services/authService";
import { useEffect, useState } from "react";
import { User } from "@/types/auth";

export default function Topbar() {
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

  return (
    <header className="border-b border-sky-200 p-4 flex justify-between items-center">
      <h1>UAMS</h1>

      <div className="text-sm md:text-lg">
        {user ? `Welcome, ${user.data.firstName} ${user.data.lastName}` : 
          <div className="h-4 w-40 rounded bg-gray-300 animate-pulse"></div>}
      </div>
    </header>
  );
}