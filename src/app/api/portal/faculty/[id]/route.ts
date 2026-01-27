import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pathId = new URL(request.url).pathname.split("/").pop();
    const facultyId = id ?? pathId ?? "";
    const faculty = await prisma.facultyProfile.findUnique({
      where: { id: facultyId },
      include: {
        user: true,
        department: true,
        sectionAccess: { include: { section: true } },
      },
    });

    if (!faculty) {
      return NextResponse.json({ error: "Faculty not found." }, { status: 404 });
    }

    return NextResponse.json(faculty);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
