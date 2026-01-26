import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";

const rowSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(1),
  department: z.string().min(2),
  allowedSections: z.string().min(3),
});

const bulkSchema = z.object({
  rows: z.array(rowSchema).min(1),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = bulkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid bulk payload." }, { status: 400 });
  }

  const { rows } = parsed.data;
  const emails = rows.map((row) => row.email.toLowerCase());
  const existingUsers = await prisma.portalUser.findMany({
    where: { email: { in: emails } },
    select: { email: true },
  });

  if (existingUsers.length) {
    return NextResponse.json(
      { error: "Some faculty already exist.", duplicates: existingUsers.map((u) => u.email) },
      { status: 409 }
    );
  }

  const departmentCodes = Array.from(new Set(rows.map((row) => row.department)));
  const departments = await prisma.department.findMany({ where: { code: { in: departmentCodes } } });
  const deptMap = new Map(departments.map((dept) => [dept.code, dept]));
  const sectionRows = await prisma.section.findMany({
    where: { departmentId: { in: departments.map((dept) => dept.id) } },
  });
  const sectionMap = new Map(
    sectionRows.map((section) => [`${section.departmentId}-${section.year}-${section.name}`, section])
  );

  const validationErrors: string[] = [];
  rows.forEach((row) => {
    const dept = deptMap.get(row.department);
    if (!dept) {
      validationErrors.push(`Department not found: ${row.department}`);
      return;
    }

    const sections = row.allowedSections.split(",").map((value) => value.trim());
    if (!sections.length) {
      validationErrors.push(`No sections for ${row.email}`);
    }

    sections.forEach((entry) => {
      const [yearRaw, nameRaw] = entry.split("-");
      const year = Number(yearRaw);
      const name = nameRaw?.toUpperCase();
      if (!year || year < 1 || year > 4 || !name) {
        validationErrors.push(`Invalid section ${entry} for ${row.email}`);
        return;
      }
      const section = sectionMap.get(`${dept.id}-${year}-${name}`);
      if (!section) {
        validationErrors.push(`Section not found ${entry} for ${row.email}`);
      }
    });
  });

  if (validationErrors.length) {
    return NextResponse.json({ error: "Validation errors", details: validationErrors }, { status: 400 });
  }

  await prisma.portalUser.createMany({
    data: rows.map((row) => ({
      name: row.name,
      email: row.email.toLowerCase(),
      password: row.password,
      role: "FACULTY" as const,
    })),
  });

  const createdUsers = await prisma.portalUser.findMany({
    where: { email: { in: emails } },
  });
  const userMap = new Map(createdUsers.map((user) => [user.email.toLowerCase(), user]));

  const profilesData = rows.map((row) => ({
    userId: userMap.get(row.email.toLowerCase())!.id,
    departmentId: deptMap.get(row.department)!.id,
  }));

  await prisma.facultyProfile.createMany({ data: profilesData });

  const createdProfiles = await prisma.facultyProfile.findMany({
    where: { userId: { in: createdUsers.map((user) => user.id) } },
  });
  const profileMap = new Map(createdProfiles.map((profile) => [profile.userId, profile]));

  const accessRows = rows.flatMap((row) => {
    const dept = deptMap.get(row.department)!;
    const profile = profileMap.get(userMap.get(row.email.toLowerCase())!.id)!;
    const sections = row.allowedSections.split(",").map((value) => value.trim());
    return sections.map((entry) => {
      const [yearRaw, nameRaw] = entry.split("-");
      const section = sectionMap.get(`${dept.id}-${Number(yearRaw)}-${nameRaw.toUpperCase()}`)!;
      return {
        facultyProfileId: profile.id,
        sectionId: section.id,
      };
    });
  });

  if (accessRows.length) {
    await prisma.facultySectionAccess.createMany({ data: accessRows });
  }

  return NextResponse.json({ inserted: rows.length }, { status: 201 });
}
