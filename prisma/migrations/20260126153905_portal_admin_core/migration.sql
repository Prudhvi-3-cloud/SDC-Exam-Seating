-- CreateEnum
CREATE TYPE "PortalRole" AS ENUM ('ADMIN', 'FACULTY', 'STUDENT');

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Section" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Section_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortalUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "PortalRole" NOT NULL,
    "name" TEXT NOT NULL,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PortalUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rollNo" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "departmentId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FacultyProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FacultyProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FacultySectionAccess" (
    "id" TEXT NOT NULL,
    "facultyProfileId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,

    CONSTRAINT "FacultySectionAccess_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Department_code_key" ON "Department"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Section_departmentId_year_name_key" ON "Section"("departmentId", "year", "name");

-- CreateIndex
CREATE UNIQUE INDEX "PortalUser_email_key" ON "PortalUser"("email");

-- CreateIndex
CREATE INDEX "PortalUser_role_idx" ON "PortalUser"("role");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_userId_key" ON "StudentProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_rollNo_key" ON "StudentProfile"("rollNo");

-- CreateIndex
CREATE INDEX "StudentProfile_departmentId_year_sectionId_idx" ON "StudentProfile"("departmentId", "year", "sectionId");

-- CreateIndex
CREATE INDEX "StudentProfile_rollNo_idx" ON "StudentProfile"("rollNo");

-- CreateIndex
CREATE UNIQUE INDEX "FacultyProfile_userId_key" ON "FacultyProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FacultySectionAccess_facultyProfileId_sectionId_key" ON "FacultySectionAccess"("facultyProfileId", "sectionId");

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "PortalUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacultyProfile" ADD CONSTRAINT "FacultyProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "PortalUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacultyProfile" ADD CONSTRAINT "FacultyProfile_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacultySectionAccess" ADD CONSTRAINT "FacultySectionAccess_facultyProfileId_fkey" FOREIGN KEY ("facultyProfileId") REFERENCES "FacultyProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacultySectionAccess" ADD CONSTRAINT "FacultySectionAccess_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
