import { NextResponse } from "next/server";
import { resolveFacultyFromSession } from "@/app/api/portal/faculty/_utils";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const result = await resolveFacultyFromSession(request);
  if ("error" in result) {
    return result.error;
  }

  const allowedSections = result.faculty.sectionAccess
    .map((access) => access.section)
    .sort((a, b) => a.year - b.year || a.name.localeCompare(b.name))
    .map((section) => ({
      id: section.id,
      year: section.year,
      name: section.name,
      department: {
        id: section.department.id,
        code: section.department.code,
        name: section.department.name,
      },
    }));

  return NextResponse.json({
    faculty: {
      id: result.faculty.id,
      name: result.faculty.user.name,
      email: result.faculty.user.email,
      department: result.faculty.department,
      allowedSections,
    },
  });
}

