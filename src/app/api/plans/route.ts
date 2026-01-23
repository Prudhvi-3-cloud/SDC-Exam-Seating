import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { jsonError } from "@/app/api/_shared";

const querySchema = z.object({
  sessionId: z.string().min(1),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({ sessionId: searchParams.get("sessionId") });

  if (!parsed.success) {
    return jsonError("Missing sessionId.");
  }

  const plans = await prisma.seatingPlan.findMany({
    where: { sessionId: parsed.data.sessionId },
    orderBy: [{ dayIndex: "asc" }, { version: "asc" }],
  });

  return NextResponse.json({ plans });
}
