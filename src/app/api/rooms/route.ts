import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  const rooms = await prisma.room.findMany({
    where: { isActive: true },
    orderBy: [{ block: "asc" }, { roomNo: "asc" }],
  });

  return NextResponse.json({ rooms });
}
