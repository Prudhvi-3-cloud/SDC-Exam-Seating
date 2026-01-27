import { AttendanceStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { resolveFacultyFromSession } from "@/app/api/portal/faculty/_utils";

export const runtime = "nodejs";

const attendanceSchema = z.object({
  date: z.string().min(1),
  records: z
    .array(
      z.object({
        studentId: z.string().min(1),
        status: z.nativeEnum(AttendanceStatus),
      }),
    )
    .min(1),
});

const ATTENDANCE_SUBJECT = "Class Attendance";

function toDayRange(inputDate: Date) {
  const start = new Date(inputDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(inputDate);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function toRecordDate(inputDate: Date) {
  const normalized = new Date(inputDate);
  normalized.setHours(12, 0, 0, 0);
  return normalized;
}

export async function POST(request: Request) {
  const facultyResult = await resolveFacultyFromSession(request);
  if ("error" in facultyResult) {
    return facultyResult.error;
  }

  const body = await request.json().catch(() => null);
  const parsed = attendanceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid attendance payload." }, { status: 400 });
  }

  const parsedDate = new Date(parsed.data.date);
  if (Number.isNaN(parsedDate.getTime())) {
    return NextResponse.json({ error: "Invalid attendance date." }, { status: 400 });
  }

  const statusByStudentId = new Map<string, AttendanceStatus>();
  parsed.data.records.forEach((record) => {
    statusByStudentId.set(record.studentId, record.status);
  });

  const studentIds = Array.from(statusByStudentId.keys());
  const studentProfiles = await prisma.studentProfile.findMany({
    where: { id: { in: studentIds } },
    select: {
      id: true,
      sectionId: true,
      year: true,
      departmentId: true,
    },
  });

  if (studentProfiles.length !== studentIds.length) {
    return NextResponse.json({ error: "One or more students were not found." }, { status: 404 });
  }

  const allowedSectionIds = new Set(
    facultyResult.faculty.sectionAccess.map((access) => access.sectionId),
  );

  const forbiddenStudent = studentProfiles.find((profile) => !allowedSectionIds.has(profile.sectionId));
  if (forbiddenStudent) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { start, end } = toDayRange(parsedDate);
  const recordDate = toRecordDate(parsedDate);

  await prisma.$transaction(async (tx) => {
    await tx.attendanceRecord.deleteMany({
      where: {
        studentId: { in: studentIds },
        date: {
          gte: start,
          lte: end,
        },
      },
    });

    await tx.attendanceRecord.createMany({
      data: studentProfiles.map((profile) => ({
        studentId: profile.id,
        date: recordDate,
        subject: ATTENDANCE_SUBJECT,
        status: statusByStudentId.get(profile.id) ?? AttendanceStatus.PRESENT,
      })),
    });
  });

  return NextResponse.json({
    savedCount: studentIds.length,
    date: recordDate,
  });
}

