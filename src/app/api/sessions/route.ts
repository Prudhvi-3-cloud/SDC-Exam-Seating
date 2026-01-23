import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { jsonError } from "@/app/api/_shared";

const createSessionSchema = z.object({
  examType: z.enum(["MID", "SEM"]),
  daysCount: z.number().int().min(1).max(30),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = createSessionSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError("Invalid session payload.");
  }

  const session = await prisma.examSession.create({
    data: parsed.data,
  });

  return NextResponse.json(session);
}