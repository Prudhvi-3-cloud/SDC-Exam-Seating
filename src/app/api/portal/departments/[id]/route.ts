import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";

const updateSchema = z
  .object({
    name: z.string().min(2).max(50).optional(),
    code: z.string().min(2).max(10).optional(),
  })
  .refine((data) => data.name || data.code, {
    message: "Missing update fields.",
  });

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid update." }, { status: 400 });
  }

  const pathId = new URL(request.url).pathname.split("/").pop();
  const departmentId = params.id ?? pathId ?? "";

  const data: { name?: string; code?: string } = {};
  if (parsed.data.name) {
    data.name = parsed.data.name;
  }
  if (parsed.data.code) {
    data.code = parsed.data.code.toUpperCase();
  }

  try {
    const updated = await prisma.department.update({
      where: { id: departmentId },
      data,
    });
    return NextResponse.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update department.";
    const status = message.toLowerCase().includes("unique") ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const pathId = new URL(request.url).pathname.split("/").pop();
  const departmentId = params.id ?? pathId ?? "";
  const studentCount = await prisma.studentProfile.count({ where: { departmentId } });
  const facultyCount = await prisma.facultyProfile.count({ where: { departmentId } });

  if (studentCount > 0 || facultyCount > 0) {
    return NextResponse.json(
      { error: "Cannot delete department with linked sections or users." },
      { status: 409 }
    );
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.section.deleteMany({ where: { departmentId } });
      await tx.department.delete({ where: { id: departmentId } });
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Department not found." }, { status: 404 });
  }
}
