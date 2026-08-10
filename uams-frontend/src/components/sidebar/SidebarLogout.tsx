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
    <div className="flex items-center lg:px-8 justify-center">
      <Button
        leftIcon={<LogOut size={18} />}
        variant="logout"
        onClick={handleLogout}
        fullWidth
      >
        <span className="hidden lg:block">Logout</span>
      </Button>
    </div>
  );
}