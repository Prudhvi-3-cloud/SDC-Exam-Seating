import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { jsonError } from "@/app/api/_shared";

const querySchema = z.object({
  rollNo: z.string().min(1).optional(),
});

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ planId: string }> },
) {
  const { planId } = await params;
  const plan = await prisma.seatingPlan.findUnique({
    where: { id: planId },
    include: {
      session: true,
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

  const data = plan.assignments.map((assignment) => ({
    planId: plan.id,
    studentId: assignment.studentId,
    toEmail: assignment.student.email,
    subject: `Seating Allocation - Day ${plan.dayIndex}`,
    body: `Your seat: Day ${plan.dayIndex}, Block ${assignment.room.block}, Room ${assignment.room.roomNo}, Bench ${assignment.benchNo}, Seat ${assignment.seatNo}`,
  }));

  const result =
    data.length === 0
      ? { count: 0 }
      : await prisma.outboxEmail.createMany({
          data,
          skipDuplicates: true,
        });

  return NextResponse.json({ created: result.count });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ planId: string }> },
) {
  const { planId } = await params;
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({ rollNo: searchParams.get("rollNo") || undefined });

  if (!parsed.success) {
    return jsonError("Invalid roll number filter.");
  }

  const emails = await prisma.outboxEmail.findMany({
    where: {
      planId,
      student: parsed.data.rollNo
        ? {
            rollNo: {
              contains: parsed.data.rollNo,
              mode: "insensitive",
            },
          }
        : undefined,
    },
    include: {
      student: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json({ emails });
}
