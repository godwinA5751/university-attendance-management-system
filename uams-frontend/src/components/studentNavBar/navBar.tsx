"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import NavbarItems from "./navbarItems";
import SidebarLogout from "../sidebar/SidebarLogout";

import {
  LayoutDashboard,
  User,
  LucideIcon,
} from "lucide-react";

export interface navBarItemsProps {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const studentNavigationItems: navBarItemsProps[] = [
  {
    label: "Profile",
    href: "/student/profile",
    icon: User,
  },
  {
    label: "Dashboard",
    href: "/student/dashboard",
    icon: LayoutDashboard,
  },
];

interface navBarProps {
  items?: navBarItemsProps[];
}

export default function Navbar({
  items = studentNavigationItems,
}: navBarProps) {
  const pathname = usePathname();
  const navigationItems = items;

  return (
    <div
      className="
        absolute
        bottom-0
        left-0
        w-full
        md:fixed
        lg:w-[96%]
        md:w-[94%]
        md:bottom-6
        md:left-6
        md:right-8
        bg-linear-to-b
        from-[#2563EB]
        via-[#1D4ED8]
        to-[#172554]
        rounded-t-[30px]
        md:rounded-full
        overflow-hidden
        text-white
      "
    >
      <div className="flex flex-col pb-6">
        <nav className="flex-1 pl-4">
          <ul className="relative flex items-center justify-evenly">
            {navigationItems.map((item) => {
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
                      <div className="h-14 w-13.5 rounded-b-full bg-white shadow-lg" />
        
                      {/* left notch */}
                      <div className="navBar-notch-left" />
                      {/* right notch */}
                      <div className="navBar-notch-right" />
                    </motion.div>
                  )}
        
                  <NavbarItems
                    href={item.href}
                    icon={item.icon}
                    active={active}
                  />
                </div>
              );
            })}
            <div className="translate-y-3 lg:translate-y-1">
              <SidebarLogout />
            </div>
          </ul>
        </nav>
      </div>
    </div>
  );
}