import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireStudentProfile } from "@/app/api/portal/student/_utils";

export async function GET(request: Request) {
  const result = await requireStudentProfile(request);
  if ("error" in result) {
    return result.error;
  }

  const remarks = await prisma.remark.findMany({
    where: { studentId: result.profile.id },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });

  return NextResponse.json({ remarks, count: remarks.length });
}
