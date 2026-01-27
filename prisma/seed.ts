import { AttendanceStatus, DayOfWeek, PrismaClient, PortalRole } from "@prisma/client";

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

const portalDepartments = ["CSE", "ECE", "MECH", "CIVIL", "EEE", "CSM"] as const;
const sectionNames = ["A", "B", "C"] as const;
const years = [1, 2, 3, 4];

async function seedPortal() {
  await prisma.attendanceRecord.deleteMany();
  await prisma.marksRecord.deleteMany();
  await prisma.feesRecord.deleteMany();
  await prisma.remark.deleteMany();
  await prisma.timetableEntry.deleteMany();
  await prisma.facultySectionAccess.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.facultyProfile.deleteMany();
  await prisma.portalUser.deleteMany();
  await prisma.section.deleteMany();
  await prisma.department.deleteMany();

  await prisma.department.createMany({
    data: portalDepartments.map((code) => ({ code, name: code })),
  });

  const portalDeptRows = await prisma.department.findMany();
  const deptByCode = new Map(portalDeptRows.map((dept) => [dept.code, dept]));

  const sectionRows = portalDeptRows.flatMap((dept) =>
    years.flatMap((year) =>
      sectionNames.map((name) => ({
        year,
        name,
        departmentId: dept.id,
      }))
    )
  );

  await prisma.section.createMany({ data: sectionRows });
  const sections = await prisma.section.findMany();
  const sectionKey = (departmentId: string, year: number, name: string) =>
    `${departmentId}-${year}-${name}`;
  const sectionMap = new Map(sections.map((section) => [sectionKey(section.departmentId, section.year, section.name), section]));

  const timetableDays = [
    DayOfWeek.MONDAY,
    DayOfWeek.TUESDAY,
    DayOfWeek.WEDNESDAY,
    DayOfWeek.THURSDAY,
    DayOfWeek.FRIDAY,
  ];
  const timetableSlots = ["9:00-10:00", "10:00-11:00", "11:15-12:15", "1:00-2:00"];
  const baseSubjects = [
    "Mathematics",
    "Data Structures",
    "Digital Systems",
    "Operating Systems",
    "DBMS",
    "Networks",
    "AI",
    "Software Engineering",
  ];

  const timetableEntries = portalDeptRows.flatMap((dept) =>
    years.flatMap((year) =>
      timetableDays.flatMap((day, dayIndex) =>
        timetableSlots.map((slot, slotIndex) => {
          const subjectIndex = (dayIndex * timetableSlots.length + slotIndex + year) % baseSubjects.length;
          const subject = `${baseSubjects[subjectIndex]} (${dept.code}-${year})`;
          return {
            year,
            departmentId: dept.id,
            dayOfWeek: day,
            slot,
            subject,
            facultyName: `Prof. ${dept.code} ${year}${slotIndex + 1}`,
            room: `${dept.code}-${year}0${slotIndex + 1}`,
          };
        })
      )
    )
  );

  if (timetableEntries.length) {
    await prisma.timetableEntry.createMany({ data: timetableEntries });
  }

  const adminUsers = [
    { email: "principal.admin@srit.ac.in", password: "admin@123", name: "Dr. Rao" },
    { email: "examcell.admin@srit.ac.in", password: "admin@234", name: "Ms. Priya" },
    { email: "it.admin@srit.ac.in", password: "admin@345", name: "Mr. Rakesh" },
  ];

  await prisma.portalUser.createMany({
    data: adminUsers.map((admin) => ({
      ...admin,
      role: PortalRole.ADMIN,
    })),
  });

  const facultyUsers: { email: string; password: string; name: string; role: PortalRole }[] = [];
  const facultyMeta = new Map<string, { departmentCode: string; index: number }>();

  portalDepartments.forEach((deptCode) => {
    for (let i = 1; i <= 5; i += 1) {
      const email = `${deptCode.toLowerCase()}faculty${i}@srit.ac.in`;
      facultyUsers.push({
        email,
        password: `faculty@${deptCode.toLowerCase()}${i}`,
        name: `Prof. ${deptCode} Faculty ${i}`,
        role: PortalRole.FACULTY,
      });
      facultyMeta.set(email, { departmentCode: deptCode, index: i });
    }
  });

  await prisma.portalUser.createMany({ data: facultyUsers });
  const facultyPortalUsers = await prisma.portalUser.findMany({ where: { role: PortalRole.FACULTY } });

  const facultyProfilesData = facultyPortalUsers
    .map((user) => {
      const deptCode = facultyMeta.get(user.email)?.departmentCode;
      const dept = deptCode ? deptByCode.get(deptCode) : undefined;
      if (!dept) {
        return null;
      }
      return { userId: user.id, departmentId: dept.id };
    })
    .filter(Boolean) as { userId: string; departmentId: string }[];

  if (facultyProfilesData.length) {
    await prisma.facultyProfile.createMany({ data: facultyProfilesData });
  }

  const facultyProfiles = await prisma.facultyProfile.findMany({ include: { user: true } });
  const facultyAccessRows: { facultyProfileId: string; sectionId: string }[] = [];

  facultyProfiles.forEach((profile) => {
    const meta = facultyMeta.get(profile.user.email);
    if (!meta) {
      return;
    }
    const dept = deptByCode.get(meta.departmentCode);
    if (!dept) {
      return;
    }
    const baseYear = ((meta.index - 1) % 4) + 1;
    const accessSpecs = [
      { year: baseYear, name: "A" },
      { year: ((baseYear % 4) + 1), name: "B" },
      { year: (((baseYear + 1) % 4) + 1), name: "C" },
    ];

    accessSpecs.forEach((spec) => {
      const section = sectionMap.get(sectionKey(dept.id, spec.year, spec.name));
      if (section) {
        facultyAccessRows.push({ facultyProfileId: profile.id, sectionId: section.id });
      }
    });
  });

  if (facultyAccessRows.length) {
    await prisma.facultySectionAccess.createMany({ data: facultyAccessRows });
  }

  const studentUsers: { email: string; password: string; name: string; role: PortalRole }[] = [];
  const studentMeta = new Map<string, { rollNo: string; year: number; departmentCode: string; sectionName: string }>();

  portalDepartments.forEach((deptCode) => {
    years.forEach((year) => {
      sectionNames.forEach((section) => {
        for (let i = 1; i <= 30; i += 1) {
          const rollNo = `${deptCode}${year}${section}${String(i).padStart(2, "0")}`;
          const email = `${rollNo.toLowerCase()}@srit.ac.in`;
          const name = `Student ${rollNo}`;
          studentUsers.push({
            email,
            password: `stud@${year}${section}${i}`,
            name,
            role: PortalRole.STUDENT,
          });
          studentMeta.set(email, { rollNo, year, departmentCode: deptCode, sectionName: section });
        }
      });
    });
  });

  await prisma.portalUser.createMany({ data: studentUsers });
  const studentPortalUsers = await prisma.portalUser.findMany({ where: { role: PortalRole.STUDENT } });

  const studentProfiles = studentPortalUsers
    .map((user) => {
      const meta = studentMeta.get(user.email);
      if (!meta) {
        return null;
      }
      const dept = deptByCode.get(meta.departmentCode);
      if (!dept) {
        return null;
      }
      const section = sectionMap.get(sectionKey(dept.id, meta.year, meta.sectionName));
      if (!section) {
        return null;
      }
      return {
        userId: user.id,
        rollNo: meta.rollNo,
        year: meta.year,
        phone: `9${String((meta.year * 100000000) + Number(meta.rollNo.slice(-2))).padStart(9, "0")}`,
        address: `${meta.departmentCode} Block, Year ${meta.year}, Section ${meta.sectionName}`,
        departmentId: dept.id,
        sectionId: section.id,
      };
    })
    .filter(Boolean) as {
    userId: string;
    rollNo: string;
    year: number;
    departmentId: string;
    sectionId: string;
  }[];

  if (studentProfiles.length) {
    await prisma.studentProfile.createMany({ data: studentProfiles });
  }

  const seededStudentProfiles = await prisma.studentProfile.findMany({
    include: { user: true, department: true, section: true },
    orderBy: [{ year: "asc" }, { rollNo: "asc" }],
    take: portalDeptRows.length * years.length,
  });

  const attendanceSubjects = [
    "Mathematics",
    "Programming",
    "Data Structures",
    "Electronics",
    "Mechanics",
  ];

  const today = new Date();
  const attendanceRows = seededStudentProfiles.flatMap((profile, profileIndex) =>
    Array.from({ length: 6 }).map((_, offset) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (offset + profileIndex));
      const subject = attendanceSubjects[(offset + profile.year) % attendanceSubjects.length];
      const status = (offset + profileIndex) % 5 === 0 ? AttendanceStatus.ABSENT : AttendanceStatus.PRESENT;
      return {
        studentId: profile.id,
        date,
        subject: `${subject} (${profile.department.code})`,
        status,
      };
    })
  );

  if (attendanceRows.length) {
    await prisma.attendanceRecord.createMany({ data: attendanceRows });
  }

  const marksRows = seededStudentProfiles.flatMap((profile) => {
    const semesters = [Math.max(1, profile.year * 2 - 1), Math.max(1, profile.year * 2)];
    return semesters.flatMap((semester, semIndex) =>
      ["Subject 1", "Subject 2", "Subject 3", "Subject 4"].map((subject, subjectIndex) => ({
        studentId: profile.id,
        semester,
        subject: `${subject} (${profile.department.code}-${semester})`,
        marks: 55 + ((semIndex + subjectIndex + profile.year) % 40),
      }))
    );
  });

  if (marksRows.length) {
    await prisma.marksRecord.createMany({ data: marksRows });
  }

  const feesRows = seededStudentProfiles.map((profile, index) => {
    const totalAmount = 60000 + profile.year * 5000;
    const paidAmount = totalAmount - ((index % 3) * 5000 + 5000);
    const dueAmount = Math.max(0, totalAmount - paidAmount);
    return {
      studentId: profile.id,
      totalAmount,
      paidAmount,
      dueAmount,
      lastUpdated: today,
    };
  });

  if (feesRows.length) {
    await prisma.feesRecord.createMany({ data: feesRows });
  }

  const remarkRows = seededStudentProfiles.flatMap((profile, index) => {
    const baseRemarks = [
      "Keep up the consistent attendance.",
      "Shows strong performance in lab sessions.",
    ];
    return baseRemarks.slice(0, (index % 2) + 1).map((text, remarkIndex) => ({
      studentId: profile.id,
      text: `${text} (${profile.department.code}-${profile.section.name})`,
      byFacultyName: `Prof. ${profile.department.code} Mentor ${remarkIndex + 1}`,
      createdAt: new Date(today.getTime() - (index + remarkIndex) * 86_400_000),
    }));
  });

  if (remarkRows.length) {
    await prisma.remark.createMany({ data: remarkRows });
  }
}

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

  await seedPortal();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
