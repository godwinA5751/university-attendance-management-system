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
    <li className="relative h-14">
      <Link
        href={href}
        className={`
          relative
          z-20
          flex
          h-14
          items-center
          gap-2
          px-4
          rounded-full
          transition-colors
          duration-300
          ${
            active
              ? "text-blue-700 font-semibold translate-x-2 pb-2"
              : "text-white hover:text-white"
          }
        `}
      >
        <Icon size={22} />

        <span>{label}</span>
      </Link>
    </li>
  );
}