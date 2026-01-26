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
  const items = [{ label: "Dashboard", href: `/portal/${role}` }];
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
