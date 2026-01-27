import { DayOfWeek } from "@prisma/client";
import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireStudentProfile } from "@/app/api/portal/student/_utils";

const dayOrder: DayOfWeek[] = [
  DayOfWeek.MONDAY,
  DayOfWeek.TUESDAY,
  DayOfWeek.WEDNESDAY,
  DayOfWeek.THURSDAY,
  DayOfWeek.FRIDAY,
  DayOfWeek.SATURDAY,
];

const dayRank = new Map(dayOrder.map((day, index) => [day, index]));

export async function GET(request: Request) {
  const result = await requireStudentProfile(request);
  if ("error" in result) {
    return result.error;
  }

  const entries = await prisma.timetableEntry.findMany({
    where: {
      departmentId: result.profile.departmentId,
      year: result.profile.year,
    },
  });

  const sortedEntries = [...entries].sort((a, b) => {
    const dayDiff = (dayRank.get(a.dayOfWeek) ?? 0) - (dayRank.get(b.dayOfWeek) ?? 0);
    if (dayDiff !== 0) {
      return dayDiff;
    }
    return a.slot.localeCompare(b.slot);
  });

  const groupedByDay = dayOrder.map((day) => ({
    day,
    entries: sortedEntries.filter((entry) => entry.dayOfWeek === day),
  }));

  return NextResponse.json({
    year: result.profile.year,
    departmentId: result.profile.departmentId,
    groupedByDay,
    entries: sortedEntries,
  });
}
