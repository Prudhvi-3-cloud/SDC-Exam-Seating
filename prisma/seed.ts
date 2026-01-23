import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const departments = [
  { name: "CSE", code: "05" },
  { name: "CSM", code: "66" },
  { name: "ECE", code: "04" },
  { name: "CIVIL", code: "01" },
];

const roomConfigs = [
  { block: "A", roomNo: "101", benches: 24 },
  { block: "A", roomNo: "102", benches: 26 },
  { block: "A", roomNo: "103", benches: 22 },
  { block: "A", roomNo: "104", benches: 28 },
  { block: "A", roomNo: "105", benches: 20 },
  { block: "A", roomNo: "106", benches: 30 },
  { block: "B", roomNo: "201", benches: 24 },
  { block: "B", roomNo: "202", benches: 26 },
  { block: "B", roomNo: "203", benches: 22 },
  { block: "B", roomNo: "204", benches: 28 },
  { block: "B", roomNo: "205", benches: 20 },
  { block: "B", roomNo: "206", benches: 30 },
];

async function main() {
  await prisma.outboxEmail.deleteMany();
  await prisma.seatingAssignment.deleteMany();
  await prisma.seatingPlan.deleteMany();
  await prisma.sessionStudent.deleteMany();
  await prisma.sessionRoom.deleteMany();
  await prisma.examSession.deleteMany();
  await prisma.student.deleteMany();
  await prisma.room.deleteMany();

  const students = [] as {
    rollNo: string;
    name: string;
    dept: string;
    year: number;
    email: string;
  }[];

  for (let year = 1; year <= 4; year += 1) {
    for (const dept of departments) {
      for (let i = 1; i <= 15; i += 1) {
        const rollNo = `21R0${year}A${dept.code}${String(i).padStart(2, "0")}`;
        students.push({
          rollNo,
          name: `Student ${rollNo}`,
          dept: dept.name,
          year,
          email: `${rollNo.toLowerCase()}@srit.ac.in`,
        });
      }
    }
  }

  await prisma.student.createMany({ data: students });
  await prisma.room.createMany({
    data: roomConfigs.map((room) => ({
      ...room,
      seatsPerBench: 2,
      isActive: true,
    })),
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });