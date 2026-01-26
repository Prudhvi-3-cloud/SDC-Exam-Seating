"use client";

import type { Role } from "@/lib/session";

const roleLabels: Record<Role, string> = {
  admin: "Admin",
  faculty: "Faculty",
  student: "Student",
};

export default function Topbar({
  role,
  userName,
  userEmail,
  onMenuClick,
  onLogout,
}: {
  role: Role;
  userName: string;
  userEmail: string;
  onMenuClick: () => void;
  onLogout: () => void;
}) {
  return (
    <header className="portal-topbar">
      <div className="portal-topbar-meta">
        <button
          type="button"
          className="portal-hamburger"
          aria-label="Open navigation"
          onClick={onMenuClick}
        >
          ?
        </button>
        <div>
          <div className="portal-topbar-title">{roleLabels[role]} Portal</div>
          <div>{userName}</div>
        </div>
      </div>
      <div className="portal-topbar-meta">
        <span>{userEmail}</span>
        <button type="button" className="portal-button-outline" onClick={onLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}
