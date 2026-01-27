"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { fetchPortal } from "@/lib/portal-client";

type StudentSummary = {
  student: {
    id: string;
    rollNo: string;
    year: number;
    department: { id: string; code: string; name: string };
    section: { id: string; name: string; year: number };
    name: string;
    email: string;
  };
  attendance: {
    total: number;
    present: number;
    percentage: number;
  };
  fees: {
    dueAmount: number;
    totalAmount: number;
    paidAmount: number;
    lastUpdated: string | null;
  };
  marks: {
    latestSemester: number | null;
    latestSemesterCount: number;
  };
  remarks: {
    count: number;
  };
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function StudentDashboard() {
  const [summary, setSummary] = useState<StudentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchPortal("/api/portal/student/summary");
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || "Unable to load student dashboard.");
        }
        const data = (await response.json()) as StudentSummary;
        if (!cancelled) {
          setSummary(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to load student dashboard.");
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

  const cards = useMemo(() => {
    if (!summary) {
      return [
        {
          title: "Attendance",
          href: "/portal/student/attendance",
          value: loading ? "Loading..." : "--",
          meta: "Track daily attendance",
        },
        {
          title: "Fees Due",
          href: "/portal/student/fees",
          value: loading ? "Loading..." : "--",
          meta: "Check outstanding dues",
        },
        {
          title: "Latest Marks",
          href: "/portal/student/marks",
          value: loading ? "Loading..." : "--",
          meta: "View semester results",
        },
        {
          title: "Remarks",
          href: "/portal/student/remarks",
          value: loading ? "Loading..." : "--",
          meta: "See faculty remarks",
        },
      ];
    }

    return [
      {
        title: "Attendance",
        href: "/portal/student/attendance",
        value: `${summary.attendance.present} / ${summary.attendance.total}`,
        meta: `${summary.attendance.percentage}% present`,
      },
      {
        title: "Fees Due",
        href: "/portal/student/fees",
        value: formatCurrency(summary.fees.dueAmount),
        meta:
          summary.fees.dueAmount > 0
            ? "Payment pending"
            : "All dues cleared",
      },
      {
        title: "Latest Marks",
        href: "/portal/student/marks",
        value:
          summary.marks.latestSemester !== null
            ? `Semester ${summary.marks.latestSemester}`
            : "No marks yet",
        meta:
          summary.marks.latestSemesterCount > 0
            ? `${summary.marks.latestSemesterCount} subjects`
            : "Results will appear here",
      },
      {
        title: "Remarks",
        href: "/portal/student/remarks",
        value: String(summary.remarks.count),
        meta: summary.remarks.count > 0 ? "Latest feedback available" : "No remarks yet",
      },
    ];
  }, [summary, loading]);

  return (
    <div className="portal-page">
      <div>
        <p className="portal-brand">Student Area</p>
        <h1 className="portal-page-title">Dashboard</h1>
        <p className="portal-page-subtitle">
          View your academic snapshot and jump into each section.
        </p>
      </div>

      {error ? <div className="portal-notice">{error}</div> : null}

      {summary ? (
        <div className="portal-card">
          <div className="student-profile-grid">
            <div className="student-profile-item">
              <div className="student-profile-label">Name</div>
              <div className="student-profile-value">{summary.student.name}</div>
            </div>
            <div className="student-profile-item">
              <div className="student-profile-label">Roll No</div>
              <div className="student-profile-value">{summary.student.rollNo}</div>
            </div>
            <div className="student-profile-item">
              <div className="student-profile-label">Department</div>
              <div className="student-profile-value">{summary.student.department.code}</div>
            </div>
            <div className="student-profile-item">
              <div className="student-profile-label">Year / Section</div>
              <div className="student-profile-value">
                {summary.student.year} / {summary.student.section.name}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="student-summary-grid">
        {cards.map((card) => (
          <Link key={card.title} href={card.href} className="portal-card-link">
            <div className="portal-card">
              <h3>{card.title}</h3>
              <div className="student-summary-value">{card.value}</div>
              <p className="student-summary-meta">{card.meta}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
