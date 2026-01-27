"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import PortalToast from "@/components/ui/PortalToast";

type Department = {
  id: string;
  code: string;
  name: string;
  sections: { id: string; year: number; name: string }[];
};

type Student = {
  id: string;
  rollNo: string;
  year: number;
  user: { id: string; name: string; email: string; isBlocked: boolean };
  department: { code: string; name: string };
  section: { name: string };
};

export default function StudentsAdminPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [year, setYear] = useState<string>("");
  const [departmentCode, setDepartmentCode] = useState<string>("");
  const [sectionName, setSectionName] = useState<string>("");
  const [query, setQuery] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; tone: "success" | "error" } | null>(
    null
  );
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const sections = useMemo(() => {
    const dept = departments.find((item) => item.code === departmentCode);
    if (!dept) {
      return [];
    }
    return dept.sections
      .filter((section) => (!year ? true : String(section.year) === year))
      .map((section) => section.name)
      .filter((value, index, array) => array.indexOf(value) === index);
  }, [departments, departmentCode, year]);

  const loadDepartments = async () => {
    setIsLoadingDepartments(true);
    setError(null);
    try {
      const response = await fetch("/api/portal/departments");
      const data = await response.json().catch(() => []);
      if (!response.ok) {
        throw new Error("Unable to load departments.");
      }
      setDepartments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load departments.");
    } finally {
      setIsLoadingDepartments(false);
    }
  };

  const loadStudents = async () => {
    setIsLoadingStudents(true);
    setError(null);
    const params = new URLSearchParams();
    if (year) params.set("year", year);
    if (departmentCode) params.set("departmentCode", departmentCode);
    if (sectionName) params.set("sectionName", sectionName);
    if (query) params.set("q", query);

    try {
      const response = await fetch(`/api/portal/students?${params.toString()}`);
      const data = await response.json().catch(() => []);
      if (!response.ok) {
        throw new Error(data.error || "Unable to load students.");
      }
      setStudents(data);
    } catch (err) {
      setStudents([]);
      setError(err instanceof Error ? err.message : "Unable to load students.");
    } finally {
      setIsLoadingStudents(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  useEffect(() => {
    loadStudents();
  }, [year, departmentCode, sectionName, query]);

  const handleToggleBlock = async (student: Student) => {
    setToast(null);
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
      setToast({ message: data.error || "Unable to update status.", tone: "error" });
      return;
    }

    await loadStudents();
    setToast({
      message: student.user.isBlocked ? "Student unblocked." : "Student blocked.",
      tone: "success",
    });
  };

  return (
    <div className="portal-page">
      <PortalToast
        message={toast?.message ?? null}
        tone={toast?.tone ?? "success"}
        onClose={() => setToast(null)}
      />
      <div>
        <p className="portal-brand">Admin</p>
        <h1 className="portal-page-title">Students</h1>
        <p className="portal-page-subtitle">Filter and manage student accounts.</p>
      </div>

      {error ? <div className="portal-notice">{error}</div> : null}

      <div className="portal-card">
        <h3>Filters</h3>
        <div className="portal-form-columns" style={{ marginTop: "1rem" }}>
          <div className="field">
            <label htmlFor="year">Year</label>
            <select
              id="year"
              className="select"
              value={year}
              onChange={(event) => setYear(event.target.value)}
            >
              <option value="">All</option>
              {[1, 2, 3, 4].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="department">Department</label>
            <select
              id="department"
              className="select"
              value={departmentCode}
              onChange={(event) => {
                setDepartmentCode(event.target.value);
                setSectionName("");
              }}
              disabled={isLoadingDepartments}
            >
              <option value="">All</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.code}>
                  {dept.code}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="section">Section</label>
            <select
              id="section"
              className="select"
              value={sectionName}
              onChange={(event) => setSectionName(event.target.value)}
              disabled={isLoadingDepartments}
            >
              <option value="">All</option>
              {sections.map((section) => (
                <option key={section} value={section}>
                  {section}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="search">Search</label>
            <input
              id="search"
              className="input"
              placeholder="Search by roll no, name, email"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="portal-card">
        <div className="portal-actions" style={{ justifyContent: "space-between" }}>
          <h3 style={{ margin: 0 }}>Student List</h3>
          <Link className="portal-button" href="/portal/admin/users/students/add">
            Add Students
          </Link>
        </div>
        <div className="portal-table-wrapper" style={{ marginTop: "1rem" }}>
          <table className="portal-table">
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Name</th>
                <th>Email</th>
                <th>Year</th>
                <th>Dept</th>
                <th>Section</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoadingStudents ? (
                <tr>
                  <td colSpan={8} className="portal-card-note">
                    Loading students...
                  </td>
                </tr>
              ) : students.length ? (
                students.map((student) => (
                  <tr key={student.id} onClick={() => setSelectedStudent(student)}>
                    <td>{student.rollNo}</td>
                    <td>
                      <Link className="portal-link" href={`/portal/admin/users/students/${student.id}`}>
                        {student.user.name}
                      </Link>
                    </td>
                    <td>{student.user.email}</td>
                    <td>{student.year}</td>
                    <td>{student.department.code}</td>
                    <td>{student.section.name}</td>
                    <td>
                      <span className="portal-pill">
                        {student.user.isBlocked ? "Blocked" : "Active"}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="portal-button-outline"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleToggleBlock(student);
                        }}
                      >
                        {student.user.isBlocked ? "Unblock" : "Block"}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8}>
                    <div className="portal-empty-state">No students found for the selected filters.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedStudent ? (
        <div className="portal-card">
          <h3>Quick Details</h3>
          <p className="portal-card-note">
            {selectedStudent.user.name} &middot; {selectedStudent.rollNo}
          </p>
          <div className="portal-form-columns" style={{ marginTop: "0.75rem" }}>
            <div>
              <strong>Email</strong>
              <div>{selectedStudent.user.email}</div>
            </div>
            <div>
              <strong>Year</strong>
              <div>{selectedStudent.year}</div>
            </div>
            <div>
              <strong>Department</strong>
              <div>{selectedStudent.department.code}</div>
            </div>
            <div>
              <strong>Section</strong>
              <div>{selectedStudent.section.name}</div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
