"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/studentNavBar/navBar";

export default function StudentProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "student") {
      router.replace("/login");
      return;
    }

    (() => setCheckingAuth(false))();
  }, [router]);

  if (checkingAuth) return null;

  return (
    <div className="flex h-screen overflow-hidden">
      <Navbar/>
      <main className="flex-1 bg-white pt-12 md:py-6 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}