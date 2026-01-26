"use client";

import { use, useEffect, useState } from "react";

type PlanResponse = {
  plan: {
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

type InvigilatorAssignment = {
  roomId: string;
  faculty: string[];
};

export default function PrintPlan({ params }: { params: Promise<{ planId: string }> }) {
  const { planId } = use(params);
  const [planData, setPlanData] = useState<PlanResponse | null>(null);
  const seatColumns = planData?.plan.examType === "SEM" ? [1] : [1, 2];
  const [invigilators, setInvigilators] = useState<InvigilatorAssignment[]>([]);

  useEffect(() => {
    (async () => {
      const response = await fetch(`/api/plans/${planId}`);
      const data = await response.json();
      if (response.ok) {
        setPlanData(data);
        const sessionId = data?.plan?.sessionId;
        if (sessionId) {
          const invigilatorResponse = await fetch(`/api/sessions/${sessionId}/invigilators`);
          const invigilatorData = await invigilatorResponse.json().catch(() => null);
          if (invigilatorResponse.ok) {
            const grouped = new Map<string, string[]>();
            (invigilatorData?.invigilators ?? []).forEach((item: any) => {
              const name = item.facultyProfile?.user?.name ?? "Faculty";
              const current = grouped.get(item.roomId) ?? [];
              current.push(name);
              grouped.set(item.roomId, current);
            });
            setInvigilators(
              Array.from(grouped.entries()).map(([roomId, faculty]) => ({ roomId, faculty })),
            );
          }
        }
      }
    })();
  }, []);

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
        const invigilatorNames =
          invigilators.find((item) => item.roomId === roomGroup.room.id)?.faculty ?? [];

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
          </section>
        );
      })}

      <div className="print-room">
        <h2>Invigilator Allocation</h2>
        <div className="plan-grid">
          <table>
            <thead>
              <tr>
                <th>Room</th>
                <th>Invigilator(s)</th>
              </tr>
            </thead>
            <tbody>
              {planData?.rooms.map((roomGroup) => {
                const invigilatorNames =
                  invigilators.find((item) => item.roomId === roomGroup.room.id)?.faculty ?? [];
                return (
                  <tr key={roomGroup.room.id}>
                    <td>
                      Block {roomGroup.room.block} - Room {roomGroup.room.roomNo}
                    </td>
                    <td>{invigilatorNames.join(", ") || "-"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
