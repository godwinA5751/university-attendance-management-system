"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

import Profile from "./Profile";
import SidebarItem from "./SidebarItem";
import SidebarLogout from "./SidebarLogout";

import {
  LayoutDashboard,
  CalendarRange,
  BookOpen,
  Users,
  GraduationCap,
  UserCheck,
  ClipboardCheck,
  ChartColumn,
} from "lucide-react";

const navigationItems = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Academic Sessions",
    href: "/admin/academic-sessions",
    icon: CalendarRange,
  },
  {
    label: "Courses",
    href: "/admin/courses",
    icon: BookOpen,
  },
  {
    label: "Enrollments",
    href: "/admin/enrollments",
    icon: UserCheck,
  },
  {
    label: "Students",
    href: "/admin/students",
    icon: GraduationCap,
  },
  {
    label: "Lecturers",
    href: "/admin/lecturers",
    icon: Users,
  },
  {
    label: "Attendance",
    href: "/admin/attendance",
    icon: ClipboardCheck,
  },
  {
    label: "Analytics",
    href: "/admin/analytics",
    icon: ChartColumn,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="
        relative
        h-full
        w-62
        bg-gradient-to-b
        from-[#2563EB]
        via-[#1D4ED8]
        to-[#172554]
        rounded-r-[36px]
        overflow-hidden
        text-white
      "
    >
      <div className="flex h-full flex-col">

        <Profile />

        <nav className="flex-1 pl-4">
          <ul className="relative space-y-2">
            {navigationItems.map((item, index) => {
              const active = pathname === item.href;
        
              return (
                <div key={item.href} className="relative">
                  {active && (
                    <motion.div
                      layoutId="sidebar-active"
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 40,
                      }}
                      className="absolute inset-0 z-0"
                    >
                      {/* White pill */}
                      <div className="h-12 rounded-l-full rounded-r-none bg-white shadow-xl" />
        
                      {/* top notch */}
                      <div className="sidebar-notch-top" />
        
                      {/* bottom notch */}
                      <div className="sidebar-notch-bottom" />
                    </motion.div>
                  )}
        
                  <SidebarItem
                    label={item.label}
                    href={item.href}
                    icon={item.icon}
                    active={active}
                  />
                </div>
              );
            })}
          </ul>
        </nav>

        <div className="px-4 pb-6 pt-4">
          <SidebarLogout />
        </div>

      </div>
    </aside>
  );
}