"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import SritShell from "@/components/SritShell";

export default function AdminHome() {
  const router = useRouter();
  const [isAllowed, setIsAllowed] = useState(false);
  const [examType, setExamType] = useState("MID");
  const [daysCount, setDaysCount] = useState(2);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const allowed = localStorage.getItem("sritAdminAuthed") === "true";
    if (!allowed) {
      router.replace("/admin/login");
      return;
    }
    setIsAllowed(true);
  }, [router]);

  const handleCreate = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examType, daysCount }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Unable to create session.");
      }

      const session = await response.json();
      router.push(`/admin/session/${session.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAllowed) {
    return null;
  }

  return (
    <SritShell title="Exam Seating Arrangement" wide>
      <div className="grid grid-two">
        <div className="card">
          <div className="card-title">Create Exam Session</div>
          <div className="card-body">
            <div className="grid">
              <div className="field">
                <label htmlFor="examType">Exam Type</label>
                <select
                  id="examType"
                  className="select"
                  value={examType}
                  onChange={(event) => setExamType(event.target.value)}
                >
                  <option value="MID">MID</option>
                  <option value="SEM">SEM</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="daysCount">Number of Days</label>
                <input
                  id="daysCount"
                  className="input"
                  type="number"
                  min={1}
                  max={30}
                  value={daysCount}
                  onChange={(event) => setDaysCount(Number(event.target.value))}
                />
              </div>
              {error ? <div className="notice">{error}</div> : null}
              <div className="section-actions">
                <button className="button" onClick={handleCreate} disabled={isSaving}>
                  {isSaving ? "Creating..." : "Create Session"}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-title">Workflow Snapshot</div>
          <div className="card-body">
            <p className="kicker">What you can do next</p>
            <ul>
              <li>Select students by year and department.</li>
              <li>Choose active rooms and check capacity.</li>
              <li>Generate plans and preview seating grids.</li>
              <li>Build dry-run email notifications.</li>
            </ul>
            <div className="notice" style={{ marginTop: "1rem" }}>
              Use the SRIT orange tabs to keep every step aligned with the campus theme.
            </div>
          </div>
        </div>
      </div>
    </SritShell>
  );
}
