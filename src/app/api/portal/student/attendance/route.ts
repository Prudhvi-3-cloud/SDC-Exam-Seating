import { NextResponse } from "next/server";
import { AttendanceStatus } from "@prisma/client";
import prisma from "@/lib/db";
import { requireStudentProfile } from "@/app/api/portal/student/_utils";

export async function GET(request: Request) {
  const result = await requireStudentProfile(request);
  if ("error" in result) {
    return result.error;
  }

  const records = await prisma.attendanceRecord.findMany({
    where: { studentId: result.profile.id },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });

  const totalCount = records.length;
  const presentCount = records.filter((record) => record.status === AttendanceStatus.PRESENT).length;
  const absentCount = totalCount - presentCount;
  const percentage = totalCount === 0 ? 0 : Math.round((presentCount / totalCount) * 100);

  return NextResponse.json({
    summary: {
      totalCount,
      presentCount,
      absentCount,
      percentage,
    },
    records,
  });
}
