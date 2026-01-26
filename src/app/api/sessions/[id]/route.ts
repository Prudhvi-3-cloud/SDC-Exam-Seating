import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { jsonError } from "@/app/api/_shared";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await prisma.examSession.findUnique({
    where: { id },
    include: {
      sessionStudents: true,
      sessionRooms: true,
    },
  });

  if (!session) {
    return jsonError("Session not found.", 404);
  }

  const legacyStudentIds = session.sessionStudents.map((entry) => entry.studentId);
  let selectedPortalStudentIds: string[] = [];
  if (legacyStudentIds.length) {
    const legacyStudents = await prisma.student.findMany({
      where: { id: { in: legacyStudentIds } },
      select: { rollNo: true },
    });
    const rollNos = legacyStudents.map((student) => student.rollNo);
    const portalProfiles = await prisma.studentProfile.findMany({
      where: { rollNo: { in: rollNos } },
      select: { id: true },
    });
    selectedPortalStudentIds = portalProfiles.map((profile) => profile.id);
  }

  return NextResponse.json({
    session: {
      id: session.id,
      examType: session.examType,
      daysCount: session.daysCount,
      createdAt: session.createdAt,
    },
    studentCount: session.sessionStudents.length,
    roomCount: session.sessionRooms.length,
    selectedStudentIds: legacyStudentIds,
    selectedPortalStudentIds,
    selectedRoomIds: session.sessionRooms.map((entry) => entry.roomId),
  });
}
