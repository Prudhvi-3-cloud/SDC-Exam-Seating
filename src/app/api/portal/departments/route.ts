import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";

const departmentSchema = z.object({
  code: z.string().min(2).max(10),
  name: z.string().min(2).max(50),
});

export async function GET() {
  const departments = await prisma.department.findMany({
    orderBy: { code: "asc" },
    include: { sections: true },
  });
  return NextResponse.json(departments);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = departmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid department data." }, { status: 400 });
  }

  const { code, name } = parsed.data;
  try {
    const created = await prisma.$transaction(async (tx) => {
      const department = await tx.department.create({
        data: { code: code.toUpperCase(), name },
      });
      await tx.section.createMany({
        data: [1, 2, 3, 4].flatMap((year) =>
          ["A", "B", "C"].map((section) => ({
            year,
            name: section,
            departmentId: department.id,
          }))
        ),
      });
      return department;
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Department code must be unique." }, { status: 409 });
  }
}
