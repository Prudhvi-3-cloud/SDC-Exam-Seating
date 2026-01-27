import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getPortalSessionFromRequest, isStudentSession } from "@/lib/portal-session";

export async function requireStudentProfile(request: Request) {
  const session = getPortalSessionFromRequest(request);
  if (!isStudentSession(session)) {
    return {
      error: NextResponse.json({ error: "Forbidden." }, { status: 403 }),
    };
  }

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: session.userId },
    include: {
      user: true,
      department: true,
      section: true,
    },
  });

  if (!profile) {
    return {
      error: NextResponse.json({ error: "Student profile not found." }, { status: 404 }),
    };
  }

  return { session, profile };
}
