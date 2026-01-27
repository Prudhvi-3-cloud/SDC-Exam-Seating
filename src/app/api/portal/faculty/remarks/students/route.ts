import { NextResponse } from "next/server";
import { z } from "zod";
import { resolveFacultyFromSession, resolveStudentsForFacultySection } from "@/app/api/portal/faculty/_utils";

export const runtime = "nodejs";

const querySchema = z.object({
  year: z.coerce.number().int().min(1).max(4),
  sectionId: z.string().min(1),
});

export async function GET(request: Request) {
  const facultyResult = await resolveFacultyFromSession(request);
  if ("error" in facultyResult) {
    return facultyResult.error;
  }

  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    year: searchParams.get("year"),
    sectionId: searchParams.get("sectionId"),
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid section query." }, { status: 400 });
  }

  const studentsResult = await resolveStudentsForFacultySection(
    facultyResult.faculty.id,
    parsed.data.sectionId,
    parsed.data.year,
  );

  if ("error" in studentsResult) {
    return studentsResult.error;
  }

  const students = studentsResult.students.map((student) => ({
    id: student.id,
    rollNo: student.rollNo,
    name: student.user.name,
    year: student.year,
    department: {
      id: student.department.id,
      code: student.department.code,
      name: student.department.name,
    },
    section: {
      id: student.section.id,
      name: student.section.name,
      year: student.section.year,
    },
  }));

  return NextResponse.json({
    section: {
      id: studentsResult.access.section.id,
      year: studentsResult.access.section.year,
      name: studentsResult.access.section.name,
      department: studentsResult.access.section.department,
    },
    students,
  });
}

