import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { jsonError } from "@/app/api/_shared";

const selectionSchema = z.object({
  roomIds: z.array(z.string().min(1)),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = selectionSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError("Invalid room selection.");
  }

  const session = await prisma.examSession.findUnique({
    where: { id },
  });

  if (!session) {
    return jsonError("Session not found.", 404);
  }

  await prisma.$transaction(async (tx) => {
    await tx.sessionRoom.deleteMany({ where: { sessionId: session.id } });
    if (parsed.data.roomIds.length > 0) {
      await tx.sessionRoom.createMany({
        data: parsed.data.roomIds.map((roomId) => ({
          sessionId: session.id,
          roomId,
        })),
      });
    }
  });

  return NextResponse.json({ ok: true });
}
