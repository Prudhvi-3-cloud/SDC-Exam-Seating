"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useMemo, useState } from "react";
import SritShell from "@/components/SritShell";

type SessionResponse = {
  session: {
    id: string;
    examType: "MID" | "SEM";
    daysCount: number;
    createdAt: string;
  };
  studentCount: number;
  roomCount: number;
  selectedStudentIds: string[];
  selectedRoomIds: string[];
};

type Student = {
  id: string;
  rollNo: string;
  name: string;
  dept: string;
  year: number;
};

type Room = {
  id: string;
  block: string;
  roomNo: string;
  benches: number;
  seatsPerBench: number;
};

type Plan = {
  id: string;
  dayIndex: number;
  version: number;
};

export default function SessionDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [session, setSession] = useState<SessionResponse | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [selectedRoomIds, setSelectedRoomIds] = useState<Set<string>>(new Set());
  const [deptFilter, setDeptFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [versionsPerDay, setVersionsPerDay] = useState(1);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isStepBusy, setIsStepBusy] = useState(false);
  const [isAllowed, setIsAllowed] = useState(false);

  const isSem = session?.session.examType === "SEM";
  const seatMultiplier = isSem ? 1 : 2;

  const totalSelectedBenches = useMemo(() => {
    return rooms
      .filter((room) => selectedRoomIds.has(room.id))
      .reduce((sum, room) => sum + room.benches, 0);
  }, [rooms, selectedRoomIds]);

  const totalSelectedSeats = totalSelectedBenches * seatMultiplier;
  const remainingSeats = totalSelectedSeats - selectedStudentIds.size;
  const toastMessage = error ?? status;
  const toastClass = error ? "toast toast-error" : "toast toast-success";

  const fetchSession = async () => {
    const response = await fetch(`/api/sessions/${id}`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Unable to load session.");
    }
    setSession(data);
    setSelectedStudentIds(new Set(data.selectedStudentIds));
    setSelectedRoomIds(new Set(data.selectedRoomIds));
  };

  const fetchStudents = async () => {
    const query = new URLSearchParams();
    if (deptFilter) query.set("dept", deptFilter);
    if (yearFilter) query.set("year", yearFilter);
    const response = await fetch(`/api/students?${query.toString()}`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Unable to load students.");
    }
    setStudents(data.students ?? []);
  };

  const fetchRooms = async () => {
    const response = await fetch("/api/rooms");
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Unable to load rooms.");
    }
    setRooms(data.rooms ?? []);
  };

  const fetchPlans = async () => {
    const response = await fetch(`/api/plans?sessionId=${id}`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Unable to load plans.");
    }
    setPlans(data.plans ?? []);
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
        await Promise.all([fetchSession(), fetchStudents(), fetchRooms(), fetchPlans()]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load data.");
      }
    })();
  }, [isAllowed]);

  useEffect(() => {
    if (!isAllowed) {
      return;
    }
    fetchStudents().catch((err) => {
      setError(err instanceof Error ? err.message : "Unable to load students.");
    });
  }, [deptFilter, yearFilter, isAllowed]);

  const toggleStudent = (studentId: string) => {
    setSelectedStudentIds((prev) => {
      const next = new Set(prev);
      if (next.has(studentId)) {
        next.delete(studentId);
      } else {
        next.add(studentId);
      }
      return next;
    });
  };

  const toggleRoom = (roomId: string) => {
    setSelectedRoomIds((prev) => {
      const next = new Set(prev);
      if (next.has(roomId)) {
        next.delete(roomId);
      } else {
        next.add(roomId);
      }
      return next;
    });
  };

  const selectAllFiltered = () => {
    const allSelected = students.every((student) => selectedStudentIds.has(student.id));
    setSelectedStudentIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        students.forEach((student) => next.delete(student.id));
      } else {
        students.forEach((student) => next.add(student.id));
      }
      return next;
    });
  };

  const saveStudents = async () => {
    setStatus("Saving students...");
    setError(null);
    try {
      const response = await fetch(`/api/sessions/${id}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentIds: Array.from(selectedStudentIds) }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Unable to save students.");
      setStatus("Student selection saved.");
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save students.");
      return false;
    }
  };

  const saveRooms = async () => {
    setStatus("Saving rooms...");
    setError(null);
    try {
      const response = await fetch(`/api/sessions/${id}/rooms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomIds: Array.from(selectedRoomIds) }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Unable to save rooms.");
      setStatus("Room selection saved.");
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save rooms.");
      return false;
    }
  };

  const generatePlans = async () => {
    setStatus("Generating plans...");
    setError(null);
    try {
      const response = await fetch(`/api/sessions/${id}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ versionsPerDay }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Unable to generate plans.");
      setStatus(`Created ${data.plans?.length ?? 0} plan(s).`);
      await fetchPlans();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to generate plans.");
    }
  };

  const handleNextFromStudents = async () => {
    setIsStepBusy(true);
    const ok = await saveStudents();
    if (ok) setCurrentStep(1);
    setIsStepBusy(false);
  };

  const handleNextFromRooms = async () => {
    setIsStepBusy(true);
    const ok = await saveRooms();
    if (ok) setCurrentStep(2);
    setIsStepBusy(false);
  };

  const handleGenerate = async () => {
    setIsStepBusy(true);
    const roomsOk = await saveRooms();
    const studentsOk = await saveStudents();
    if (roomsOk && studentsOk) {
      await generatePlans();
    }
    setIsStepBusy(false);
  };

  const StepFooter = ({
    onNext,
    onBack,
    disableNext = false,
  }: {
    onNext?: () => void;
    onBack?: () => void;
    disableNext?: boolean;
  }) => (
    <div className="section-actions">
      <button className="button button-outline" onClick={onBack} disabled={!onBack}>
        Back
      </button>
      <button className="button" onClick={onNext} disabled={disableNext || !onNext || isStepBusy}>
        Next
      </button>
    </div>
  );

  if (!isAllowed) {
    return null;
  }

  return (
    <SritShell title="Exam Session Setup" wide>
      {toastMessage ? (
        <div className={toastClass} role="status" aria-live="polite">
          <span>{toastMessage}</span>
          <button
            onClick={() => {
              setError(null);
              setStatus(null);
            }}
          >
            ×
          </button>
        </div>
      ) : null}
      <div className="layout-two-col">
        <aside className="side-panel">
          <div className="card">
            <div className="card-title">Session Summary</div>
            <div className="card-body grid">
              <div>
                <p className="kicker">Session</p>
                <h2>{session?.session.examType ?? ""} Examination</h2>
                <div>Days: {session?.session.daysCount ?? "-"}</div>
              </div>
              <div>
                <p className="kicker">Selection</p>
                <div className="badge">Students: {selectedStudentIds.size}</div>
                <div className="badge" style={{ marginLeft: "0.5rem" }}>
                  Rooms: {selectedRoomIds.size}
                </div>
                <div style={{ marginTop: "0.5rem" }}>
                  Capacity: {totalSelectedSeats} seats ({remainingSeats} remaining)
                </div>
                <div style={{ marginTop: "0.35rem", fontSize: "0.85rem", color: "#6b6b6b" }}>
                  Seats per bench: {seatMultiplier}
                </div>
              </div>
              <div>
                <p className="kicker">Progress</p>
                <div>Step {currentStep + 1} of 3</div>
              </div>
            </div>
          </div>
        </aside>
        <section className="content-panel">
          {currentStep === 0 ? (
            <div className="card">
              <div className="card-title">Step 1: Select Students</div>
              <div className="card-body">
                <div className="grid grid-two">
                  <div className="field">
                    <label>Department</label>
                    <select
                      className="select"
                      value={deptFilter}
                      onChange={(event) => setDeptFilter(event.target.value)}
                    >
                      <option value="">All</option>
                      <option value="CSE">CSE</option>
                      <option value="CSM">CSM</option>
                      <option value="ECE">ECE</option>
                      <option value="CIVIL">CIVIL</option>
                    </select>
                  </div>
                  <div className="field">
                    <label>Year</label>
                    <select
                      className="select"
                      value={yearFilter}
                      onChange={(event) => setYearFilter(event.target.value)}
                    >
                      <option value="">All</option>
                      {[1, 2, 3, 4].map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="section-actions">
                  <button className="button button-outline" onClick={selectAllFiltered}>
                    Select All
                  </button>
                  <button className="button" onClick={saveStudents}>
                    Save Students
                  </button>
                </div>
                <div className="selection-list" style={{ marginTop: "1rem" }}>
                  {students.map((student) => (
                    <label key={student.id} className="list-item">
                      <div>
                        <strong>{student.rollNo}</strong> - {student.name}
                        <div style={{ fontSize: "0.8rem", color: "#666" }}>
                          {student.dept} | Year {student.year}
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedStudentIds.has(student.id)}
                        onChange={() => toggleStudent(student.id)}
                      />
                    </label>
                  ))}
                </div>
                <StepFooter
                  onNext={handleNextFromStudents}
                  disableNext={selectedStudentIds.size === 0}
                />
              </div>
            </div>
          ) : null}

          {currentStep === 1 ? (
            <div className="card">
              <div className="card-title">Step 2: Select Rooms</div>
              <div className="card-body">
                <div className="selection-list">
                  {rooms.map((room) => {
                    const roomSeats = room.benches * seatMultiplier;
                    return (
                      <label key={room.id} className="list-item">
                        <div>
                          <strong>
                            Block {room.block} - {room.roomNo}
                          </strong>
                          <div style={{ fontSize: "0.8rem", color: "#666" }}>
                            {room.benches} benches | {roomSeats} seats
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={selectedRoomIds.has(room.id)}
                          onChange={() => toggleRoom(room.id)}
                        />
                      </label>
                    );
                  })}
                </div>
                <div className="section-actions">
                  <button className="button" onClick={saveRooms}>
                    Save Rooms
                  </button>
                </div>
                <StepFooter
                  onBack={() => setCurrentStep(0)}
                  onNext={handleNextFromRooms}
                  disableNext={selectedRoomIds.size === 0}
                />
              </div>
            </div>
          ) : null}

          {currentStep === 2 ? (
            <div className="card">
              <div className="card-title">Step 3: Generate Seating Plans</div>
              <div className="card-body grid grid-two">
                <div>
                  <div className="field">
                    <label>Versions per day</label>
                    <input
                      className="input"
                      type="number"
                      min={1}
                      max={5}
                      value={versionsPerDay}
                      onChange={(event) => setVersionsPerDay(Number(event.target.value))}
                    />
                  </div>
                  <div className="section-actions">
                    <button className="button" onClick={handleGenerate} disabled={isStepBusy}>
                      Generate Plans
                    </button>
                  </div>
                  <StepFooter onBack={() => setCurrentStep(1)} />
                </div>
                <div>
                  <p className="kicker">Plans</p>
                  {plans.length === 0 ? (
                    <div className="notice">No plans generated yet.</div>
                  ) : (
                    <ul>
                      {plans.map((plan) => (
                        <li key={plan.id} style={{ marginBottom: "0.5rem" }}>
                          Day {plan.dayIndex} - Version {plan.version} |{" "}
                          <Link href={`/admin/plan/${plan.id}`} className="badge">
                            View Plan
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </SritShell>
  );
}
