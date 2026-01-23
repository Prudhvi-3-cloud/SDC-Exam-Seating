import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { jsonError } from "@/app/api/_shared";

const selectionSchema = z.object({
  studentIds: z.array(z.string().min(1)),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = selectionSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError("Invalid student selection.");
  }

  const session = await prisma.examSession.findUnique({
    where: { id },
  });

  if (!session) {
    return jsonError("Session not found.", 404);
  }

  await prisma.$transaction(async (tx) => {
    await tx.sessionStudent.deleteMany({ where: { sessionId: session.id } });
    if (parsed.data.studentIds.length > 0) {
      await tx.sessionStudent.createMany({
        data: parsed.data.studentIds.map((studentId) => ({
          sessionId: session.id,
          studentId,
        })),
      });
    }
  });

  return NextResponse.json({ ok: true });
}
