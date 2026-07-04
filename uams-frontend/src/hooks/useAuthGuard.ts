"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function useAuthGuard() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    console.log("AuthGuard running");
  
    const token = localStorage.getItem("token");
    console.log("Token:", token);
  
    if (!token) {
      console.log("Redirecting...");
      router.push("/login");
      return;
    }
  
    setTimeout(() => {
      setCheckingAuth(false);
    }, 0);
  }, [router]);

  return checkingAuth;
}