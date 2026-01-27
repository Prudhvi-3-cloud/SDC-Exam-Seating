import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { generatePlan } from "@/lib/seating";
import { jsonError } from "@/app/api/_shared";

const generateSchema = z.object({
  versionsPerDay: z.number().int().min(1).max(5).optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const parsed = generateSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError("Invalid generation payload.");
  }

  const session = await prisma.examSession.findUnique({
    where: { id },
  });

  if (!session) {
    return jsonError("Session not found.", 404);
  }

  const existingPlans = await prisma.seatingPlan.findMany({
    where: { sessionId: session.id },
    select: { dayIndex: true, version: true },
    orderBy: [{ dayIndex: "asc" }, { version: "asc" }],
  });

  if (existingPlans.length) {
    const daysWithPlans = Array.from(new Set(existingPlans.map((plan) => plan.dayIndex)));
    const dayList = daysWithPlans.map((day) => `Day ${day}`).join(", ");
    return jsonError(
      `A plan already exists for ${dayList}. Create a new version or delete the old one.`,
      409,
    );
  }

  const versions = parsed.data.versionsPerDay ?? 1;
  const createdPlans = [] as { id: string; dayIndex: number; version: number }[];

  try {
    for (let dayIndex = 1; dayIndex <= session.daysCount; dayIndex += 1) {
      for (let version = 1; version <= versions; version += 1) {
        const plan = await generatePlan(session.id, dayIndex, version);
        createdPlans.push({ id: plan.id, dayIndex: plan.dayIndex, version: plan.version });
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Generation failed.";
    const isCapacityError = message.toLowerCase().includes("insufficient capacity");
    if (isCapacityError) {
      const [selectedStudentsCount, selectedRooms] = await Promise.all([
        prisma.sessionStudent.count({ where: { sessionId: session.id } }),
        prisma.sessionRoom.findMany({
          where: { sessionId: session.id },
          include: { room: true },
        }),
      ]);

      const totalSeats = selectedRooms.reduce((sum, sessionRoom) => {
        const seatsPerBench = session.examType === "MID" ? Math.min(2, sessionRoom.room.seatsPerBench) : 1;
        return sum + sessionRoom.room.benches * seatsPerBench;
      }, 0);

      const deficit = Math.max(0, selectedStudentsCount - totalSeats);
      return jsonError(
        `Insufficient capacity: ${selectedStudentsCount} students, ${totalSeats} seats, deficit ${deficit}.`,
        400,
      );
    }

    return jsonError(message);
  }

  return NextResponse.json({ plans: createdPlans });
}
