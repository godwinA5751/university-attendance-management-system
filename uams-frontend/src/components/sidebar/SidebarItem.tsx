"use client";

import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface SidebarItemProps {
  label: string;
  href: string;
  icon: LucideIcon;
  active: boolean;
}

export default function SidebarItem({
  label,
  href,
  icon: Icon,
  active,
}: SidebarItemProps) {
  return (
    <li className="relative h-12">
      <Link
        href={href}
        className={`
          relative
          z-20
          flex
          h-14
          items-center
          gap-0
          lg:gap-2
          px-2
          lg:px-4
          rounded-full
          transition-colors
          duration-300
          ${
            active
              ? "text-blue-700 font-semibold pb-2"
              : "text-white hover:text-white"
          }
        `}
      >
        <Icon size={22} />

        <span className="hidden lg:block">{label}</span>
      </Link>
    </li>
  );
}