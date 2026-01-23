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
    return jsonError(message);
  }

  return NextResponse.json({ plans: createdPlans });
}
