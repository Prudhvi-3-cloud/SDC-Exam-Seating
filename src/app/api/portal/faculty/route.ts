import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";

const createSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(1),
  departmentCode: z.string().min(2),
  allowedSections: z.array(z.string().min(3)).min(1),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const departmentCode = searchParams.get("departmentCode") || undefined;
  const q = searchParams.get("q") || undefined;

  const faculty = await prisma.facultyProfile.findMany({
    where: {
      ...(departmentCode ? { department: { code: departmentCode } } : {}),
      ...(q
        ? {
            OR: [
              { user: { name: { contains: q, mode: "insensitive" } } },
              { user: { email: { contains: q, mode: "insensitive" } } },
            ],
          }
        : {}),
    },
    include: {
      user: true,
      department: true,
      sectionAccess: true,
    },
    orderBy: { user: { name: "asc" } },
  });

  return NextResponse.json(faculty);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid faculty data." }, { status: 400 });
  }

  const { name, email, password, departmentCode, allowedSections } = parsed.data;
  const normalizedEmail = email.toLowerCase();
  const department = await prisma.department.findUnique({ where: { code: departmentCode } });
  if (!department) {
    return NextResponse.json({ error: "Department not found." }, { status: 404 });
  }

  const sections = await prisma.section.findMany({ where: { departmentId: department.id } });
  const sectionMap = new Map(sections.map((section) => [`${section.year}-${section.name}`, section]));
  const accessRows = allowedSections
    .map((value) => {
      const section = sectionMap.get(value);
      if (!section) {
        return null;
      }
      return { sectionId: section.id };
    })
    .filter(Boolean) as { sectionId: string }[];

  if (!accessRows.length) {
    return NextResponse.json({ error: "No valid sections selected." }, { status: 400 });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.portalUser.create({
        data: {
          name,
          email: normalizedEmail,
          password,
          role: "FACULTY",
        },
      });

      const profile = await tx.facultyProfile.create({
        data: {
          userId: user.id,
          departmentId: department.id,
        },
      });

      await tx.facultySectionAccess.createMany({
        data: accessRows.map((row) => ({
          facultyProfileId: profile.id,
          sectionId: row.sectionId,
        })),
      });

      return tx.facultyProfile.findUnique({
        where: { id: profile.id },
        include: { user: true, department: true, sectionAccess: true },
      });
    });

    return NextResponse.json(result, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Email already exists." }, { status: 409 });
  }
}
