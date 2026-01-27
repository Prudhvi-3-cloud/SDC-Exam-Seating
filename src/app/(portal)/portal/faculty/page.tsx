"use client";

import Link from "next/link";
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

export default function FacultyDashboard() {
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
          throw new Error(payload.error || "Unable to load faculty dashboard.");
        }
        const payload = (await response.json()) as FacultyProfileResponse;
        if (!cancelled) {
          setData(payload);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to load faculty dashboard.");
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

  const allowedSectionsLabel = useMemo(() => {
    if (!data?.faculty.allowedSections.length) {
      return "No section access assigned yet.";
    }
    return `${data.faculty.allowedSections.length} sections available`;
  }, [data]);

  const cards = [
    {
      title: "Update Attendance",
      href: "/portal/faculty/attendance",
      meta: "Mark daily attendance for assigned sections",
    },
    {
      title: "Update Student Remarks",
      href: "/portal/faculty/remarks",
      meta: "Add feedback notes that students can view",
    },
  ];

  return (
    <div className="portal-page">
      <div>
        <p className="portal-brand">Faculty Area</p>
        <h1 className="portal-page-title">Dashboard</h1>
        <p className="portal-page-subtitle">Manage attendance and remarks for your assigned sections.</p>
      </div>

      {error ? <div className="portal-notice">{error}</div> : null}

      {loading ? (
        <div className="portal-card">
          <p className="portal-card-note">Loading faculty details...</p>
        </div>
      ) : data ? (
        <div className="portal-card">
          <div className="student-profile-grid">
            <div className="student-profile-item">
              <div className="student-profile-label">Name</div>
              <div className="student-profile-value">{data.faculty.name}</div>
            </div>
            <div className="student-profile-item">
              <div className="student-profile-label">Department</div>
              <div className="student-profile-value">
                {data.faculty.department.code} • {data.faculty.department.name}
              </div>
            </div>
            <div className="student-profile-item">
              <div className="student-profile-label">Allowed Sections</div>
              <div className="student-profile-value">{allowedSectionsLabel}</div>
            </div>
          </div>

          <div className="portal-actions" style={{ marginTop: "0.9rem" }}>
            {data.faculty.allowedSections.map((section) => (
              <span key={section.id} className="portal-pill">
                Year {section.year} • Section {section.name}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="portal-empty-state">Faculty profile not available.</div>
      )}

      <div className="student-summary-grid">
        {cards.map((card) => (
          <Link key={card.title} href={card.href} className="portal-card-link">
            <div className="portal-card">
              <h3>{card.title}</h3>
              <div className="student-summary-value">Open</div>
              <p className="student-summary-meta">{card.meta}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
