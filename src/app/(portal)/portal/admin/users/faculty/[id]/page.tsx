"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PortalToast from "@/components/ui/PortalToast";

type FacultyDetail = {
  id: string;
  user: { id: string; name: string; email: string; isBlocked: boolean };
  department: { code: string; name: string };
  sectionAccess: { id: string; section: { year: number; name: string } }[];
};

export default function FacultyDetailPage() {
  const params = useParams();
  const facultyId = params?.id as string;
  const [faculty, setFaculty] = useState<FacultyDetail | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; tone: "success" | "error" } | null>(
    null
  );

  const loadFaculty = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/portal/faculty/${facultyId}`);
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setMessage(data.error || "Unable to load faculty.");
        setFaculty(null);
        return;
      }
      const data = await response.json().catch(() => null);
      if (!data) {
        setMessage("Faculty data not available.");
        setFaculty(null);
        return;
      }
      setFaculty(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (facultyId) {
      loadFaculty();
    }
  }, [facultyId]);

  const handleToggleBlock = async () => {
    if (!faculty) return;
    setMessage(null);
    const nextBlockedState = !faculty.user.isBlocked;
    const confirmed = window.confirm(
      nextBlockedState
        ? `Block ${faculty.user.name}? They will not be able to log in.`
        : `Unblock ${faculty.user.name}? They will regain access.`
    );
    if (!confirmed) {
      return;
    }
    const response = await fetch(`/api/portal/faculty/${faculty.id}/block`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isBlocked: nextBlockedState }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setMessage(data.error || "Unable to update status.");
      setToast({ message: data.error || "Unable to update status.", tone: "error" });
      return;
    }

    await loadFaculty();
    setToast({
      message: faculty.user.isBlocked ? "Faculty unblocked." : "Faculty blocked.",
      tone: "success",
    });
  };

  if (isLoading && !faculty) {
    return (
      <div className="portal-page">
        <p className="portal-card-note">Loading faculty...</p>
      </div>
    );
  }

  if (!faculty) {
    return (
      <div className="portal-page">
        {message ? <div className="portal-notice">{message}</div> : null}
        <div className="portal-empty-state">Faculty profile not found or unavailable.</div>
      </div>
    );
  }

  return (
    <div className="portal-page">
      <PortalToast
        message={toast?.message ?? null}
        tone={toast?.tone ?? "success"}
        onClose={() => setToast(null)}
      />
      <div>
        <p className="portal-brand">Admin</p>
        <h1 className="portal-page-title">Faculty Profile</h1>
        <p className="portal-page-subtitle">View and manage this faculty account.</p>
      </div>

      {message ? <div className="portal-notice">{message}</div> : null}

      <div className="portal-card">
        <h3>{faculty.user.name}</h3>
        <p className="portal-card-note">Department: {faculty.department.code}</p>
        <div className="portal-form-columns" style={{ marginTop: "1rem" }}>
          <div>
            <strong>Email</strong>
            <div>{faculty.user.email}</div>
          </div>
          <div>
            <strong>Status</strong>
            <div>{faculty.user.isBlocked ? "Blocked" : "Active"}</div>
          </div>
        </div>
        <div style={{ marginTop: "1rem" }}>
          <strong>Section Access</strong>
          <div className="portal-actions" style={{ marginTop: "0.5rem" }}>
            {faculty.sectionAccess.map((access) => (
              <span key={access.id} className="portal-pill">
                {access.section.year}-{access.section.name}
              </span>
            ))}
          </div>
        </div>
        <div className="portal-actions" style={{ marginTop: "1rem" }}>
          <button type="button" className="portal-button-outline" onClick={handleToggleBlock}>
            {faculty.user.isBlocked ? "Unblock" : "Block"} Faculty
          </button>
        </div>
      </div>
    </div>
  );
}
