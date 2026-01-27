"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";

type PlanResponse = {
  plan: {
    id: string;
    sessionId: string;
    dayIndex: number;
    version: number;
    examType: "MID" | "SEM";
  };
  rooms: {
    room: {
      id: string;
      block: string;
      roomNo: string;
      benches: number;
      seatsPerBench: number;
    };
    assignments: {
      benchNo: number;
      seatNo: number;
      student: {
        id: string;
        rollNo: string;
        name: string;
        dept: string;
        year: number;
      };
    }[];
  }[];
};

type OutboxEmail = {
  id: string;
  subject: string;
  body: string;
  toEmail: string;
  student: {
    rollNo: string;
    name: string;
  };
};

type InvigilatorAssignment = {
  roomId: string;
  faculty: string[];
};

export default function PlanDetail({ params }: { params: Promise<{ planId: string }> }) {
  const { planId } = use(params);
  const [planData, setPlanData] = useState<PlanResponse | null>(null);
  const [outbox, setOutbox] = useState<OutboxEmail[]>([]);
  const [invigilators, setInvigilators] = useState<InvigilatorAssignment[]>([]);
  const [rollNoFilter, setRollNoFilter] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingPlan, setIsLoadingPlan] = useState(true);
  const [isLoadingOutbox, setIsLoadingOutbox] = useState(false);
  const [isLoadingInvigilators, setIsLoadingInvigilators] = useState(false);

  const seatColumns = planData?.plan.examType === "SEM" ? [1] : [1, 2];

  const fetchPlan = async () => {
    setIsLoadingPlan(true);
    try {
      const response = await fetch(`/api/plans/${planId}`);
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || "Unable to load plan.");
      }
      setPlanData(data as PlanResponse);
      return data as PlanResponse;
    } finally {
      setIsLoadingPlan(false);
    }
  };

  const fetchOutbox = async (rollNo?: string) => {
    setIsLoadingOutbox(true);
    const query = rollNo ? `?rollNo=${encodeURIComponent(rollNo)}` : "";
    try {
      const response = await fetch(`/api/plans/${planId}/outbox${query}`);
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || "Unable to load outbox emails.");
      }
      setOutbox(data.emails ?? []);
    } finally {
      setIsLoadingOutbox(false);
    }
  };

  const fetchInvigilators = async (sessionId: string) => {
    setIsLoadingInvigilators(true);
    try {
      const response = await fetch(`/api/sessions/${sessionId}/invigilators`);
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        return;
      }
      const grouped = new Map<string, string[]>();
      (data?.invigilators ?? []).forEach((item: { roomId: string; facultyProfile?: { user?: { name?: string } } }) => {
        const name = item.facultyProfile?.user?.name ?? "Faculty";
        const current = grouped.get(item.roomId) ?? [];
        current.push(name);
        grouped.set(item.roomId, current);
      });
      setInvigilators(
        Array.from(grouped.entries()).map(([roomId, faculty]) => ({ roomId, faculty })),
      );
    } finally {
      setIsLoadingInvigilators(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        setError(null);
        const plan = await fetchPlan();
        await fetchOutbox();
        if (plan?.plan.sessionId) {
          await fetchInvigilators(plan.plan.sessionId);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load plan.");
      }
    })();
  }, []);

  const handleCreateOutbox = async () => {
    setStatus("Creating outbox emails...");
    setError(null);
    try {
      const response = await fetch(`/api/plans/${planId}/outbox`, {
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to create outbox emails.");
      setStatus(`Created ${data.created} outbox emails.`);
      await fetchOutbox(rollNoFilter || undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create outbox emails.");
    }
  };

  const handleFilter = async () => {
    try {
      await fetchOutbox(rollNoFilter || undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to filter outbox.");
    }
  };

  const renderSeatTable = (roomGroup: PlanResponse["rooms"][number]) => {
    const assignmentMap = new Map(
      roomGroup.assignments.map((assignment) => [
        `${assignment.benchNo}-${assignment.seatNo}`,
        assignment.student,
      ]),
    );
    const invigilatorNames =
      invigilators.find((item) => item.roomId === roomGroup.room.id)?.faculty ?? [];

    return (
      <div className="plan-grid" key={roomGroup.room.id}>
        <div className="plan-room-header">
          Block {roomGroup.room.block} - Room {roomGroup.room.roomNo} | {roomGroup.room.benches} benches
        </div>
        <div className="plan-grid-scroll">
          <table>
            <thead>
              <tr>
                <th>Bench</th>
                {seatColumns.map((seatNo) => (
                  <th key={`roll-${seatNo}`}>Seat {seatNo} Roll</th>
                ))}
                {seatColumns.map((seatNo) => (
                  <th key={`dept-${seatNo}`}>Seat {seatNo} Dept</th>
                ))}
                {seatColumns.map((seatNo) => (
                  <th key={`year-${seatNo}`}>Seat {seatNo} Year</th>
                ))}
                <th>Invigilator(s)</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: roomGroup.room.benches }).map((_, index) => {
                const benchNo = index + 1;
                return (
                  <tr key={benchNo}>
                    <td>{benchNo}</td>
                    {seatColumns.map((seatNo) => {
                      const student = assignmentMap.get(`${benchNo}-${seatNo}`);
                      return <td key={`roll-${seatNo}`}>{student?.rollNo ?? "-"}</td>;
                    })}
                    {seatColumns.map((seatNo) => {
                      const student = assignmentMap.get(`${benchNo}-${seatNo}`);
                      return <td key={`dept-${seatNo}`}>{student?.dept ?? "-"}</td>;
                    })}
                    {seatColumns.map((seatNo) => {
                      const student = assignmentMap.get(`${benchNo}-${seatNo}`);
                      return <td key={`year-${seatNo}`}>{student?.year ?? "-"}</td>;
                    })}
                    {index === 0 ? (
                      <td rowSpan={roomGroup.room.benches}>
                        {invigilatorNames.join(", ") || "-"}
                      </td>
                    ) : null}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="portal-page">
      {error ? <div className="notice" style={{ marginBottom: "1rem" }}>{error}</div> : null}
      {status ? <div className="notice" style={{ marginBottom: "1rem" }}>{status}</div> : null}

      {isLoadingPlan && !planData ? (
        <div className="card">
          <div className="card-body">
            <p className="portal-card-note">Loading plan details...</p>
          </div>
        </div>
      ) : null}

      <div className="card">
        <div className="card-title">Plan Overview</div>
        <div className="card-body grid grid-two">
          <div>
            <h2>
              Day {planData?.plan.dayIndex} - Version {planData?.plan.version}
            </h2>
            <div>Exam Type: {planData?.plan.examType}</div>
          </div>
          <div className="section-actions">
            <button className="button" onClick={handleCreateOutbox}>
              Create Outbox Emails
            </button>
            <Link
              className="button button-outline"
              href={`/portal/admin/examplanning/plan/${planId}/print`}
              target="_blank"
            >
              Print Room Sheet
            </Link>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Room-wise Seating Grid</div>
        <div className="card-body">
          {isLoadingPlan ? (
            <p className="portal-card-note">Loading seating grid...</p>
          ) : planData?.rooms?.length ? (
            planData.rooms.map(renderSeatTable)
          ) : (
            <div className="portal-empty-state">No rooms found for this plan.</div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-title">Outbox Emails (Dry Run)</div>
        <div className="card-body">
          <div className="notice" style={{ marginBottom: "1rem" }}>
            Dry Run - Emails are not actually sent. This outbox is for review only.
          </div>
          <div className="grid grid-two" style={{ marginBottom: "1rem" }}>
            <input
              className="input"
              placeholder="Filter by roll number"
              value={rollNoFilter}
              onChange={(event) => setRollNoFilter(event.target.value)}
            />
            <button className="button button-outline" onClick={handleFilter}>
              Filter
            </button>
          </div>
          {isLoadingOutbox ? (
            <div className="notice">Loading outbox emails...</div>
          ) : outbox.length === 0 ? (
            <div className="notice">
              No outbox emails yet. Click “Create Outbox Emails” to generate the dry run.
            </div>
          ) : (
            <div className="grid">
              {outbox.map((email) => (
                <details key={email.id} className="outbox-card">
                  <summary>
                    <strong>{email.student.rollNo}</strong> | {email.toEmail} - {email.subject}
                  </summary>
                  <p>{email.body}</p>
                </details>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-title">Invigilator Allocation</div>
        <div className="card-body">
          {isLoadingInvigilators && !planData?.rooms?.length ? (
            <p className="portal-card-note">Loading invigilator allocation...</p>
          ) : planData?.rooms.length ? (
            <div className="portal-table-wrapper">
              <table className="portal-table">
                <thead>
                  <tr>
                    <th>Room</th>
                    <th>Invigilator(s)</th>
                  </tr>
                </thead>
                <tbody>
                  {planData.rooms.map((roomGroup) => {
                    const invigilatorNames =
                      invigilators.find((item) => item.roomId === roomGroup.room.id)?.faculty ??
                      [];
                    return (
                      <tr key={roomGroup.room.id}>
                        <td>
                          Block {roomGroup.room.block} - {roomGroup.room.roomNo}
                        </td>
                        <td>{invigilatorNames.join(", ") || "-"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="notice">No rooms available.</div>
          )}
        </div>
      </div>
    </div>
  );
}
