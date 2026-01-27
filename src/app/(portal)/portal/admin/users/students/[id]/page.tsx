"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PortalToast from "@/components/ui/PortalToast";

type StudentDetail = {
  id: string;
  rollNo: string;
  year: number;
  user: { id: string; name: string; email: string; isBlocked: boolean };
  department: { code: string; name: string };
  section: { name: string };
};

export default function StudentDetailPage() {
  const params = useParams();
  const studentId = params?.id as string;
  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; tone: "success" | "error" } | null>(
    null
  );

  const loadStudent = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/portal/students/${studentId}`);
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setMessage(data.error || "Unable to load student.");
        setStudent(null);
        return;
      }
      const data = await response.json().catch(() => null);
      if (!data) {
        setMessage("Student data not available.");
        setStudent(null);
        return;
      }
      setStudent(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) {
      loadStudent();
    }
  }, [studentId]);

  const handleToggleBlock = async () => {
    if (!student) return;
    setMessage(null);
    const nextBlockedState = !student.user.isBlocked;
    const confirmed = window.confirm(
      nextBlockedState
        ? `Block ${student.user.name}? They will not be able to log in.`
        : `Unblock ${student.user.name}? They will regain access.`
    );
    if (!confirmed) {
      return;
    }
    const response = await fetch(`/api/portal/students/${student.id}/block`, {
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

    await loadStudent();
    setToast({
      message: student.user.isBlocked ? "Student unblocked." : "Student blocked.",
      tone: "success",
    });
  };

  if (isLoading && !student) {
    return (
      <div className="portal-page">
        <p className="portal-card-note">Loading student...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="portal-page">
        {message ? <div className="portal-notice">{message}</div> : null}
        <div className="portal-empty-state">Student not found or unavailable.</div>
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
        <h1 className="portal-page-title">Student Profile</h1>
        <p className="portal-page-subtitle">View and manage this student account.</p>
      </div>

      {message ? <div className="portal-notice">{message}</div> : null}

      <div className="portal-card">
        <h3>{student.user.name}</h3>
        <p className="portal-card-note">Roll No: {student.rollNo}</p>
        <div className="portal-form-columns" style={{ marginTop: "1rem" }}>
          <div>
            <strong>Email</strong>
            <div>{student.user.email}</div>
          </div>
          <div>
            <strong>Year</strong>
            <div>{student.year}</div>
          </div>
          <div>
            <strong>Department</strong>
            <div>{student.department.code}</div>
          </div>
          <div>
            <strong>Section</strong>
            <div>{student.section.name}</div>
          </div>
          <div>
            <strong>Status</strong>
            <div>{student.user.isBlocked ? "Blocked" : "Active"}</div>
          </div>
        </div>
        <div className="portal-actions" style={{ marginTop: "1rem" }}>
          <button type="button" className="portal-button-outline" onClick={handleToggleBlock}>
            {student.user.isBlocked ? "Unblock" : "Block"} Student
          </button>
        </div>
      </div>
    </div>
  );
}
