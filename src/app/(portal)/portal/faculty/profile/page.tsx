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

type FacultyProfileResponse = {
  faculty: {
    id: string;
    name: string;
    email: string;
    department: {
      id: string;
      code: string;
      name: string;
    };
    allowedSections: SectionDto[];
  };
};

export default function FacultyProfilePage() {
  const [data, setData] = useState<FacultyProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchPortal("/api/portal/faculty/profile");
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.error || "Unable to load faculty profile.");
        }
        const payload = (await response.json()) as FacultyProfileResponse;
        if (!cancelled) {
          setData(payload);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to load faculty profile.");
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

  const readOnlyItems = useMemo(() => {
    if (!data) {
      return [] as { label: string; value: string }[];
    }
    return [
      { label: "Name", value: data.faculty.name },
      { label: "Email", value: data.faculty.email },
      { label: "Department", value: `${data.faculty.department.code} • ${data.faculty.department.name}` },
    ];
  }, [data]);

  return (
    <div className="portal-page">
      <div>
        <p className="portal-brand">Faculty</p>
        <h1 className="portal-page-title">Profile</h1>
        <p className="portal-page-subtitle">Your account details and allowed section access.</p>
      </div>

      {error ? <div className="portal-notice">{error}</div> : null}

      <div className="portal-card">
        {loading ? (
          <p className="portal-card-note">Loading profile...</p>
        ) : data ? (
          <div className="student-profile-grid">
            {readOnlyItems.map((item) => (
              <div key={item.label} className="student-profile-item">
                <div className="student-profile-label">{item.label}</div>
                <div className="student-profile-value">{item.value}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="portal-empty-state">Profile not available.</div>
        )}
      </div>

      <div className="portal-card">
        <h3>Allowed Sections</h3>
        <p className="portal-card-note">You can update attendance and remarks only for these sections.</p>
        {loading ? (
          <p className="portal-card-note" style={{ marginTop: "0.75rem" }}>
            Loading sections...
          </p>
        ) : data?.faculty.allowedSections.length ? (
          <div className="portal-actions" style={{ marginTop: "0.75rem" }}>
            {data.faculty.allowedSections.map((section) => (
              <span key={section.id} className="portal-pill">
                {section.department.code} • Year {section.year} • Section {section.name}
              </span>
            ))}
          </div>
        ) : (
          <div className="portal-empty-state" style={{ marginTop: "0.75rem" }}>
            No sections assigned yet.
          </div>
        )}
      </div>
    </div>
  );
}

