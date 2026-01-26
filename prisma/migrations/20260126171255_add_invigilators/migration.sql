-- CreateTable
CREATE TABLE "SessionInvigilator" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "facultyProfileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SessionInvigilator_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SessionInvigilator_sessionId_idx" ON "SessionInvigilator"("sessionId");

-- CreateIndex
CREATE INDEX "SessionInvigilator_roomId_idx" ON "SessionInvigilator"("roomId");

-- CreateIndex
CREATE INDEX "SessionInvigilator_facultyProfileId_idx" ON "SessionInvigilator"("facultyProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "SessionInvigilator_sessionId_roomId_facultyProfileId_key" ON "SessionInvigilator"("sessionId", "roomId", "facultyProfileId");

-- AddForeignKey
ALTER TABLE "SessionInvigilator" ADD CONSTRAINT "SessionInvigilator_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ExamSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionInvigilator" ADD CONSTRAINT "SessionInvigilator_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionInvigilator" ADD CONSTRAINT "SessionInvigilator_facultyProfileId_fkey" FOREIGN KEY ("facultyProfileId") REFERENCES "FacultyProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
