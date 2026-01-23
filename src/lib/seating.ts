import crypto from "crypto";
import type { ExamSession, ExamType, Room, Student } from "@prisma/client";
import prisma from "@/lib/db";

export type SeatPosition = {
  roomId: string;
  block: string;
  roomNo: string;
  benchNo: number;
  seatNo: number;
};

function hashStringToInt(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number) {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let result = Math.imul(t ^ (t >>> 15), t | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededShuffle<T>(items: T[], seed: string): T[] {
  const rng = mulberry32(hashStringToInt(seed));
  const array = [...items];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export function groupByYearDept(students: Student[]): Map<string, Student[]> {
  const groups = new Map<string, Student[]>();
  for (const student of students) {
    const key = `${student.year}-${student.dept}`;
    const bucket = groups.get(key) ?? [];
    bucket.push(student);
    groups.set(key, bucket);
  }
  return groups;
}

export function interleaveRoundRobin(groups: Map<string, Student[]>): Student[] {
  const keys = Array.from(groups.keys()).sort();
  const buckets = keys.map((key) => [...(groups.get(key) ?? [])]);
  const result: Student[] = [];
  let remaining = buckets.reduce((sum, bucket) => sum + bucket.length, 0);

  while (remaining > 0) {
    for (const bucket of buckets) {
      if (bucket.length > 0) {
        result.push(bucket.shift() as Student);
        remaining -= 1;
      }
    }
  }

  return result;
}

export function getSeatPositions(rooms: Room[], examType: ExamType): SeatPosition[] {
  const sorted = [...rooms].sort((a, b) => {
    const blockCompare = a.block.localeCompare(b.block);
    if (blockCompare !== 0) return blockCompare;
    return a.roomNo.localeCompare(b.roomNo, undefined, { numeric: true });
  });

  const positions: SeatPosition[] = [];
  for (const room of sorted) {
    const seatsPerBench = examType === "MID" ? Math.min(2, room.seatsPerBench) : 1;
    for (let benchNo = 1; benchNo <= room.benches; benchNo += 1) {
      for (let seatNo = 1; seatNo <= seatsPerBench; seatNo += 1) {
        positions.push({
          roomId: room.id,
          block: room.block,
          roomNo: room.roomNo,
          benchNo,
          seatNo,
        });
      }
    }
  }

  return positions;
}

export async function generatePlan(sessionId: string, dayIndex: number, version: number) {
  const session = await prisma.examSession.findUnique({
    where: { id: sessionId },
    include: {
      sessionStudents: { include: { student: true } },
      sessionRooms: { include: { room: true } },
    },
  });

  if (!session) {
    throw new Error("Session not found.");
  }

  const students = session.sessionStudents.map((entry) => entry.student);
  const rooms = session.sessionRooms
    .map((entry) => entry.room)
    .filter((room) => room.isActive);

  const totalBenches = rooms.reduce((sum, room) => sum + room.benches, 0);
  const totalSeats = session.examType === "MID" ? totalBenches * 2 : totalBenches;

  if (students.length > totalSeats) {
    const neededBenches =
      session.examType === "MID"
        ? Math.ceil(students.length / 2)
        : students.length;
    throw new Error(
      `Insufficient capacity. Need ${neededBenches} benches, have ${totalBenches}.`,
    );
  }

  const seed = crypto.randomUUID();
  const grouped = groupByYearDept(students);
  const shuffled = new Map<string, Student[]>();

  for (const [key, group] of grouped.entries()) {
    shuffled.set(key, seededShuffle(group, `${seed}-${key}`));
  }

  const orderedStudents = interleaveRoundRobin(shuffled);
  const positions = getSeatPositions(rooms, session.examType).slice(0, students.length);

  return prisma.$transaction(async (tx) => {
    const plan = await tx.seatingPlan.create({
      data: {
        sessionId,
        dayIndex,
        version,
        seed,
      },
    });

    const assignments = orderedStudents.map((student, index) => ({
      planId: plan.id,
      studentId: student.id,
      roomId: positions[index].roomId,
      benchNo: positions[index].benchNo,
      seatNo: positions[index].seatNo,
    }));

    if (assignments.length > 0) {
      await tx.seatingAssignment.createMany({ data: assignments });
    }
    return plan;
  });
}

export type SessionWithSelections = ExamSession & {
  sessionStudents: { student: Student }[];
  sessionRooms: { room: Room }[];
};
