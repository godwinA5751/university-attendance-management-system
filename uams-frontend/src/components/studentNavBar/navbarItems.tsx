"use client";

import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface navBarItemsProps {
  href: string;
  icon: LucideIcon;
  active: boolean;
}

export default function NavbarItems({
  href,
  icon: Icon,
  active,
}: navBarItemsProps) {
  return (
    <li className="relative h-12 ">
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
          px-4
          lg:px-4
          rounded-full
          transition-all
          duration-300
          ${
            active
              ? "text-blue-700 "
              : "text-white hover:text-white"
          }
        `}
      >
        <Icon size={22} className={`${
          active ? "-translate-y-1.5 scale-130 z-10 shadow-[0_6px_12px_rgba(0,0,0,0.2)] rounded-full" : "translate-y-2 scale-100 z-0"
        }`} />
      </Link>
    </li>
  );
}