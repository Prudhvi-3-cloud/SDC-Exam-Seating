import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";

const rowSchema = z.object({
  rollNo: z.string().min(2),
  name: z.string().min(2),
  email: z.string().email(),
  year: z.number().int().min(1).max(4),
  department: z.string().min(2),
  section: z.string().min(1).max(2),
  password: z.string().min(1),
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
  const duplicateEmails = new Set<string>();
  const duplicateRolls = new Set<string>();
  const seenEmails = new Set<string>();
  const seenRolls = new Set<string>();

  rows.forEach((row) => {
    const emailKey = row.email.toLowerCase();
    if (seenEmails.has(emailKey)) {
      duplicateEmails.add(row.email);
    }
    seenEmails.add(emailKey);

    const rollKey = row.rollNo.toLowerCase();
    if (seenRolls.has(rollKey)) {
      duplicateRolls.add(row.rollNo);
    }
    seenRolls.add(rollKey);
  });

  if (duplicateEmails.size || duplicateRolls.size) {
    return NextResponse.json(
      {
        error: "Duplicate emails or roll numbers in upload.",
        duplicates: {
          emails: Array.from(duplicateEmails),
          rollNos: Array.from(duplicateRolls),
        },
      },
      { status: 400 }
    );
  }

  const departmentCodes = Array.from(new Set(rows.map((row) => row.department)));
  const departments = await prisma.department.findMany({
    where: { code: { in: departmentCodes } },
  });
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
    const section = sectionMap.get(`${dept.id}-${row.year}-${row.section}`);
    if (!section) {
      validationErrors.push(
        `Section not found: ${row.department} ${row.year}-${row.section}`
      );
    }
  });

  if (validationErrors.length) {
    return NextResponse.json({ error: "Validation errors", details: validationErrors }, { status: 400 });
  }

  const normalizedEmails = rows.map((row) => row.email.toLowerCase());
  const existingUsers = await prisma.portalUser.findMany({
    where: { email: { in: normalizedEmails } },
    select: { email: true },
  });
  const existingRolls = await prisma.studentProfile.findMany({
    where: { rollNo: { in: rows.map((row) => row.rollNo) } },
    select: { rollNo: true },
  });

  if (existingUsers.length || existingRolls.length) {
    return NextResponse.json(
      {
        error: "Some rows already exist.",
        duplicates: {
          emails: existingUsers.map((entry) => entry.email),
          rollNos: existingRolls.map((entry) => entry.rollNo),
        },
      },
      { status: 409 }
    );
  }

  const portalUsersData = rows.map((row) => ({
    email: row.email.toLowerCase(),
    password: row.password,
    name: row.name,
    role: "STUDENT" as const,
  }));

  await prisma.portalUser.createMany({ data: portalUsersData });

  const createdUsers = await prisma.portalUser.findMany({
    where: { email: { in: normalizedEmails } },
  });
  const userMap = new Map(createdUsers.map((user) => [user.email.toLowerCase(), user]));

  const profileData = rows.map((row) => {
    const user = userMap.get(row.email.toLowerCase());
    const dept = deptMap.get(row.department)!;
    const section = sectionMap.get(`${dept.id}-${row.year}-${row.section}`)!;
    return {
      userId: user!.id,
      rollNo: row.rollNo,
      year: row.year,
      departmentId: dept.id,
      sectionId: section.id,
    };
  });

  await prisma.studentProfile.createMany({ data: profileData });

  return NextResponse.json({ inserted: rows.length }, { status: 201 });
}
