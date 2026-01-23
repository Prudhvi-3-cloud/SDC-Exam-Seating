import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { jsonError } from "@/app/api/_shared";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ planId: string }> },
) {
  const { planId } = await params;
  const plan = await prisma.seatingPlan.findUnique({
    where: { id: planId },
    include: {
      session: {
        include: {
          sessionRooms: {
            include: {
              room: true,
            },
          },
        },
      },
      assignments: {
        include: {
          student: true,
          room: true,
        },
      },
    },
  });

  if (!plan) {
    return jsonError("Plan not found.", 404);
  }

  const rooms = plan.session.sessionRooms.map((entry) => entry.room).sort((a, b) => {
    const blockCompare = a.block.localeCompare(b.block);
    if (blockCompare !== 0) return blockCompare;
    return a.roomNo.localeCompare(b.roomNo, undefined, { numeric: true });
  });

  const groupedAssignments = rooms.map((room) => ({
    room,
    assignments: plan.assignments
      .filter((assignment) => assignment.roomId === room.id)
      .map((assignment) => ({
        benchNo: assignment.benchNo,
        seatNo: assignment.seatNo,
        student: {
          id: assignment.student.id,
          rollNo: assignment.student.rollNo,
          name: assignment.student.name,
          dept: assignment.student.dept,
          year: assignment.student.year,
        },
      })),
  }));

  return NextResponse.json({
    plan: {
      id: plan.id,
      sessionId: plan.sessionId,
      dayIndex: plan.dayIndex,
      version: plan.version,
      seed: plan.seed,
      createdAt: plan.createdAt,
      examType: plan.session.examType,
    },
    rooms: groupedAssignments,
  });
}
