"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar/Sidebar";
import MobileWarningDialog from "@/components/ui/MobileWarningDialog";


export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    
    if (!token || role !== "admin") {
      router.replace("/login");
      return;
    }
  
    (() => setCheckingAuth(false))();
  }, [router]);

  if (checkingAuth) return null;
  
  return (
    <div className="flex h-screen overflow-hidden">
      <MobileWarningDialog />
      <Sidebar />
      <main className="flex-1 bg-white pt-12 md:py-6 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
