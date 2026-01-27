"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PortalToast from "@/components/ui/PortalToast";

type Department = {
  id: string;
  code: string;
  name: string;
};

type Faculty = {
  id: string;
  user: { id: string; name: string; email: string; isBlocked: boolean };
  department: { code: string; name: string };
  sectionAccess: { id: string }[];
};

export default function FacultyAdminPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);
  const [departmentCode, setDepartmentCode] = useState<string>("");
  const [query, setQuery] = useState<string>("");
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [isLoadingFaculty, setIsLoadingFaculty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; tone: "success" | "error" } | null>(
    null
  );

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

  const loadFaculty = async () => {
    setIsLoadingFaculty(true);
    setError(null);
    const params = new URLSearchParams();
    if (departmentCode) params.set("departmentCode", departmentCode);
    if (query) params.set("q", query);

    try {
      const response = await fetch(`/api/portal/faculty?${params.toString()}`);
      const data = await response.json().catch(() => []);
      if (!response.ok) {
        throw new Error(data.error || "Unable to load faculty.");
      }
      setFaculty(data);
    } catch (err) {
      setFaculty([]);
      setError(err instanceof Error ? err.message : "Unable to load faculty.");
    } finally {
      setIsLoadingFaculty(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  useEffect(() => {
    loadFaculty();
  }, [departmentCode, query]);

  const handleToggleBlock = async (profile: Faculty) => {
    setToast(null);
    const nextBlockedState = !profile.user.isBlocked;
    const confirmed = window.confirm(
      nextBlockedState
        ? `Block ${profile.user.name}? They will not be able to log in.`
        : `Unblock ${profile.user.name}? They will regain access.`
    );
    if (!confirmed) {
      return;
    }
    const response = await fetch(`/api/portal/faculty/${profile.id}/block`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isBlocked: nextBlockedState }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setToast({ message: data.error || "Unable to update status.", tone: "error" });
      return;
    }

    await loadFaculty();
    setToast({
      message: profile.user.isBlocked ? "Faculty unblocked." : "Faculty blocked.",
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
        <h1 className="portal-page-title">Faculty</h1>
        <p className="portal-page-subtitle">Manage faculty accounts and access.</p>
      </div>

      {error ? <div className="portal-notice">{error}</div> : null}

      <div className="portal-card">
        <h3>Filters</h3>
        <div className="portal-form-columns" style={{ marginTop: "1rem" }}>
          <div className="field">
            <label htmlFor="facultyDept">Department</label>
            <select
              id="facultyDept"
              className="select"
              value={departmentCode}
              onChange={(event) => setDepartmentCode(event.target.value)}
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
            <label htmlFor="facultySearch">Search</label>
            <input
              id="facultySearch"
              className="input"
              placeholder="Search by name or email"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="portal-card">
        <div className="portal-actions" style={{ justifyContent: "space-between" }}>
          <h3 style={{ margin: 0 }}>Faculty List</h3>
          <Link className="portal-button" href="/portal/admin/users/faculty/add">
            Add Faculty
          </Link>
        </div>
        <div className="portal-table-wrapper" style={{ marginTop: "1rem" }}>
          <table className="portal-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Sections</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoadingFaculty ? (
                <tr>
                  <td colSpan={6} className="portal-card-note">
                    Loading faculty...
                  </td>
                </tr>
              ) : faculty.length ? (
                faculty.map((profile) => (
                  <tr key={profile.id}>
                    <td>
                      <Link className="portal-link" href={`/portal/admin/users/faculty/${profile.id}`}>
                        {profile.user.name}
                      </Link>
                    </td>
                    <td>{profile.user.email}</td>
                    <td>{profile.department.code}</td>
                    <td>{profile.sectionAccess.length}</td>
                    <td>
                      <span className="portal-pill">
                        {profile.user.isBlocked ? "Blocked" : "Active"}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="portal-button-outline"
                        onClick={() => handleToggleBlock(profile)}
                      >
                        {profile.user.isBlocked ? "Unblock" : "Block"}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6}>
                    <div className="portal-empty-state">No faculty found for the selected filters.</div>
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
