"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import SritShell from "@/components/SritShell";

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

export default function PlanDetail({ params }: { params: Promise<{ planId: string }> }) {
  const { planId } = use(params);
  const router = useRouter();
  const [planData, setPlanData] = useState<PlanResponse | null>(null);
  const [outbox, setOutbox] = useState<OutboxEmail[]>([]);
  const [rollNoFilter, setRollNoFilter] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAllowed, setIsAllowed] = useState(false);

  const seatColumns = planData?.plan.examType === "SEM" ? [1] : [1, 2];

  const fetchPlan = async () => {
    const response = await fetch(`/api/plans/${planId}`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Unable to load plan.");
    }
    setPlanData(data);
  };

  const fetchOutbox = async (rollNo?: string) => {
    const query = rollNo ? `?rollNo=${encodeURIComponent(rollNo)}` : "";
    const response = await fetch(`/api/plans/${planId}/outbox${query}`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Unable to load outbox emails.");
    }
    setOutbox(data.emails ?? []);
  };

  useEffect(() => {
    const allowed = localStorage.getItem("sritAdminAuthed") === "true";
    if (!allowed) {
      router.replace("/admin/login");
      return;
    }
    setIsAllowed(true);
  }, [router]);

  useEffect(() => {
    if (!isAllowed) {
      return;
    }
    (async () => {
      try {
        setError(null);
        await fetchPlan();
        await fetchOutbox();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load plan.");
      }
    })();
  }, [isAllowed]);

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

    return (
      <div className="plan-grid" key={roomGroup.room.id}>
        <div className="plan-room-header">
          Block {roomGroup.room.block} - Room {roomGroup.room.roomNo} | {roomGroup.room.benches} benches
        </div>
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
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  if (!isAllowed) {
    return null;
  }

  return (
    <SritShell title="Seating Plan Preview">
      {error ? <div className="notice" style={{ marginBottom: "1rem" }}>{error}</div> : null}
      {status ? <div className="notice" style={{ marginBottom: "1rem" }}>{status}</div> : null}

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
            <Link className="button button-outline" href={`/admin/plan/${planId}/print`} target="_blank">
              Print Room Sheet
            </Link>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Room-wise Seating Grid</div>
        <div className="card-body">
          {planData?.rooms.map(renderSeatTable)}
        </div>
      </div>

      <div className="card">
        <div className="card-title">Outbox Emails (Dry Run)</div>
        <div className="card-body">
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
          {outbox.length === 0 ? (
            <div className="notice">No outbox emails yet.</div>
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
    </SritShell>
  );
}
