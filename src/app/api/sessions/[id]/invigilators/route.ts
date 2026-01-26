import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { jsonError } from "@/app/api/_shared";

const assignSchema = z.object({
  facultyProfileIds: z.array(z.string().min(1)).min(1),
});

function shuffle<T>(items: T[]) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await prisma.examSession.findUnique({ where: { id } });
  if (!session) {
    return jsonError("Session not found.", 404);
  }

  const invigilators = await prisma.sessionInvigilator.findMany({
    where: { sessionId: id },
    include: {
      room: true,
      facultyProfile: { include: { user: true, department: true } },
    },
  });

  return NextResponse.json({
    examType: session.examType,
    perRoom: session.examType === "MID" ? 2 : 1,
    invigilators,
    selectedFacultyIds: Array.from(new Set(invigilators.map((item) => item.facultyProfileId))),
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = assignSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError("Invalid invigilator selection.", 400);
  }

  const session = await prisma.examSession.findUnique({
    where: { id },
    include: { sessionRooms: true },
  });

  if (!session) {
    return jsonError("Session not found.", 404);
  }

  const perRoom = session.examType === "MID" ? 2 : 1;
  const roomIds = session.sessionRooms.map((entry) => entry.roomId);

  if (roomIds.length === 0) {
    return jsonError("Select rooms before assigning invigilators.", 400);
  }

  const required = roomIds.length * perRoom;
  if (parsed.data.facultyProfileIds.length < required) {
    return jsonError(`Select at least ${required} faculty for this session.`, 400);
  }

  const shuffledFaculty = shuffle(parsed.data.facultyProfileIds).slice(0, required);
  const assignments: { sessionId: string; roomId: string; facultyProfileId: string }[] = [];

  roomIds.forEach((roomId, index) => {
    for (let offset = 0; offset < perRoom; offset += 1) {
      const facultyIndex = index * perRoom + offset;
      const facultyProfileId = shuffledFaculty[facultyIndex];
      assignments.push({ sessionId: id, roomId, facultyProfileId });
    }
  });

  await prisma.$transaction(async (tx) => {
    await tx.sessionInvigilator.deleteMany({ where: { sessionId: id } });
    await tx.sessionInvigilator.createMany({ data: assignments });
  });

  return NextResponse.json({
    assigned: assignments.length,
    perRoom,
  });
}
