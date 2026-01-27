"use client";

import Link from "next/link";
import type { Role } from "@/lib/session";

const roleLabels: Record<Role, string> = {
  admin: "Admin",
  faculty: "Faculty",
  student: "Student",
};

export default function Sidebar({
  role,
  activePath,
  onNavigate,
  variant = "desktop",
}: {
  role: Role;
  activePath?: string | null;
  onNavigate?: () => void;
  variant?: "desktop" | "mobile";
}) {
  const items =
    role === "admin"
      ? [
          { label: "Dashboard", href: "/portal/admin" },
          { label: "Exam Planning", href: "/portal/admin/examplanning" },
          { label: "Departments", href: "/portal/admin/departments" },
          { label: "Students", href: "/portal/admin/users/students" },
          { label: "Faculty", href: "/portal/admin/users/faculty" },
        ]
      : role === "student"
        ? [
            { label: "Dashboard", href: "/portal/student" },
            { label: "Profile", href: "/portal/student/profile" },
            { label: "Attendance", href: "/portal/student/attendance" },
            { label: "Marks", href: "/portal/student/marks" },
            { label: "Fees", href: "/portal/student/fees" },
            { label: "Timetable", href: "/portal/student/timetable" },
            { label: "Remarks", href: "/portal/student/remarks" },
          ]
        : [{ label: "Dashboard", href: `/portal/${role}` }];
  const containerClass =
    variant === "mobile" ? "portal-sidebar portal-sidebar-mobile" : "portal-sidebar";

  return (
    <aside className={containerClass} aria-label="Portal sidebar">
      <div className="portal-brand">SRIT Portal</div>
      <h2>{roleLabels[role]} Dashboard</h2>
      <nav className="portal-nav" aria-label="Portal navigation">
        {items.map((item) => {
          const isActive = activePath?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={isActive ? "active" : undefined}
              onClick={onNavigate}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
