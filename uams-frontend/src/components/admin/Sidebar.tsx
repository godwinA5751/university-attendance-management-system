"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

const navigationItems = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "Academic Sessions", href: "/admin/academic-sessions" },
  { label: "Courses", href: "/admin/courses" },
  { label: "Enrollments", href: "/admin/enrollments" },
  { label: "Students", href: "/admin/students" },
  { label: "Lecturers", href: "/admin/lecturers" },
  { label: "Attendance", href: "/admin/attendance" },
  { label: "Analytics", href: "/admin/analytics" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
  
    router.replace("/login");
  };
  return (
    <aside className="w-64 border-r border-sky-200 p-4">
      <nav>
        <ul>
          {navigationItems.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                className={`block p-2 rounded-2xl ${
                  pathname === item.href
                    ? "bg-gray-200 font-bold"
                    : ""
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
          <button onClick={handleLogout}>
            Logout
          </button>
        </ul>
      </nav>
    </aside>
  );
}
