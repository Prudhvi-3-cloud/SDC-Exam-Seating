"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import PortalShell from "@/components/layout/PortalShell";
import { clearSession, getSession, type Session } from "@/lib/session";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<Session | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const stored = getSession();
    if (!stored) {
      const roleSegment = pathname?.split("/")[2];
      const nextRole =
        roleSegment === "admin" || roleSegment === "faculty" || roleSegment === "student"
          ? roleSegment
          : "student";
      router.replace(`/login?role=${nextRole}`);
      setChecked(true);
      return;
    }

    setSession(stored);
    setChecked(true);
  }, [pathname, router]);

  useEffect(() => {
    if (!checked || !session || !pathname) {
      return;
    }

    const roleSegment = pathname.split("/")[2];
    if (roleSegment && roleSegment !== session.role) {
      router.replace(`/portal/${session.role}`);
    }
  }, [checked, session, pathname, router]);

  const handleLogout = () => {
    clearSession();
    router.replace("/login");
  };

  if (!checked || !session) {
    return (
      <div className="portal-shell portal-shell-loading" role="status" aria-live="polite">
        <aside className="portal-sidebar portal-sidebar-loading">
          <div className="portal-loading-block portal-loading-wide" />
          <div className="portal-loading-block portal-loading-medium" />
          <div className="portal-loading-stack">
            <div className="portal-loading-line" />
            <div className="portal-loading-line" />
            <div className="portal-loading-line" />
          </div>
        </aside>
        <div className="portal-main">
          <div className="portal-topbar portal-topbar-loading">
            <div className="portal-loading-line portal-loading-medium" />
            <div className="portal-loading-line portal-loading-short" />
          </div>
          <div className="portal-content">
            <div className="portal-loading-card">
              <div className="portal-loading-spinner" aria-hidden="true" />
              <div>
                <p className="portal-auth-title" style={{ marginBottom: "0.35rem" }}>
                  Loading portal
                </p>
                <p className="portal-auth-muted">Checking your session...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PortalShell
      role={session.role}
      userName={session.name}
      userEmail={session.email}
      onLogout={handleLogout}
    >
      {children}
    </PortalShell>
  );
}
