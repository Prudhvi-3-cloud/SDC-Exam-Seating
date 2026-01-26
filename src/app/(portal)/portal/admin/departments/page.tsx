"use client";

import { useEffect, useState } from "react";
import PortalToast from "@/components/ui/PortalToast";

type Department = {
  id: string;
  code: string;
  name: string;
};

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [editValues, setEditValues] = useState<Record<string, { code: string; name: string }>>(
    {}
  );
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [toast, setToast] = useState<{ message: string; tone: "success" | "error" } | null>(
    null
  );
  const [isSaving, setIsSaving] = useState(false);

  const loadDepartments = async () => {
    const response = await fetch("/api/portal/departments");
    const data = await response.json();
    setDepartments(data);
    setEditValues(
      data.reduce(
        (acc: Record<string, { code: string; name: string }>, dept: Department) => {
          acc[dept.id] = { code: dept.code, name: dept.name };
          return acc;
        },
        {}
      )
    );
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const handleAdd = async (event: React.FormEvent) => {
    event.preventDefault();
    setToast(null);
    setIsSaving(true);
    const response = await fetch("/api/portal/departments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: code.trim(), name: name.trim() }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setToast({ message: data.error || "Unable to add department.", tone: "error" });
      setIsSaving(false);
      return;
    }

    setCode("");
    setName("");
    await loadDepartments();
    setToast({ message: "Department added.", tone: "success" });
    setIsSaving(false);
  };

  const handleUpdate = async (deptId: string) => {
    const values = editValues[deptId];
    if (!values) return;
    if (!values.code.trim() || !values.name.trim()) {
      setMessage("Code and name are required.");
      return;
    }
    const response = await fetch(`/api/portal/departments/${deptId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: values.name.trim(),
        code: values.code.trim(),
      }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setToast({ message: data.error || "Unable to update department.", tone: "error" });
      return;
    }

    await loadDepartments();
    setToast({ message: "Department updated.", tone: "success" });
  };

  const handleDelete = async (deptId: string) => {
    const response = await fetch(`/api/portal/departments/${deptId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setToast({ message: data.error || "Unable to delete department.", tone: "error" });
      return;
    }

    await loadDepartments();
    setToast({ message: "Department deleted.", tone: "success" });
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
        <h1 className="portal-page-title">Departments</h1>
        <p className="portal-page-subtitle">Manage academic departments for the portal.</p>
      </div>

      <div className="portal-card">
        <h3>Add Department</h3>
        <form className="portal-form-grid" onSubmit={handleAdd}>
          <div className="portal-form-columns">
            <div className="field">
              <label htmlFor="deptCode">Code</label>
              <input
                id="deptCode"
                className="input"
                value={code}
                onChange={(event) => setCode(event.target.value.toUpperCase())}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="deptName">Name</label>
              <input
                id="deptName"
                className="input"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>
          </div>
          <div className="portal-actions">
            <button className="portal-button" type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Add Department"}
            </button>
          </div>
        </form>
      </div>

      <div className="portal-card">
        <h3>Existing Departments</h3>
        <div className="portal-table-wrapper">
          <table className="portal-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept) => (
                <tr key={dept.id}>
                  <td>
                    <input
                      className="input"
                      value={editValues[dept.id]?.code ?? dept.code}
                      onChange={(event) =>
                        setEditValues((prev) => ({
                          ...prev,
                          [dept.id]: {
                            code: event.target.value.toUpperCase(),
                            name: prev[dept.id]?.name ?? dept.name,
                          },
                        }))
                      }
                    />
                  </td>
                  <td>
                    <input
                      className="input"
                      value={editValues[dept.id]?.name ?? dept.name}
                      onChange={(event) =>
                        setEditValues((prev) => ({
                          ...prev,
                          [dept.id]: {
                            code: prev[dept.id]?.code ?? dept.code,
                            name: event.target.value,
                          },
                        }))
                      }
                    />
                  </td>
                  <td>
                    <button
                      type="button"
                      className="portal-button"
                      onClick={() => handleUpdate(dept.id)}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      className="portal-button-outline"
                      onClick={() => handleDelete(dept.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
