"use client";

import { useEffect, useState } from "react";
import { fetchPortal } from "@/lib/portal-client";

type RemarkDto = {
  id: string;
  studentId: string;
  text: string;
  createdAt: string;
  byFacultyName: string | null;
};

type RemarksResponse = {
  remarks: RemarkDto[];
  count: number;
};

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export default function StudentRemarksPage() {
  const [data, setData] = useState<RemarksResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchPortal("/api/portal/student/remarks");
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.error || "Unable to load remarks.");
        }
        const payload = (await response.json()) as RemarksResponse;
        if (!cancelled) {
          setData(payload);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to load remarks.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="portal-page">
      <div>
        <p className="portal-brand">Student</p>
        <h1 className="portal-page-title">Remarks</h1>
        <p className="portal-page-subtitle">Latest faculty remarks and feedback for you.</p>
      </div>

      {error ? <div className="portal-notice">{error}</div> : null}

      <div className="portal-card">
        {loading ? (
          <p className="portal-card-note">Loading remarks...</p>
        ) : data?.remarks?.length ? (
          <div className="portal-form-grid">
            {data.remarks.map((remark) => (
              <div key={remark.id} className="student-profile-item">
                <div className="portal-actions" style={{ justifyContent: "space-between" }}>
                  <div className="student-profile-label">{dateFormatter.format(new Date(remark.createdAt))}</div>
                  <span className="portal-pill">{remark.byFacultyName ?? "Faculty"}</span>
                </div>
                <div className="student-profile-value" style={{ whiteSpace: "pre-wrap" }}>
                  {remark.text}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="portal-empty-state">No remarks yet.</div>
        )}
      </div>
    </div>
  );
}
