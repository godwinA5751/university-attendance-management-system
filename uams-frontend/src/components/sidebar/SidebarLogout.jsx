"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { LogOut } from "lucide-react";

export default function SidebarLogout() {
  const router = useRouter();

const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");

  router.replace("/login");
};
  return (
    <Button
      leftIcon={<LogOut size={18} />}
      variant="logout"
      onClick={handleLogout}
    >
      Logout
    </Button>
  );
}