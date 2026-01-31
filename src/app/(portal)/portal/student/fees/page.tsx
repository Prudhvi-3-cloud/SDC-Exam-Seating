"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchPortal } from "@/lib/portal-client";

type FeesRecordDto = {
  id: string;
  studentId: string;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  lastUpdated: string;
};

type FeesResponse = {
  record: FeesRecordDto | null;
};

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export default function StudentFeesPage() {
  const [data, setData] = useState<FeesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchPortal("/api/portal/student/fees");
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.error || "Unable to load fees.");
        }
        const payload = (await response.json()) as FeesResponse;
        if (!cancelled) {
          setData(payload);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to load fees.");
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

  const paidPercent = useMemo(() => {
    const record = data?.record;
    if (!record || record.totalAmount <= 0) {
      return 0;
    }
    return Math.min(100, Math.round((record.paidAmount / record.totalAmount) * 100));
  }, [data]);

  const record = data?.record ?? null;

  return (
    <div className="portal-page">
      <div>
        <p className="portal-brand">Student</p>
        <h1 className="portal-page-title">Fees</h1>
        <p className="portal-page-subtitle">Review your total, paid, and due amounts.</p>
      </div>

      {error ? <div className="portal-notice">{error}</div> : null}

      <div className="portal-card">
        {loading ? (
          <p className="portal-card-note">Loading fee details...</p>
        ) : record ? (
          <div className="student-summary-grid">
            <div className="student-profile-item">
              <div className="student-profile-label">Total Amount</div>
              <div className="student-summary-value">{currencyFormatter.format(record.totalAmount)}</div>
              <div className="student-summary-meta">Academic year total</div>
            </div>
            <div className="student-profile-item">
              <div className="student-profile-label">Paid Amount</div>
              <div className="student-summary-value">{currencyFormatter.format(record.paidAmount)}</div>
              <div className="student-summary-meta">{paidPercent}% paid</div>
            </div>
            <div className="student-profile-item">
              <div className="student-profile-label">Due Amount</div>
              <div className="student-summary-value">{currencyFormatter.format(record.dueAmount)}</div>
              <div className="student-summary-meta">
                <span className={`portal-status-pill ${record.dueAmount > 0 ? "portal-status-due" : "portal-status-ok"}`}>
                  {record.dueAmount > 0 ? "Payment Pending" : "No Due"}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="portal-empty-state">No fee record available yet.</div>
        )}
      </div>

      {record ? (
        <div className="portal-card">
          <h3>Payment Progress</h3>
          <p className="portal-card-note">Last updated on {dateFormatter.format(new Date(record.lastUpdated))}.</p>
          <div
            aria-label="Fee payment progress"
            role="progressbar"
            aria-valuenow={paidPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            style={{ marginTop: "0.85rem" }}
          >
            <div
              style={{
                width: "100%",
                height: "12px",
                borderRadius: "999px",
                border: "1px solid var(--srit-border)",
                background: "var(--srit-orange-light)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${paidPercent}%`,
                  height: "100%",
                  background: "var(--srit-primary)",
                  transition: "width 0.3s ease",
                }}
              />
            </div>
            <div className="student-summary-meta" style={{ marginTop: "0.5rem" }}>
              {currencyFormatter.format(record.paidAmount)} paid of {currencyFormatter.format(record.totalAmount)}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

