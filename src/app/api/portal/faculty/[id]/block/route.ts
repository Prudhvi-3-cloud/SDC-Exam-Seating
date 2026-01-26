import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";

const blockSchema = z.object({
  isBlocked: z.boolean(),
});

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json().catch(() => null);
  const parsed = blockSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const pathId = new URL(request.url).pathname.split("/").slice(-2, -1)[0];
  const facultyId = params.id ?? pathId ?? "";
  const faculty = await prisma.facultyProfile.findUnique({
    where: { id: facultyId },
    include: { user: true },
  });

  if (!faculty) {
    return NextResponse.json({ error: "Faculty not found." }, { status: 404 });
  }

  const updated = await prisma.portalUser.updateMany({
    where: { id: faculty.userId },
    data: { isBlocked: parsed.data.isBlocked },
  });

  if (!updated.count) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  return NextResponse.json({ userId: faculty.userId, isBlocked: parsed.data.isBlocked });
}
