import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase();
  const user = await prisma.portalUser.findUnique({ where: { email: normalizedEmail } });

  if (!user || user.password !== password) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  if (user.isBlocked) {
    return NextResponse.json({ error: "User is blocked." }, { status: 403 });
  }

  return NextResponse.json({
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  });
}
