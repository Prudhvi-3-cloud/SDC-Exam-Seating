"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchPortal } from "@/lib/portal-client";

type StudentProfileResponse = {
  id: string;
  userId: string;
  name: string;
  email: string;
  rollNo: string;
  year: number;
  department: { id: string; code: string; name: string };
  section: { id: string; name: string; year: number };
  phone: string | null;
  address: string | null;
};

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<StudentProfileResponse | null>(null);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchPortal("/api/portal/student/profile");
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || "Unable to load profile.");
        }
        const data = (await response.json()) as StudentProfileResponse;
        if (!cancelled) {
          setProfile(data);
          setPhone(data.phone ?? "");
          setAddress(data.address ?? "");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to load profile.");
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
    if (!profile) {
      return [] as { label: string; value: string }[];
    }
    return [
      { label: "Name", value: profile.name },
      { label: "Roll No", value: profile.rollNo },
      { label: "Email", value: profile.email },
      { label: "Year", value: String(profile.year) },
      { label: "Department", value: profile.department.code },
      { label: "Section", value: profile.section.name },
    ];
  }, [profile]);

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const response = await fetchPortal("/api/portal/student/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, address }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Unable to update profile.");
      }

      const updated = (await response.json()) as StudentProfileResponse;
      setProfile(updated);
      setPhone(updated.phone ?? "");
      setAddress(updated.address ?? "");
      setMessage("Profile updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="portal-page">
      <div>
        <p className="portal-brand">Student</p>
        <h1 className="portal-page-title">Profile</h1>
        <p className="portal-page-subtitle">View your academic identity and update contact details.</p>
      </div>

      {message ? <div className="portal-notice">{message}</div> : null}
      {error ? <div className="portal-notice">{error}</div> : null}

      <div className="portal-card">
        {loading ? (
          <p className="portal-card-note">Loading profile...</p>
        ) : profile ? (
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
        <h3>Contact Details</h3>
        <p className="portal-card-note">Only you can edit these fields.</p>
        <form className="portal-form-grid" onSubmit={handleSave}>
          <div className="portal-form-columns">
            <div className="field">
              <label htmlFor="phone">Phone</label>
              <input
                id="phone"
                className="input"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="Enter phone number"
                inputMode="tel"
              />
            </div>
            <div className="field">
              <label htmlFor="address">Address</label>
              <input
                id="address"
                className="input"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                placeholder="Enter address"
              />
            </div>
          </div>
          <div className="portal-actions">
            <button className="portal-button" type="submit" disabled={saving || loading || !profile}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
