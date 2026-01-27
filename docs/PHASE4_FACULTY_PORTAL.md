# Phase 4 – Faculty Portal (Write Operations)

Phase 4 introduces faculty-only workflows for attendance and remarks while preserving all existing admin, exam-planning, and student read-only behavior.

## Routes

- `/portal/faculty`
- `/portal/faculty/profile`
- `/portal/faculty/attendance`
- `/portal/faculty/remarks`

Faculty sidebar entries:

- Dashboard
- Profile
- Update Attendance
- Update Remarks

## Faculty Demo Credentials

Seeded faculty accounts follow this pattern from `prisma/seed.ts`:

- Email: `{dept}faculty{n}@srit.ac.in`
- Password: `faculty@{dept}{n}`

Examples you can use right away:

- Email: `csefaculty1@srit.ac.in`
- Password: `faculty@cse1`
- Email: `ecefaculty2@srit.ac.in`
- Password: `faculty@ece2`
- Email: `csmfaculty3@srit.ac.in`
- Password: `faculty@csm3`

Supported seeded departments include: `cse`, `ece`, `mech`, `civil`, `eee`, `csm`.

## Faculty APIs

All faculty APIs:

- Infer the faculty identity from the `x-srit-session` header.
- Require `role === "faculty"` or return `403`.
- Enforce section access using `FacultySectionAccess` or return `403`.

### Shared Utils

File: `src/app/api/portal/faculty/_utils.ts`

- `resolveFacultyFromSession(request)`
- `validateSectionAccess(facultyProfileId, sectionId, year?)`
- `resolveStudentsForFacultySection(facultyProfileId, sectionId, year)`

### Profile

- `GET /api/portal/faculty/profile`

Returns faculty details plus allowed sections.

### Attendance

- `GET /api/portal/faculty/attendance/sections`
- `GET /api/portal/faculty/attendance/students?year=&sectionId=`
- `POST /api/portal/faculty/attendance`

Attendance UI notes:

- Faculty can use “Mark All Present” and “Mark All Absent” for the selected section.
- These buttons only affect the currently loaded student list.

`POST /api/portal/faculty/attendance` body:

```json
{
  "date": "2026-01-27",
  "records": [
    { "studentId": "clx...", "status": "PRESENT" },
    { "studentId": "cly...", "status": "ABSENT" }
  ]
}
```

Attendance overwrite behavior:

- Attendance is overwritten per student per day.
- The API deletes existing records for the same student and day, then inserts the new record.
- Re-submitting the same day replaces earlier submissions for that day.

### Remarks

- `GET /api/portal/faculty/remarks/students?year=&sectionId=`
- `GET /api/portal/faculty/remarks?studentId=`
- `POST /api/portal/faculty/remarks`

`POST /api/portal/faculty/remarks` body:

```json
{
  "studentId": "clx...",
  "text": "Needs to participate more during labs."
}
```

Remarks append behavior:

- Remarks are append-only.
- Each submission creates a new `Remark` row.
- Old remarks are preserved and displayed latest-first.

## Access Control Rules (Mandatory)

- Faculty identity is resolved from the session header, not from request body input.
- `sectionId` and `studentId` are always validated against `FacultySectionAccess`.
- Faculty cannot write marks, fees, or timetable entries in Phase 4.
- Student APIs remain read-only for students.

## Mobile Responsiveness Notes

- Attendance tables scroll horizontally via `portal-table-wrapper`.
- Attendance uses stacked student cards on small screens.
- Remarks uses stacked cards and a single-column layout on small screens.
