import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import prisma from "@/lib/db";
import { requireStudentProfile } from "@/app/api/portal/student/_utils";

const profilePatchSchema = z.object({
  phone: z.string().trim().min(7).max(20).optional().or(z.literal("")),
  address: z.string().trim().min(5).max(200).optional().or(z.literal("")),
});

type StudentProfileWithRelations = Prisma.StudentProfileGetPayload<{
  include: { user: true; department: true; section: true };
}>;

function toProfileResponse(profile: StudentProfileWithRelations) {
  return {
    id: profile.id,
    userId: profile.userId,
    name: profile.user.name,
    email: profile.user.email,
    rollNo: profile.rollNo,
    year: profile.year,
    department: profile.department,
    section: profile.section,
    phone: profile.phone,
    address: profile.address,
  };
}

export async function GET(request: Request) {
  const result = await requireStudentProfile(request);
  if ("error" in result) {
    return result.error;
  }

  return NextResponse.json(toProfileResponse(result.profile));
}

export async function PATCH(request: Request) {
  const result = await requireStudentProfile(request);
  if ("error" in result) {
    return result.error;
  }

  const body = await request.json().catch(() => null);
  const parsed = profilePatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid profile update." }, { status: 400 });
  }

  const phoneValue = parsed.data.phone === "" ? null : parsed.data.phone;
  const addressValue = parsed.data.address === "" ? null : parsed.data.address;

  const updated = await prisma.studentProfile.update({
    where: { id: result.profile.id },
    data: {
      ...(phoneValue !== undefined ? { phone: phoneValue } : {}),
      ...(addressValue !== undefined ? { address: addressValue } : {}),
    },
    include: {
      user: true,
      department: true,
      section: true,
    },
  });

  return NextResponse.json(toProfileResponse(updated));
}
