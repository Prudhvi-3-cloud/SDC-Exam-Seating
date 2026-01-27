# Phase 3: Student Portal (Read-Only)

Phase 3 adds student-only, read-focused portal features with limited self-editing for contact details.

Critical constraints upheld:
- Admin routes and exam planning behavior were not modified.
- No faculty edit flows were introduced.
- SRIT theme tokens and existing portal layout/sidebar were reused.
- Mobile-first behavior is supported (stacked cards, scrollable tables, day-wise timetable cards).

## Mobile Navigation Updates (All Roles)

To ensure the burger menu works reliably as the sidebar collapses:

- Topbar burger now renders a proper icon and tooltip:
  - `src/components/layout/Topbar.tsx` uses a burger icon and `title="Menu"`.
- Prevent the burger icon from disappearing on small screens:
  - `src/app/globals.css` changed `.portal-topbar-meta span` to `.portal-topbar-meta > span`.
- Prevent the drawer menu from becoming empty when the sidebar is hidden:
  - `src/app/globals.css` adds `.portal-sidebar-mobile { display: block; }` inside the mobile breakpoint.
- Improve drawer usability on very small screens:
  - `src/app/globals.css` increases drawer width and enables vertical scrolling.
- The “Menu” label hides only on very small screens:
  - `src/app/globals.css` hides `.portal-hamburger-text` at `max-width: 520px`.

## Routes

Student routes now implemented:

- `/portal/student` (dashboard)
- `/portal/student/profile`
- `/portal/student/attendance`
- `/portal/student/marks`
- `/portal/student/fees`
- `/portal/student/timetable`
- `/portal/student/remarks`

Student sidebar entries:
- Dashboard
- Profile
- Attendance
- Marks
- Fees
- Timetable
- Remarks

## APIs (Student-Only)

All student APIs infer the student from the session's `userId`.

Important:
- Student APIs **ignore any studentId** in the request.
- If the session role is not `student`, the API returns `403 Forbidden`.

Student API routes:

1. `GET /api/portal/student/summary`
- Used by the dashboard.
- Returns attendance summary, fees due, latest marks semester, remarks count, and student identity.

2. `GET /api/portal/student/profile`
- Returns name, roll no, email, year, department, section, phone, and address.

3. `PATCH /api/portal/student/profile`
- Editable fields: `phone`, `address`.
- All academic identity fields remain read-only.

4. `GET /api/portal/student/attendance`
- Returns full attendance records plus a summary: total, present, absent, percentage.

5. `GET /api/portal/student/marks?semester=`
- Returns available semesters, latest semester, active semester, and the marks list.
- If `semester` is not provided, the latest semester is used.

6. `GET /api/portal/student/fees`
- Returns the student's single fees record (if present).

7. `GET /api/portal/student/remarks`
- Returns remarks sorted by latest first.

8. `GET /api/portal/student/timetable`
- Uses the student's `year` and `departmentId`.
- Returns both grouped-by-day data and a flat entry list.

## What Is Read-Only vs Editable

Read-only (student cannot edit):
- Name
- Roll number
- Email
- Year
- Department
- Section
- Attendance
- Marks
- Fees
- Remarks
- Timetable

Editable (student can edit their own):
- Phone
- Address

## Session and Security Notes

The client session (`localStorage` key: `sritPortalSession`) now includes:
- `userId`
- `email`
- `role`
- `name`

Because localStorage is not available to server routes, student API calls send the session via header:
- Header name: `x-srit-session`
- Value: JSON string of the session.

Client helper:
- `src/lib/portal-client.ts` adds the session header automatically for student requests.

Server helpers:
- `src/lib/portal-session.ts` parses and validates the session header.
- `src/app/api/portal/student/_utils.ts` enforces student role and resolves the student profile by `userId`.

## Database Changes (Prisma)

New enums:
- `AttendanceStatus` (`PRESENT`, `ABSENT`)
- `DayOfWeek` (`MONDAY` ... `SATURDAY`)

New models:
- `AttendanceRecord` (indexed by `studentId, date`)
- `MarksRecord` (indexed by `studentId, semester`)
- `FeesRecord` (one-per-student via unique `studentId`)
- `Remark` (indexed by `studentId, createdAt`)
- `TimetableEntry` (indexed by `year, departmentId`)

Non-breaking additions on existing models (required by Prisma relations and profile editing):
- `StudentProfile.phone` (optional)
- `StudentProfile.address` (optional)
- `StudentProfile` relation lists to new student tables
- `Department.timetableEntries`

Migrations created:
- `20260127083531_phase3_student_portal`
- `20260127083614_phase3_student_profile_contact`

## Seeded Demo Data Behavior

The seed now:

1. Clears new student tables before resetting portal users/profiles.
2. Generates timetable entries for every department and year across weekdays and time slots.
3. Seeds student data (attendance, marks, fees, remarks) for a representative set of student profiles:
- Roughly one profile per department/year combination.
- This keeps the dataset useful while avoiding huge seed sizes.

Implication:
- Many seeded students will have empty data, but at least one student per department/year has meaningful demo data.

## Student Credentials (Seeded)

All seeded student logins follow this pattern from `prisma/seed.ts`:

- Email: `{ROLLNO_LOWERCASE}@srit.ac.in`
- Password: `stud@{year}{section}{i}`
- RollNo: `{DEPT}{year}{section}{iPad2}`

Example working student credentials:

1. CSE, Year 1, Section A, Student 01
- Email: `cse1a01@srit.ac.in`
- Password: `stud@1A1`

2. ECE, Year 2, Section B, Student 05
- Email: `ece2b05@srit.ac.in`
- Password: `stud@2B5`

3. CSM, Year 3, Section C, Student 12
- Email: `csm3c12@srit.ac.in`
- Password: `stud@3C12`

Notes:
- Departments used in the portal seed: `CSE`, `ECE`, `MECH`, `CIVIL`, `EEE`, `CSM`.
- Student portal demo data (attendance/marks/fees/remarks) is seeded for a representative subset of students, so some accounts will show fuller data than others.

## Files Added / Updated (Key)

Key new student code:
- `src/app/api/portal/student/_utils.ts`
- `src/app/api/portal/student/summary/route.ts`
- `src/app/api/portal/student/profile/route.ts`
- `src/app/api/portal/student/attendance/route.ts`
- `src/app/api/portal/student/marks/route.ts`
- `src/app/api/portal/student/fees/route.ts`
- `src/app/api/portal/student/remarks/route.ts`
- `src/app/api/portal/student/timetable/route.ts`
- `src/app/(portal)/portal/student/page.tsx`
- `src/app/(portal)/portal/student/profile/page.tsx`
- `src/app/(portal)/portal/student/attendance/page.tsx`
- `src/app/(portal)/portal/student/marks/page.tsx`
- `src/app/(portal)/portal/student/fees/page.tsx`
- `src/app/(portal)/portal/student/remarks/page.tsx`
- `src/app/(portal)/portal/student/timetable/page.tsx`

Supporting utilities and styling:
- `src/lib/portal-session.ts`
- `src/lib/portal-client.ts`
- `src/lib/session.ts`
- `src/components/layout/Sidebar.tsx`
- `src/app/globals.css`
- `prisma/schema.prisma`
- `prisma/seed.ts`

## Manual Acceptance Checklist

1. Run migrations + seed:
- `npx prisma migrate dev`
- `npx prisma db seed`

2. Login as a student:
- Use any seeded student credentials from `prisma/seed.ts`.

3. Confirm:
- Student sees only their own data.
- Student cannot navigate into admin or faculty routes.
- Refresh preserves session.
- Student pages are usable on mobile widths.
- Admin exam planning still works at `/portal/admin/examplanning`.
