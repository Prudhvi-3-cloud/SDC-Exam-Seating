import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getPortalSessionFromRequest, isFacultySession } from "@/lib/portal-session";

export async function resolveFacultyFromSession(request: Request) {
  const session = getPortalSessionFromRequest(request);
  if (!isFacultySession(session)) {
    return {
      error: NextResponse.json({ error: "Forbidden." }, { status: 403 }),
    };
  }

  const faculty = await prisma.facultyProfile.findUnique({
    where: { userId: session.userId },
    include: {
      user: true,
      department: true,
      sectionAccess: {
        include: {
          section: {
            include: {
              department: true,
            },
          },
        },
      },
    },
  });

  if (!faculty) {
    return {
      error: NextResponse.json({ error: "Faculty profile not found." }, { status: 404 }),
    };
  }

  return { session, faculty };
}

export async function validateSectionAccess(facultyProfileId: string, sectionId: string, year?: number) {
  const access = await prisma.facultySectionAccess.findUnique({
    where: {
      facultyProfileId_sectionId: {
        facultyProfileId,
        sectionId,
      },
    },
    include: {
      section: {
        include: {
          department: true,
        },
      },
    },
  });

  if (!access) {
    return {
      error: NextResponse.json({ error: "Forbidden." }, { status: 403 }),
    };
  }

  if (typeof year === "number" && access.section.year !== year) {
    return {
      error: NextResponse.json({ error: "Section year mismatch." }, { status: 400 }),
    };
  }

  return access;
}

export async function resolveStudentsForFacultySection(
  facultyProfileId: string,
  sectionId: string,
  year: number,
) {
  const access = await validateSectionAccess(facultyProfileId, sectionId, year);
  if ("error" in access) {
    return access;
  }

  const students = await prisma.studentProfile.findMany({
    where: {
      sectionId: access.section.id,
      year: access.section.year,
      departmentId: access.section.departmentId,
    },
    include: {
      user: true,
      department: true,
      section: true,
    },
    orderBy: [{ rollNo: "asc" }],
  });

  return { access, students };
}

