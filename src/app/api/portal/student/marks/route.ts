import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireStudentProfile } from "@/app/api/portal/student/_utils";

export async function GET(request: Request) {
  const result = await requireStudentProfile(request);
  if ("error" in result) {
    return result.error;
  }

  const { searchParams } = new URL(request.url);
  const semesterParam = searchParams.get("semester");
  const parsedSemester = semesterParam ? Number(semesterParam) : undefined;
  const semesterFromQuery = Number.isFinite(parsedSemester) ? parsedSemester : undefined;

  const semesterRows = await prisma.marksRecord.findMany({
    where: { studentId: result.profile.id },
    select: { semester: true },
    distinct: ["semester"],
    orderBy: { semester: "desc" },
  });

  const availableSemesters = semesterRows.map((row) => row.semester).sort((a, b) => b - a);
  const latestSemester = availableSemesters[0] ?? null;
  const activeSemester = semesterFromQuery ?? latestSemester;

  const records = activeSemester
    ? await prisma.marksRecord.findMany({
        where: { studentId: result.profile.id, semester: activeSemester },
        orderBy: [{ subject: "asc" }, { createdAt: "desc" }],
      })
    : [];

  return NextResponse.json({
    availableSemesters,
    latestSemester,
    activeSemester,
    records,
  });
}
