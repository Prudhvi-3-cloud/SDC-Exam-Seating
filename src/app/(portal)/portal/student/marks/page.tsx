"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchPortal } from "@/lib/portal-client";

type MarksRecordDto = {
  id: string;
  studentId: string;
  semester: number;
  subject: string;
  marks: number;
  createdAt: string;
};

type MarksResponse = {
  availableSemesters: number[];
  latestSemester: number | null;
  activeSemester: number | null;
  records: MarksRecordDto[];
};

export default function StudentMarksPage() {
  const [data, setData] = useState<MarksResponse | null>(null);
  const [activeSemester, setActiveSemester] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (semester?: number | null) => {
    setLoading(true);
    setError(null);
    try {
      const query = semester ? `?semester=${semester}` : "";
      const response = await fetchPortal(`/api/portal/student/marks${query}`);
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || "Unable to load marks.");
      }
      const payload = (await response.json()) as MarksResponse;
      setData(payload);
      setActiveSemester(payload.activeSemester);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load marks.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const averageMarks = useMemo(() => {
    if (!data?.records?.length) {
      return null;
    }
    const total = data.records.reduce((sum, record) => sum + record.marks, 0);
    return Math.round(total / data.records.length);
  }, [data]);

  return (
    <div className="portal-page">
      <div>
        <p className="portal-brand">Student</p>
        <h1 className="portal-page-title">Marks</h1>
        <p className="portal-page-subtitle">View your marks semester by semester.</p>
      </div>

      {error ? <div className="portal-notice">{error}</div> : null}

      <div className="portal-card">
        <div className="portal-actions" style={{ justifyContent: "space-between", width: "100%" }}>
          <div className="field" style={{ minWidth: "180px", maxWidth: "260px" }}>
            <label htmlFor="semester">Semester</label>
            <select
              id="semester"
              className="select"
              value={activeSemester ?? ""}
              onChange={(event) => {
                const nextSemester = Number(event.target.value);
                setActiveSemester(Number.isFinite(nextSemester) ? nextSemester : null);
                load(Number.isFinite(nextSemester) ? nextSemester : null);
              }}
              disabled={loading || !data?.availableSemesters?.length}
            >
              {data?.availableSemesters?.length ? null : <option value="">No semesters</option>}
              {data?.availableSemesters?.map((semester) => (
                <option key={semester} value={semester}>
                  Semester {semester}
                </option>
              ))}
            </select>
          </div>
          <div className="student-profile-item" style={{ minWidth: "180px" }}>
            <div className="student-profile-label">Average</div>
            <div className="student-summary-value">{averageMarks ?? "--"}</div>
            <div className="student-summary-meta">
              {data?.records?.length ? `${data.records.length} subjects` : "Awaiting results"}
            </div>
          </div>
        </div>
      </div>

      <div className="portal-card">
        <h3>Semester Results</h3>
        <div className="portal-table-wrapper" style={{ marginTop: "0.75rem" }}>
          <table className="portal-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Marks</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={2} className="portal-card-note">
                    Loading marks...
                  </td>
                </tr>
              ) : data?.records?.length ? (
                data.records.map((record) => (
                  <tr key={record.id}>
                    <td>{record.subject}</td>
                    <td>{record.marks}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2}>
                    <div className="portal-empty-state">No marks found for this semester.</div>
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
