"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { Role } from "@/lib/session";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import MobileDrawer from "@/components/layout/MobileDrawer";

export default function PortalShell({
  role,
  userName,
  userEmail,
  onLogout,
  children,
}: {
  role: Role;
  userName: string;
  userEmail: string;
  onLogout: () => void;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }

    document.body.style.overflow = "";
  }, [isDrawerOpen]);

  useEffect(() => {
    setIsDrawerOpen(false);
  }, [pathname]);

  return (
    <div className="portal-shell">
      <Sidebar role={role} activePath={pathname} />
      <div className="portal-main">
        <Topbar
          role={role}
          userName={userName}
          userEmail={userEmail}
          onMenuClick={() => setIsDrawerOpen(true)}
          onLogout={onLogout}
        />
        <div className="portal-content">{children}</div>
      </div>
      <MobileDrawer open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
        <Sidebar
          role={role}
          activePath={pathname}
          onNavigate={() => setIsDrawerOpen(false)}
          variant="mobile"
        />
      </MobileDrawer>
    </div>
  );
}
