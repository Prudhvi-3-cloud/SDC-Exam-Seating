"use client";

import { DayOfWeek } from "@prisma/client";
import { useEffect, useMemo, useState } from "react";
import { fetchPortal } from "@/lib/portal-client";

type TimetableEntryDto = {
  id: string;
  year: number;
  departmentId: string;
  dayOfWeek: DayOfWeek;
  slot: string;
  subject: string;
  facultyName: string;
  room: string;
};

type TimetableResponse = {
  year: number;
  departmentId: string;
  groupedByDay: { day: DayOfWeek; entries: TimetableEntryDto[] }[];
  entries: TimetableEntryDto[];
};

const dayLabels: Record<DayOfWeek, string> = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
};

export default function StudentTimetablePage() {
  const [data, setData] = useState<TimetableResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchPortal("/api/portal/student/timetable");
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.error || "Unable to load timetable.");
        }
        const payload = (await response.json()) as TimetableResponse;
        if (!cancelled) {
          setData(payload);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to load timetable.");
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

  const daysWithEntries = useMemo(() => {
    if (!data?.groupedByDay?.length) {
      return [] as { day: DayOfWeek; entries: TimetableEntryDto[] }[];
    }
    return data.groupedByDay.filter((group) => group.entries.length > 0);
  }, [data]);

  const slots = useMemo(() => {
    if (!data?.entries?.length) {
      return [] as string[];
    }
    return Array.from(new Set(data.entries.map((entry) => entry.slot))).sort((a, b) =>
      a.localeCompare(b)
    );
  }, [data]);

  const entryMap = useMemo(() => {
    const map = new Map<string, TimetableEntryDto>();
    data?.entries?.forEach((entry) => {
      map.set(`${entry.dayOfWeek}-${entry.slot}`, entry);
    });
    return map;
  }, [data]);

  return (
    <div className="portal-page">
      <div>
        <p className="portal-brand">Student</p>
        <h1 className="portal-page-title">Timetable</h1>
        <p className="portal-page-subtitle">Your weekly schedule for Year {data?.year ?? "--"}.</p>
      </div>

      {error ? <div className="portal-notice">{error}</div> : null}

      <div className="portal-card">
        {loading ? (
          <p className="portal-card-note">Loading timetable...</p>
        ) : daysWithEntries.length && slots.length ? (
          <>
            <div className="timetable-grid-wrapper">
              <table className="timetable-grid">
                <thead>
                  <tr>
                    <th>Time Slot</th>
                    {daysWithEntries.map((group) => (
                      <th key={group.day}>{dayLabels[group.day]}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {slots.map((slot) => (
                    <tr key={slot}>
                      <th>{slot}</th>
                      {daysWithEntries.map((group) => {
                        const entry = entryMap.get(`${group.day}-${slot}`);
                        return (
                          <td key={`${group.day}-${slot}`}>
                            {entry ? (
                              <div>
                                <div className="timetable-cell-subject">{entry.subject}</div>
                                <div className="timetable-cell-meta">
                                  {entry.facultyName} - {entry.room}
                                </div>
                              </div>
                            ) : (
                              <span className="portal-card-note">--</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="timetable-day-cards" style={{ marginTop: "0.25rem" }}>
              {daysWithEntries.map((group) => (
                <div key={group.day} className="timetable-day-card">
                  <h3>{dayLabels[group.day]}</h3>
                  {group.entries.map((entry) => (
                    <div key={entry.id} className="timetable-slot-card">
                      <div className="timetable-slot-time">{entry.slot}</div>
                      <div className="timetable-cell-subject">{entry.subject}</div>
                      <div className="timetable-cell-meta">
                        {entry.facultyName} - {entry.room}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="portal-empty-state">No timetable entries found for your section yet.</div>
        )}
      </div>
    </div>
  );
}
