import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { resolveFacultyFromSession } from "@/app/api/portal/faculty/_utils";

export const runtime = "nodejs";

const studentQuerySchema = z.object({
  studentId: z.string().min(1),
});

const createRemarkSchema = z.object({
  studentId: z.string().min(1),
  text: z.string().trim().min(1).max(1000),
});

export async function GET(request: Request) {
  const facultyResult = await resolveFacultyFromSession(request);
  if ("error" in facultyResult) {
    return facultyResult.error;
  }

  const { searchParams } = new URL(request.url);
  const parsed = studentQuerySchema.safeParse({
    studentId: searchParams.get("studentId"),
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid student query." }, { status: 400 });
  }

  const student = await prisma.studentProfile.findUnique({
    where: { id: parsed.data.studentId },
    select: {
      id: true,
      rollNo: true,
      year: true,
      sectionId: true,
      departmentId: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      department: true,
      section: true,
    },
  });

  if (!student) {
    return NextResponse.json({ error: "Student not found." }, { status: 404 });
  }

  const allowedSectionIds = new Set(
    facultyResult.faculty.sectionAccess.map((access) => access.sectionId),
  );
  if (!allowedSectionIds.has(student.sectionId)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const remarks = await prisma.remark.findMany({
    where: { studentId: student.id },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });

  return NextResponse.json({
    student: {
      id: student.id,
      name: student.user.name,
      email: student.user.email,
      rollNo: student.rollNo,
      year: student.year,
      department: student.department,
      section: student.section,
    },
    remarks,
  });
}

export async function POST(request: Request) {
  const facultyResult = await resolveFacultyFromSession(request);
  if ("error" in facultyResult) {
    return facultyResult.error;
  }

  const body = await request.json().catch(() => null);
  const parsed = createRemarkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid remark payload." }, { status: 400 });
  }

  const student = await prisma.studentProfile.findUnique({
    where: { id: parsed.data.studentId },
    select: {
      id: true,
      sectionId: true,
    },
  });

  if (!student) {
    return NextResponse.json({ error: "Student not found." }, { status: 404 });
  }

  const allowedSectionIds = new Set(
    facultyResult.faculty.sectionAccess.map((access) => access.sectionId),
  );
  if (!allowedSectionIds.has(student.sectionId)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const created = await prisma.remark.create({
    data: {
      studentId: student.id,
      text: parsed.data.text,
      byFacultyName: facultyResult.faculty.user.name,
    },
  });

  return NextResponse.json({ remark: created }, { status: 201 });
}

