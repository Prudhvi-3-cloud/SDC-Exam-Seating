"use client";

import { AttendanceStatus } from "@prisma/client";
import { useEffect, useMemo, useState } from "react";
import { fetchPortal } from "@/lib/portal-client";

type SectionDto = {
  id: string;
  year: number;
  name: string;
  department: {
    id: string;
    code: string;
    name: string;
  };
};

type SectionsResponse = {
  sections: SectionDto[];
};

type StudentDto = {
  id: string;
  rollNo: string;
  name: string;
  year: number;
  department: {
    id: string;
    code: string;
    name: string;
  };
  section: {
    id: string;
    name: string;
    year: number;
  };
};

type StudentsResponse = {
  section: SectionDto;
  students: StudentDto[];
};

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const bullet = "\u2022";

function getTodayInputValue() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function FacultyAttendancePage() {
  const [sections, setSections] = useState<SectionDto[]>([]);
  const [sectionsLoading, setSectionsLoading] = useState(true);
  const [sectionsError, setSectionsError] = useState<string | null>(null);

  const [year, setYear] = useState<number | null>(null);
  const [sectionId, setSectionId] = useState<string>("");

  const [students, setStudents] = useState<StudentDto[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState<string | null>(null);

  const [dateValue, setDateValue] = useState(getTodayInputValue);
  const [statusByStudentId, setStatusByStudentId] = useState<Record<string, AttendanceStatus>>({});

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const loadSections = async () => {
      setSectionsLoading(true);
      setSectionsError(null);
      try {
        const response = await fetchPortal("/api/portal/faculty/attendance/sections");
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.error || "Unable to load allowed sections.");
        }
        const payload = (await response.json()) as SectionsResponse;
        if (cancelled) {
          return;
        }
        setSections(payload.sections);
        if (payload.sections.length) {
          const first = payload.sections[0];
          setYear(first.year);
          setSectionId(first.id);
        }
      } catch (err) {
        if (!cancelled) {
          setSectionsError(err instanceof Error ? err.message : "Unable to load allowed sections.");
        }
      } finally {
        if (!cancelled) {
          setSectionsLoading(false);
        }
      }
    };

    loadSections();

    return () => {
      cancelled = true;
    };
  }, []);

  const availableYears = useMemo(() => {
    return Array.from(new Set(sections.map((section) => section.year))).sort((a, b) => a - b);
  }, [sections]);

  const sectionsForYear = useMemo(() => {
    if (year === null) {
      return [] as SectionDto[];
    }
    return sections.filter((section) => section.year === year);
  }, [sections, year]);

  useEffect(() => {
    if (year === null) {
      return;
    }
    if (!sectionsForYear.length) {
      setSectionId("");
      return;
    }
    const stillValid = sectionsForYear.some((section) => section.id === sectionId);
    if (!stillValid) {
      setSectionId(sectionsForYear[0].id);
    }
  }, [year, sectionsForYear, sectionId]);

  useEffect(() => {
    if (!year || !sectionId) {
      setStudents([]);
      setStatusByStudentId({});
      return;
    }

    let cancelled = false;
    const loadStudents = async () => {
      setStudentsLoading(true);
      setStudentsError(null);
      setMessage(null);
      try {
        const params = new URLSearchParams({
          year: String(year),
          sectionId,
        });
        const response = await fetchPortal(`/api/portal/faculty/attendance/students?${params.toString()}`);
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.error || "Unable to load students for this section.");
        }
        const payload = (await response.json()) as StudentsResponse;
        if (cancelled) {
          return;
        }
        setStudents(payload.students);
        const initialStatuses: Record<string, AttendanceStatus> = {};
        payload.students.forEach((student) => {
          initialStatuses[student.id] = AttendanceStatus.PRESENT;
        });
        setStatusByStudentId(initialStatuses);
      } catch (err) {
        if (!cancelled) {
          setStudents([]);
          setStatusByStudentId({});
          setStudentsError(err instanceof Error ? err.message : "Unable to load students.");
        }
      } finally {
        if (!cancelled) {
          setStudentsLoading(false);
        }
      }
    };

    loadStudents();

    return () => {
      cancelled = true;
    };
  }, [year, sectionId]);

  const selectedSection = sections.find((section) => section.id === sectionId) ?? null;

  const totals = useMemo(() => {
    const values = students.map((student) => statusByStudentId[student.id] ?? AttendanceStatus.PRESENT);
    const presentCount = values.filter((value) => value === AttendanceStatus.PRESENT).length;
    const absentCount = values.length - presentCount;
    return {
      total: values.length,
      presentCount,
      absentCount,
    };
  }, [students, statusByStudentId]);

  const toggleStatus = (studentId: string) => {
    setStatusByStudentId((prev) => {
      const current = prev[studentId] ?? AttendanceStatus.PRESENT;
      const next = current === AttendanceStatus.PRESENT ? AttendanceStatus.ABSENT : AttendanceStatus.PRESENT;
      return {
        ...prev,
        [studentId]: next,
      };
    });
  };

  const markAll = (status: AttendanceStatus) => {
    if (!students.length) {
      return;
    }
    const nextStatuses: Record<string, AttendanceStatus> = {};
    students.forEach((student) => {
      nextStatuses[student.id] = status;
    });
    setStatusByStudentId(nextStatuses);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!students.length) {
      setMessage("No students available for this section.");
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      const response = await fetchPortal("/api/portal/faculty/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: dateValue,
          records: students.map((student) => ({
            studentId: student.id,
            status: statusByStudentId[student.id] ?? AttendanceStatus.PRESENT,
          })),
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || "Unable to save attendance.");
      }

      setMessage(
        `Attendance saved for ${dateFormatter.format(new Date(dateValue))}. Re-submitting will overwrite the same day.`,
      );
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Unable to save attendance.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="portal-page">
      <div>
        <p className="portal-brand">Faculty</p>
        <h1 className="portal-page-title">Update Attendance</h1>
        <p className="portal-page-subtitle">Mark daily attendance only for your assigned sections.</p>
      </div>

      {sectionsError ? <div className="portal-notice">{sectionsError}</div> : null}
      {studentsError ? <div className="portal-notice">{studentsError}</div> : null}
      {message ? <div className="portal-notice">{message}</div> : null}

      <div className="portal-card">
        <form className="portal-form-grid" onSubmit={handleSubmit}>
          <div className="portal-form-columns">
            <label className="field">
              <span>Year</span>
              <select
                className="select"
                value={year ?? ""}
                onChange={(event) => {
                  const nextYear = Number(event.target.value);
                  setYear(Number.isNaN(nextYear) ? null : nextYear);
                }}
                disabled={sectionsLoading || !availableYears.length}
              >
                {availableYears.length ? null : <option value="">No years</option>}
                {availableYears.map((value) => (
                  <option key={value} value={value}>
                    Year {value}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Section</span>
              <select
                className="select"
                value={sectionId}
                onChange={(event) => setSectionId(event.target.value)}
                disabled={sectionsLoading || !sectionsForYear.length}
              >
                {sectionsForYear.length ? null : <option value="">No sections</option>}
                {sectionsForYear.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.department.code} {bullet} Year {section.year} {bullet} Section {section.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Date</span>
              <input
                className="input"
                type="date"
                value={dateValue}
                onChange={(event) => setDateValue(event.target.value)}
                max={getTodayInputValue()}
              />
            </label>
          </div>

          <div className="portal-actions" style={{ justifyContent: "space-between" }}>
            <div className="portal-card-note">
              {sectionsLoading ? "Loading sections..." : null}
              {!sectionsLoading && selectedSection
                ? `Department ${selectedSection.department.code} ${bullet} Year ${selectedSection.year} ${bullet} Section ${selectedSection.name}`
                : null}
            </div>
            <button className="portal-button" type="submit" disabled={saving || studentsLoading || !students.length}>
              {saving ? "Saving..." : "Save Attendance"}
            </button>
          </div>
        </form>
      </div>

      <div className="portal-card">
        <div className="portal-actions" style={{ justifyContent: "space-between", width: "100%" }}>
          <div>
            <h3 style={{ marginBottom: "0.25rem" }}>Students</h3>
            <p className="portal-card-note">
              {studentsLoading
                ? "Loading students..."
                : totals.total
                  ? `${totals.total} students • ${totals.presentCount} present • ${totals.absentCount} absent`
                  : "Select a section to begin."}
            </p>
          </div>
          <div className="portal-actions">
            <button
              type="button"
              className="portal-button-outline"
              onClick={() => markAll(AttendanceStatus.PRESENT)}
              disabled={studentsLoading || saving || !students.length}
            >
              Mark All Present
            </button>
            <button
              type="button"
              className="portal-button-outline"
              onClick={() => markAll(AttendanceStatus.ABSENT)}
              disabled={studentsLoading || saving || !students.length}
            >
              Mark All Absent
            </button>
          </div>
        </div>

        <div className="portal-table-wrapper faculty-table-desktop" style={{ marginTop: "0.75rem" }}>
          <table className="portal-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Roll No</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {studentsLoading ? (
                <tr>
                  <td colSpan={3} className="portal-card-note">
                    Loading students...
                  </td>
                </tr>
              ) : students.length ? (
                students.map((student) => {
                  const status = statusByStudentId[student.id] ?? AttendanceStatus.PRESENT;
                  const isPresent = status === AttendanceStatus.PRESENT;
                  return (
                    <tr key={student.id}>
                      <td>{student.name}</td>
                      <td>{student.rollNo}</td>
                      <td>
                        <button
                          type="button"
                          className={`faculty-attendance-toggle ${
                            isPresent ? "faculty-attendance-present" : "faculty-attendance-absent"
                          }`}
                          onClick={() => toggleStatus(student.id)}
                          aria-pressed={!isPresent}
                        >
                          {isPresent ? "Present" : "Absent"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={3}>
                    <div className="portal-empty-state">No students found for this section.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="faculty-student-cards" style={{ marginTop: "0.75rem" }}>
          {studentsLoading ? (
            <div className="portal-empty-state">Loading students...</div>
          ) : students.length ? (
            students.map((student) => {
              const status = statusByStudentId[student.id] ?? AttendanceStatus.PRESENT;
              const isPresent = status === AttendanceStatus.PRESENT;
              return (
                <div key={student.id} className="faculty-student-card">
                  <div className="faculty-student-row">
                    <div>
                      <div className="faculty-student-name">{student.name}</div>
                      <div className="portal-card-note">{student.rollNo}</div>
                    </div>
                    <button
                      type="button"
                      className={`faculty-attendance-toggle ${
                        isPresent ? "faculty-attendance-present" : "faculty-attendance-absent"
                      }`}
                      onClick={() => toggleStatus(student.id)}
                      aria-pressed={!isPresent}
                    >
                      {isPresent ? "Present" : "Absent"}
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="portal-empty-state">No students found for this section.</div>
          )}
        </div>
      </div>
    </div>
  );
}
