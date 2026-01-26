import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";

const createSchema = z.object({
  rollNo: z.string().min(2),
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(1),
  year: z.number().int().min(1).max(4),
  departmentCode: z.string().min(2),
  sectionName: z.string().min(1).max(2),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const yearParam = searchParams.get("year");
  const departmentCode = searchParams.get("departmentCode") || undefined;
  const sectionName = searchParams.get("sectionName") || undefined;
  const q = searchParams.get("q") || undefined;

  const yearNumber = yearParam ? Number(yearParam) : undefined;
  const year = Number.isFinite(yearNumber) ? yearNumber : undefined;

  const students = await prisma.studentProfile.findMany({
    where: {
      ...(year ? { year } : {}),
      ...(departmentCode ? { department: { code: departmentCode } } : {}),
      ...(sectionName ? { section: { name: sectionName } } : {}),
      ...(q
        ? {
            OR: [
              { rollNo: { contains: q, mode: "insensitive" } },
              { user: { name: { contains: q, mode: "insensitive" } } },
              { user: { email: { contains: q, mode: "insensitive" } } },
            ],
          }
        : {}),
    },
    include: {
      user: true,
      department: true,
      section: true,
    },
    orderBy: [{ year: "asc" }, { rollNo: "asc" }],
  });

  return NextResponse.json(students);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid student data." }, { status: 400 });
  }

  const { rollNo, name, email, password, year, departmentCode, sectionName } = parsed.data;
  const normalizedEmail = email.toLowerCase();
  const department = await prisma.department.findUnique({ where: { code: departmentCode } });
  if (!department) {
    return NextResponse.json({ error: "Department not found." }, { status: 404 });
  }

  const section = await prisma.section.findFirst({
    where: { departmentId: department.id, year, name: sectionName },
  });

  if (!section) {
    return NextResponse.json({ error: "Section not found." }, { status: 404 });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.portalUser.create({
        data: {
          email: normalizedEmail,
          password,
          name,
          role: "STUDENT",
        },
      });

      const profile = await tx.studentProfile.create({
        data: {
          userId: user.id,
          rollNo,
          year,
          departmentId: department.id,
          sectionId: section.id,
        },
        include: { user: true, department: true, section: true },
      });

      return profile;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Email or roll number already exists." }, { status: 409 });
  }
}
