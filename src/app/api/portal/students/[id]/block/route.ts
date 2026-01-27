import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";

const blockSchema = z.object({
  isBlocked: z.boolean(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const body = await request.json().catch(() => null);
  const parsed = blockSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { id } = await params;
  const pathId = new URL(request.url).pathname.split("/").slice(-2, -1)[0];
  const studentId = id ?? pathId ?? "";
  const student = await prisma.studentProfile.findUnique({
    where: { id: studentId },
    include: { user: true },
  });

  if (!student) {
    return NextResponse.json({ error: "Student not found." }, { status: 404 });
  }

  const updated = await prisma.portalUser.updateMany({
    where: { id: student.userId },
    data: { isBlocked: parsed.data.isBlocked },
  });

  if (!updated.count) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  return NextResponse.json({ userId: student.userId, isBlocked: parsed.data.isBlocked });
}
