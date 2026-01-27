"use client";

import { AttendanceStatus } from "@prisma/client";
import { useEffect, useMemo, useState } from "react";
import { fetchPortal } from "@/lib/portal-client";

type AttendanceRecordDto = {
  id: string;
  studentId: string;
  date: string;
  subject: string;
  status: AttendanceStatus;
  createdAt: string;
};

type AttendanceResponse = {
  summary: {
    totalCount: number;
    presentCount: number;
    absentCount: number;
    percentage: number;
  };
  records: AttendanceRecordDto[];
};

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export default function StudentAttendancePage() {
  const [data, setData] = useState<AttendanceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchPortal("/api/portal/student/attendance");
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.error || "Unable to load attendance.");
        }
        const payload = (await response.json()) as AttendanceResponse;
        if (!cancelled) {
          setData(payload);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to load attendance.");
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

  const subjectSummary = useMemo(() => {
    if (!data?.records?.length) {
      return [] as { subject: string; present: number; total: number; percentage: number }[];
    }
    const map = new Map<string, { present: number; total: number }>();
    data.records.forEach((record) => {
      const current = map.get(record.subject) ?? { present: 0, total: 0 };
      current.total += 1;
      if (record.status === AttendanceStatus.PRESENT) {
        current.present += 1;
      }
      map.set(record.subject, current);
    });
    return Array.from(map.entries())
      .map(([subject, counts]) => ({
        subject,
        present: counts.present,
        total: counts.total,
        percentage: counts.total === 0 ? 0 : Math.round((counts.present / counts.total) * 100),
      }))
      .sort((a, b) => a.subject.localeCompare(b.subject));
  }, [data]);

  return (
    <div className="portal-page">
      <div>
        <p className="portal-brand">Student</p>
        <h1 className="portal-page-title">Attendance</h1>
        <p className="portal-page-subtitle">Your daily attendance records across subjects.</p>
      </div>

      {error ? <div className="portal-notice">{error}</div> : null}

      <div className="portal-card">
        {loading ? (
          <p className="portal-card-note">Loading attendance summary...</p>
        ) : data ? (
          <div className="student-summary-grid">
            <div className="student-profile-item">
              <div className="student-profile-label">Total Classes</div>
              <div className="student-summary-value">{data.summary.totalCount}</div>
              <div className="student-summary-meta">All recorded sessions</div>
            </div>
            <div className="student-profile-item">
              <div className="student-profile-label">Present</div>
              <div className="student-summary-value">{data.summary.presentCount}</div>
              <div className="student-summary-meta">Attended sessions</div>
            </div>
            <div className="student-profile-item">
              <div className="student-profile-label">Attendance</div>
              <div className="student-summary-value">{data.summary.percentage}%</div>
              <div className="student-summary-meta">Overall percentage</div>
            </div>
          </div>
        ) : (
          <div className="portal-empty-state">No attendance data available.</div>
        )}
      </div>

      <div className="portal-card">
        <h3>Subject-wise Snapshot</h3>
        {loading ? (
          <p className="portal-card-note">Loading subjects...</p>
        ) : subjectSummary.length ? (
          <div className="portal-form-columns" style={{ marginTop: "0.75rem" }}>
            {subjectSummary.map((subject) => (
              <div key={subject.subject} className="student-profile-item">
                <div className="student-profile-label">{subject.subject}</div>
                <div className="student-profile-value">
                  {subject.present} / {subject.total}
                </div>
                <div className="student-summary-meta">{subject.percentage}% present</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="portal-empty-state" style={{ marginTop: "0.75rem" }}>
            Subject summaries will appear here.
          </div>
        )}
      </div>

      <div className="portal-card">
        <h3>Attendance Log</h3>
        <div className="portal-table-wrapper" style={{ marginTop: "0.75rem" }}>
          <table className="portal-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Subject</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="portal-card-note">
                    Loading attendance...
                  </td>
                </tr>
              ) : data?.records?.length ? (
                data.records.map((record) => (
                  <tr key={record.id}>
                    <td>{dateFormatter.format(new Date(record.date))}</td>
                    <td>{record.subject}</td>
                    <td>
                      <span
                        className={`portal-status-pill ${
                          record.status === AttendanceStatus.PRESENT
                            ? "portal-status-present"
                            : "portal-status-absent"
                        }`}
                      >
                        {record.status === AttendanceStatus.PRESENT ? "Present" : "Absent"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3}>
                    <div className="portal-empty-state">No attendance records found.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
