"use client";

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

type RemarkDto = {
  id: string;
  studentId: string;
  text: string;
  createdAt: string;
  byFacultyName: string | null;
};

type RemarksResponse = {
  student: {
    id: string;
    name: string;
    email: string;
    rollNo: string;
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
  remarks: RemarkDto[];
};

const dateTimeFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export default function FacultyRemarksPage() {
  const [sections, setSections] = useState<SectionDto[]>([]);
  const [sectionsLoading, setSectionsLoading] = useState(true);
  const [sectionsError, setSectionsError] = useState<string | null>(null);

  const [year, setYear] = useState<number | null>(null);
  const [sectionId, setSectionId] = useState<string>("");

  const [students, setStudents] = useState<StudentDto[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState<string | null>(null);

  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [remarks, setRemarks] = useState<RemarkDto[]>([]);
  const [remarksLoading, setRemarksLoading] = useState(false);
  const [remarksError, setRemarksError] = useState<string | null>(null);

  const [text, setText] = useState("");
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
      setSelectedStudentId("");
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
        const response = await fetchPortal(`/api/portal/faculty/remarks/students?${params.toString()}`);
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.error || "Unable to load students.");
        }
        const payload = (await response.json()) as StudentsResponse;
        if (cancelled) {
          return;
        }
        setStudents(payload.students);
        setSelectedStudentId(payload.students[0]?.id ?? "");
      } catch (err) {
        if (!cancelled) {
          setStudents([]);
          setSelectedStudentId("");
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

  useEffect(() => {
    if (!selectedStudentId) {
      setRemarks([]);
      setText("");
      return;
    }

    let cancelled = false;
    const loadRemarks = async () => {
      setRemarksLoading(true);
      setRemarksError(null);
      try {
        const params = new URLSearchParams({ studentId: selectedStudentId });
        const response = await fetchPortal(`/api/portal/faculty/remarks?${params.toString()}`);
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.error || "Unable to load remarks.");
        }
        const payload = (await response.json()) as RemarksResponse;
        if (cancelled) {
          return;
        }
        setRemarks(payload.remarks);
        setText(payload.remarks[0]?.text ?? "");
      } catch (err) {
        if (!cancelled) {
          setRemarks([]);
          setText("");
          setRemarksError(err instanceof Error ? err.message : "Unable to load remarks.");
        }
      } finally {
        if (!cancelled) {
          setRemarksLoading(false);
        }
      }
    };

    loadRemarks();

    return () => {
      cancelled = true;
    };
  }, [selectedStudentId]);

  const selectedStudent = students.find((student) => student.id === selectedStudentId) ?? null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedStudentId) {
      setMessage("Select a student first.");
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      const response = await fetchPortal("/api/portal/faculty/remarks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId: selectedStudentId,
          text,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || "Unable to save remark.");
      }

      setMessage("Remark saved. Previous remarks remain in the log.");

      const params = new URLSearchParams({ studentId: selectedStudentId });
      const refresh = await fetchPortal(`/api/portal/faculty/remarks?${params.toString()}`);
      if (refresh.ok) {
        const payload = (await refresh.json()) as RemarksResponse;
        setRemarks(payload.remarks);
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Unable to save remark.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="portal-page">
      <div>
        <p className="portal-brand">Faculty</p>
        <h1 className="portal-page-title">Update Student Remarks</h1>
        <p className="portal-page-subtitle">Add notes for students in your assigned sections only.</p>
      </div>

      {sectionsError ? <div className="portal-notice">{sectionsError}</div> : null}
      {studentsError ? <div className="portal-notice">{studentsError}</div> : null}
      {remarksError ? <div className="portal-notice">{remarksError}</div> : null}
      {message ? <div className="portal-notice">{message}</div> : null}

      <div className="portal-card">
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
                  {section.department.code} • Year {section.year} • Section {section.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="portal-form-columns faculty-remarks-layout">
        <div className="portal-card">
          <h3 style={{ marginBottom: "0.25rem" }}>Students</h3>
          <p className="portal-card-note">
            {studentsLoading ? "Loading students..." : `${students.length} students available`}
          </p>
          <div className="faculty-student-list" style={{ marginTop: "0.75rem" }}>
            {studentsLoading ? (
              <div className="portal-empty-state">Loading students...</div>
            ) : students.length ? (
              students.map((student) => {
                const isActive = student.id === selectedStudentId;
                return (
                  <button
                    key={student.id}
                    type="button"
                    className={`faculty-student-list-item ${isActive ? "is-active" : ""}`}
                    onClick={() => {
                      setSelectedStudentId(student.id);
                      setMessage(null);
                    }}
                  >
                    <div className="faculty-student-name">{student.name}</div>
                    <div className="portal-card-note">{student.rollNo}</div>
                  </button>
                );
              })
            ) : (
              <div className="portal-empty-state">No students found for this section.</div>
            )}
          </div>
        </div>

        <div className="portal-card">
          <h3 style={{ marginBottom: "0.25rem" }}>Remarks</h3>
          {selectedStudent ? (
            <p className="portal-card-note">
              {selectedStudent.name} • {selectedStudent.rollNo}
            </p>
          ) : (
            <p className="portal-card-note">Select a student to view remarks.</p>
          )}

          <div className="faculty-remarks-log" style={{ marginTop: "0.75rem" }}>
            {remarksLoading ? (
              <div className="portal-empty-state">Loading remarks...</div>
            ) : remarks.length ? (
              remarks.map((remark) => (
                <div key={remark.id} className="faculty-remark-item">
                  <div className="faculty-remark-meta">
                    {dateTimeFormatter.format(new Date(remark.createdAt))}
                    {remark.byFacultyName ? ` • ${remark.byFacultyName}` : ""}
                  </div>
                  <div>{remark.text}</div>
                </div>
              ))
            ) : (
              <div className="portal-empty-state">No remarks yet. Add one below.</div>
            )}
          </div>

          <form className="portal-form-grid" onSubmit={handleSubmit} style={{ marginTop: "1rem" }}>
            <label className="field">
              <span>Add or update remark</span>
              <textarea
                className="input"
                value={text}
                onChange={(event) => setText(event.target.value)}
                rows={4}
                placeholder="Enter your remark for this student..."
                disabled={!selectedStudentId}
              />
            </label>
            <div className="portal-actions">
              <button className="portal-button" type="submit" disabled={saving || !selectedStudentId || !text.trim()}>
                {saving ? "Saving..." : "Save Remark"}
              </button>
              <div className="portal-card-note">Remarks are append-only and kept in the log.</div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

