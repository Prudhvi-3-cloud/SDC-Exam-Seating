import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireStudentProfile } from "@/app/api/portal/student/_utils";

export async function GET(request: Request) {
  const result = await requireStudentProfile(request);
  if ("error" in result) {
    return result.error;
  }

  const record = await prisma.feesRecord.findUnique({
    where: { studentId: result.profile.id },
  });

  return NextResponse.json({ record });
}
