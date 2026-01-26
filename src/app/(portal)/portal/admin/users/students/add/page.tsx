"use client";

import { useEffect, useMemo, useState } from "react";
import { parseExcel } from "@/lib/importers/excel";
import PortalToast from "@/components/ui/PortalToast";

const departmentCodes = ["CSE", "ECE", "MECH", "CIVIL", "EEE", "CSM"] as const;
const sectionNames = ["A", "B", "C"] as const;

type Department = {
  id: string;
  code: string;
  name: string;
  sections: { id: string; year: number; name: string }[];
};

type BulkRow = {
  rollNo: string;
  name: string;
  email: string;
  year: number;
  department: string;
  section: string;
  password: string;
};

type BulkPreview = BulkRow & { errors: string[] };

export default function StudentsAddPage() {
  const [activeTab, setActiveTab] = useState<"single" | "bulk">("single");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [singleForm, setSingleForm] = useState({
    rollNo: "",
    name: "",
    email: "",
    password: "",
    year: "1",
    departmentCode: "",
    sectionName: "",
  });
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

  const sections = useMemo(() => {
    const dept = departments.find((item) => item.code === singleForm.departmentCode);
    if (!dept) {
      return [];
    }
    return dept.sections
      .filter((section) => section.year === Number(singleForm.year))
      .map((section) => section.name)
      .filter((value, index, array) => array.indexOf(value) === index);
  }, [departments, singleForm.departmentCode, singleForm.year]);

  const handleSingleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
    setIsSubmitting(true);
    const response = await fetch("/api/portal/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rollNo: singleForm.rollNo.trim(),
        name: singleForm.name.trim(),
        email: singleForm.email.trim(),
        password: singleForm.password,
        year: Number(singleForm.year),
        departmentCode: singleForm.departmentCode,
        sectionName: singleForm.sectionName,
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setMessage(data.error || "Unable to add student.");
      setToast({ message: data.error || "Unable to add student.", tone: "error" });
      setIsSubmitting(false);
      return;
    }

    setMessage("Student added successfully.");
    setToast({ message: "Student added.", tone: "success" });
    setSingleForm({
      rollNo: "",
      name: "",
      email: "",
      password: "",
      year: "1",
      departmentCode: "",
      sectionName: "",
    });
    setIsSubmitting(false);
  };

  const handleBulkFile = async (file: File) => {
    setBulkMessage(null);
    const buffer = await file.arrayBuffer();
    const rows = parseExcel(buffer);
    const preview: BulkPreview[] = rows.map((row) => {
      const rollNo = String(row.rollNo ?? "").trim();
      const name = String(row.name ?? "").trim();
      const email = String(row.email ?? "").trim();
      const year = Number(row.year);
      const department = String(row.department ?? "").trim().toUpperCase();
      const section = String(row.section ?? "").trim().toUpperCase();
      const password = String(row.password ?? "").trim();
      const errors: string[] = [];

      if (!rollNo) errors.push("rollNo");
      if (!name) errors.push("name");
      if (!email) errors.push("email");
      if (![1, 2, 3, 4].includes(year)) errors.push("year");
      if (!departmentCodes.includes(department as (typeof departmentCodes)[number]))
        errors.push("department");
      if (!sectionNames.includes(section as (typeof sectionNames)[number])) errors.push("section");
      if (!password) errors.push("password");

      return { rollNo, name, email, year, department, section, password, errors };
    });
    setBulkPreview(preview);
  };

  const handleBulkSubmit = async () => {
    setBulkMessage(null);
    const invalidRows = bulkPreview.filter((row) => row.errors.length > 0);
    if (invalidRows.length) {
      setBulkMessage("Fix validation errors before uploading.");
      return;
    }

    const payload = {
      rows: bulkPreview.map((row) => ({
        rollNo: row.rollNo,
        name: row.name,
        email: row.email,
        year: row.year,
        department: row.department,
        section: row.section,
        password: row.password,
      })),
    };

    setIsSubmitting(true);
    const response = await fetch("/api/portal/students/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setBulkMessage(data.error || "Bulk upload failed.");
      setToast({ message: data.error || "Bulk upload failed.", tone: "error" });
      setIsSubmitting(false);
      return;
    }

    setBulkMessage(`Inserted ${data.inserted ?? payload.rows.length} students.`);
    setToast({
      message: `Inserted ${data.inserted ?? payload.rows.length} students.`,
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
        <h1 className="portal-page-title">Add Students</h1>
        <p className="portal-page-subtitle">Add single students or upload a bulk sheet.</p>
      </div>

      <div className="portal-card">
        <div className="portal-actions" style={{ justifyContent: "space-between" }}>
          <h3 style={{ margin: 0 }}>Student Creation</h3>
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
                <label htmlFor="rollNo">Roll No</label>
                <input
                  id="rollNo"
                  className="input"
                  value={singleForm.rollNo}
                  onChange={(event) => setSingleForm({ ...singleForm, rollNo: event.target.value })}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="studentName">Name</label>
                <input
                  id="studentName"
                  className="input"
                  value={singleForm.name}
                  onChange={(event) => setSingleForm({ ...singleForm, name: event.target.value })}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="studentEmail">Email</label>
                <input
                  id="studentEmail"
                  className="input"
                  value={singleForm.email}
                  onChange={(event) => setSingleForm({ ...singleForm, email: event.target.value })}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="studentPassword">Password</label>
                <input
                  id="studentPassword"
                  className="input"
                  value={singleForm.password}
                  onChange={(event) => setSingleForm({ ...singleForm, password: event.target.value })}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="studentYear">Year</label>
                <select
                  id="studentYear"
                  className="select"
                  value={singleForm.year}
                  onChange={(event) => setSingleForm({ ...singleForm, year: event.target.value })}
                >
                  {[1, 2, 3, 4].map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="studentDept">Department</label>
                <select
                  id="studentDept"
                  className="select"
                  value={singleForm.departmentCode}
                  onChange={(event) =>
                    setSingleForm({ ...singleForm, departmentCode: event.target.value })
                  }
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
              <div className="field">
                <label htmlFor="studentSection">Section</label>
                <select
                  id="studentSection"
                  className="select"
                  value={singleForm.sectionName}
                  onChange={(event) =>
                    setSingleForm({ ...singleForm, sectionName: event.target.value })
                  }
                  required
                >
                  <option value="">Select</option>
                  {sections.map((section) => (
                    <option key={section} value={section}>
                      {section}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {message ? <div className="portal-notice">{message}</div> : null}
            <button className="portal-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Add Student"}
            </button>
          </form>
        ) : (
          <div className="portal-form-grid">
            <div className="field">
              <label htmlFor="bulkFile">Upload .xlsx file</label>
              <input
                id="bulkFile"
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
                      <th>Roll No</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Year</th>
                      <th>Department</th>
                      <th>Section</th>
                      <th>Password</th>
                      <th>Errors</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bulkPreview.map((row, index) => (
                      <tr key={`${row.rollNo}-${index}`}>
                        <td>{row.rollNo}</td>
                        <td>{row.name}</td>
                        <td>{row.email}</td>
                        <td>{row.year}</td>
                        <td>{row.department}</td>
                        <td>{row.section}</td>
                        <td>{row.password}</td>
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
