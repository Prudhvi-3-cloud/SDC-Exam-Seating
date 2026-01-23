"use client";

import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

type PlanResponse = {
  plan: {
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
    };
    assignments: {
      benchNo: number;
      seatNo: number;
      student: {
        rollNo: string;
        dept?: string;
        year?: number;
      };
    }[];
  }[];
};

export default function PrintPlan({ params }: { params: Promise<{ planId: string }> }) {
  const { planId } = use(params);
  const router = useRouter();
  const [planData, setPlanData] = useState<PlanResponse | null>(null);
  const seatColumns = planData?.plan.examType === "SEM" ? [1] : [1, 2];
  const [isAllowed, setIsAllowed] = useState(false);

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
      const response = await fetch(`/api/plans/${planId}`);
      const data = await response.json();
      if (response.ok) {
        setPlanData(data);
      }
    })();
  }, [isAllowed]);

  if (!isAllowed) {
    return null;
  }

  return (
    <div className="print-page">
      <h1>Room Sheet</h1>
      <div>Day {planData?.plan.dayIndex} | Version {planData?.plan.version}</div>
      {planData?.rooms.map((roomGroup) => {
        const assignmentMap = new Map(
          roomGroup.assignments.map((assignment) => [
            `${assignment.benchNo}-${assignment.seatNo}`,
            assignment.student,
          ]),
        );

        return (
          <section key={roomGroup.room.id} className="print-room">
            <h2>
              Block {roomGroup.room.block} - Room {roomGroup.room.roomNo}
            </h2>
            <div className="plan-grid">
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
          </section>
        );
      })}
    </div>
  );
}
