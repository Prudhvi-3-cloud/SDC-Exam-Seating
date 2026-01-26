"use client";

import { useEffect, useMemo, useState } from "react";
import { parseExcel } from "@/lib/importers/excel";
import PortalToast from "@/components/ui/PortalToast";

const departmentCodes = ["CSE", "ECE", "MECH", "CIVIL", "EEE", "CSM"] as const;

type Department = {
  id: string;
  code: string;
  name: string;
  sections: { id: string; year: number; name: string }[];
};

type BulkRow = {
  name: string;
  email: string;
  password: string;
  department: string;
  allowedSections: string;
};

type BulkPreview = BulkRow & { errors: string[] };

export default function FacultyAddPage() {
  const [activeTab, setActiveTab] = useState<"single" | "bulk">("single");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [singleForm, setSingleForm] = useState({
    name: "",
    email: "",
    password: "",
    departmentCode: "",
  });
  const [allowedSections, setAllowedSections] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [bulkPreview, setBulkPreview] = useState<BulkPreview[]>([]);
  const [bulkMessage, setBulkMessage] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; tone: "success" | "error" } | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/portal/departments")
      .then((res) => res.json())
      .then((data) => setDepartments(data));
  }, []);

  const availableSections = useMemo(() => {
    const dept = departments.find((item) => item.code === singleForm.departmentCode);
    if (!dept) {
      return [];
    }
    return dept.sections
      .map((section) => `${section.year}-${section.name}`)
      .filter((value, index, array) => array.indexOf(value) === index);
  }, [departments, singleForm.departmentCode]);

  const toggleSection = (value: string) => {
    setAllowedSections((prev) =>
      prev.includes(value) ? prev.filter((entry) => entry !== value) : [...prev, value]
    );
  };

  const handleSingleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
    setIsSubmitting(true);
    const response = await fetch("/api/portal/faculty", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: singleForm.name.trim(),
        email: singleForm.email.trim(),
        password: singleForm.password,
        departmentCode: singleForm.departmentCode,
        allowedSections,
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setMessage(data.error || "Unable to add faculty.");
      setToast({ message: data.error || "Unable to add faculty.", tone: "error" });
      setIsSubmitting(false);
      return;
    }

    setMessage("Faculty added successfully.");
    setToast({ message: "Faculty added.", tone: "success" });
    setSingleForm({ name: "", email: "", password: "", departmentCode: "" });
    setAllowedSections([]);
    setIsSubmitting(false);
  };

  const handleBulkFile = async (file: File) => {
    setBulkMessage(null);
    const buffer = await file.arrayBuffer();
    const rows = parseExcel(buffer);
    const preview: BulkPreview[] = rows.map((row) => {
      const name = String(row.name ?? "").trim();
      const email = String(row.email ?? "").trim();
      const password = String(row.password ?? "").trim();
      const department = String(row.department ?? "").trim().toUpperCase();
      const allowedSections = String(row.allowedSections ?? "").trim();
      const errors: string[] = [];

      if (!name) errors.push("name");
      if (!email) errors.push("email");
      if (!password) errors.push("password");
      if (!departmentCodes.includes(department as (typeof departmentCodes)[number]))
        errors.push("department");
      if (!allowedSections) errors.push("allowedSections");

      return { name, email, password, department, allowedSections, errors };
    });
    setBulkPreview(preview);
  };

  const handleBulkSubmit = async () => {
    setBulkMessage(null);
    if (bulkPreview.some((row) => row.errors.length)) {
      setBulkMessage("Fix validation errors before uploading.");
      return;
    }

    setIsSubmitting(true);
    const response = await fetch("/api/portal/faculty/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rows: bulkPreview }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setBulkMessage(data.error || "Bulk upload failed.");
      setToast({ message: data.error || "Bulk upload failed.", tone: "error" });
      setIsSubmitting(false);
      return;
    }

    setBulkMessage(`Inserted ${data.inserted ?? bulkPreview.length} faculty.`);
    setToast({
      message: `Inserted ${data.inserted ?? bulkPreview.length} faculty.`,
      tone: "success",
    });
    setBulkPreview([]);
    setIsSubmitting(false);
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
        <h1 className="portal-page-title">Add Faculty</h1>
        <p className="portal-page-subtitle">Add single faculty or upload a bulk sheet.</p>
      </div>

      <div className="portal-card">
        <div className="portal-actions" style={{ justifyContent: "space-between" }}>
          <h3 style={{ margin: 0 }}>Faculty Creation</h3>
          <div className="portal-actions">
            <button
              type="button"
              className={activeTab === "single" ? "portal-button" : "portal-button-outline"}
              onClick={() => setActiveTab("single")}
            >
              Single Add
            </button>
            <button
              type="button"
              className={activeTab === "bulk" ? "portal-button" : "portal-button-outline"}
              onClick={() => setActiveTab("bulk")}
            >
              Bulk Add
            </button>
          </div>
        </div>

        {activeTab === "single" ? (
          <form className="portal-form-grid" onSubmit={handleSingleSubmit}>
            <div className="portal-form-columns">
              <div className="field">
                <label htmlFor="facultyName">Name</label>
                <input
                  id="facultyName"
                  className="input"
                  value={singleForm.name}
                  onChange={(event) => setSingleForm({ ...singleForm, name: event.target.value })}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="facultyEmail">Email</label>
                <input
                  id="facultyEmail"
                  className="input"
                  value={singleForm.email}
                  onChange={(event) => setSingleForm({ ...singleForm, email: event.target.value })}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="facultyPassword">Password</label>
                <input
                  id="facultyPassword"
                  className="input"
                  value={singleForm.password}
                  onChange={(event) => setSingleForm({ ...singleForm, password: event.target.value })}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="facultyDept">Department</label>
                <select
                  id="facultyDept"
                  className="select"
                  value={singleForm.departmentCode}
                  onChange={(event) => {
                    setSingleForm({ ...singleForm, departmentCode: event.target.value });
                    setAllowedSections([]);
                  }}
                  required
                >
                  <option value="">Select</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.code}>
                      {dept.code}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm mb-2">Section Access</label>
              <div className="portal-form-columns">
                {availableSections.map((section) => (
                  <label key={section} className="portal-pill" style={{ cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={allowedSections.includes(section)}
                      onChange={() => toggleSection(section)}
                      style={{ marginRight: "0.4rem" }}
                    />
                    {section}
                  </label>
                ))}
              </div>
            </div>
            {message ? <div className="portal-notice">{message}</div> : null}
            <button className="portal-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Add Faculty"}
            </button>
          </form>
        ) : (
          <div className="portal-form-grid">
            <div className="field">
              <label htmlFor="bulkFaculty">Upload .xlsx file</label>
              <input
                id="bulkFaculty"
                type="file"
                accept=".xlsx"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    handleBulkFile(file);
                  }
                }}
              />
            </div>
            {bulkMessage ? <div className="portal-notice">{bulkMessage}</div> : null}
            {bulkPreview.length ? (
              <div className="portal-table-wrapper">
                <table className="portal-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Password</th>
                      <th>Department</th>
                      <th>Allowed Sections</th>
                      <th>Errors</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bulkPreview.map((row, index) => (
                      <tr key={`${row.email}-${index}`}>
                        <td>{row.name}</td>
                        <td>{row.email}</td>
                        <td>{row.password}</td>
                        <td>{row.department}</td>
                        <td>{row.allowedSections}</td>
                        <td>{row.errors.join(", ")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
            <button className="portal-button" type="button" onClick={handleBulkSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Uploading..." : "Confirm Bulk Add"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
