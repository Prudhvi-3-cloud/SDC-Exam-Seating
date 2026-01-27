import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { jsonError } from "@/app/api/_shared";

const selectionSchema = z
  .object({
    studentIds: z.array(z.string().min(1)).optional(),
    portalStudentIds: z.array(z.string().min(1)).optional(),
  })
  .refine((data) => (data.studentIds?.length ?? 0) > 0 || (data.portalStudentIds?.length ?? 0) > 0, {
    message: "Missing student selection.",
  });

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => null);
    const parsed = selectionSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError("Invalid student selection.");
    }

    const session = await prisma.examSession.findUnique({
      where: { id },
    });

    if (!session) {
      return jsonError("Session not found.", 404);
    }

    let studentIds = parsed.data.studentIds ?? [];

    // Resolve portal student selections to canonical Student records first.
    // This avoids interactive transactions that can fail on some deployments.
    if (parsed.data.portalStudentIds?.length) {
      const portalStudents = await prisma.studentProfile.findMany({
        where: { id: { in: parsed.data.portalStudentIds } },
        include: { user: true, department: true },
      });

      const upserted = await Promise.all(
        portalStudents.map((profile) =>
          prisma.student.upsert({
            where: { rollNo: profile.rollNo },
            update: {
              name: profile.user.name,
              dept: profile.department.code,
              year: profile.year,
              email: profile.user.email,
            },
            create: {
              rollNo: profile.rollNo,
              name: profile.user.name,
              dept: profile.department.code,
              year: profile.year,
              email: profile.user.email,
            },
          })
        )
      );

      studentIds = upserted.map((student) => student.id);
    }

    // Use a batched transaction (non-interactive) for the session mapping.
    const operations = [
      prisma.sessionStudent.deleteMany({ where: { sessionId: session.id } }),
    ];

    if (studentIds.length > 0) {
      operations.push(
        prisma.sessionStudent.createMany({
          data: studentIds.map((studentId) => ({
            sessionId: session.id,
            studentId,
          })),
          skipDuplicates: true,
        })
      );
    }

    await prisma.$transaction(operations);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to save session students", error);
    const message = error instanceof Error ? error.message : "Unexpected error.";
    return jsonError(message, 500);
  }
}
