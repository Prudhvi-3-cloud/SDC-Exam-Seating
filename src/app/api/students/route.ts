import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { jsonError } from "@/app/api/_shared";

const querySchema = z.object({
  dept: z.string().min(1).optional(),
  year: z.coerce.number().int().min(1).max(4).optional(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    dept: searchParams.get("dept") || undefined,
    year: searchParams.get("year") || undefined,
  });

  if (!parsed.success) {
    return jsonError("Invalid student filter.");
  }

  const students = await prisma.student.findMany({
    where: {
      dept: parsed.data.dept,
      year: parsed.data.year,
    },
    orderBy: [{ year: "asc" }, { dept: "asc" }, { rollNo: "asc" }],
  });

  return NextResponse.json({ students });
}
