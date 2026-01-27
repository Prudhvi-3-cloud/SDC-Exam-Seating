import { AttendanceStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireStudentProfile } from "@/app/api/portal/student/_utils";

export async function GET(request: Request) {
  const result = await requireStudentProfile(request);
  if ("error" in result) {
    return result.error;
  }

  const studentId = result.profile.id;

  const [attendanceTotal, attendancePresent, feesRecord, remarksCount, latestMarksRow] =
    await Promise.all([
      prisma.attendanceRecord.count({ where: { studentId } }),
      prisma.attendanceRecord.count({ where: { studentId, status: AttendanceStatus.PRESENT } }),
      prisma.feesRecord.findUnique({ where: { studentId } }),
      prisma.remark.count({ where: { studentId } }),
      prisma.marksRecord.findFirst({ where: { studentId }, orderBy: { semester: "desc" } }),
    ]);

  const attendancePercentage = attendanceTotal === 0 ? 0 : Math.round((attendancePresent / attendanceTotal) * 100);
  const latestSemester = latestMarksRow?.semester ?? null;

  const latestSemesterCount = latestSemester
    ? await prisma.marksRecord.count({ where: { studentId, semester: latestSemester } })
    : 0;

  return NextResponse.json({
    student: {
      id: result.profile.id,
      rollNo: result.profile.rollNo,
      year: result.profile.year,
      department: result.profile.department,
      section: result.profile.section,
      name: result.profile.user.name,
      email: result.profile.user.email,
    },
    attendance: {
      total: attendanceTotal,
      present: attendancePresent,
      percentage: attendancePercentage,
    },
    fees: {
      dueAmount: feesRecord?.dueAmount ?? 0,
      totalAmount: feesRecord?.totalAmount ?? 0,
      paidAmount: feesRecord?.paidAmount ?? 0,
      lastUpdated: feesRecord?.lastUpdated ?? null,
    },
    marks: {
      latestSemester,
      latestSemesterCount,
    },
    remarks: {
      count: remarksCount,
    },
  });
}
