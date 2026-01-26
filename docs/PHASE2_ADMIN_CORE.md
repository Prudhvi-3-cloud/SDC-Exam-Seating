# Phase 2 Admin Core

## New routes
Admin portal
- /portal/admin
- /portal/admin/examplanning
- /portal/admin/examplanning/session/[id]
- /portal/admin/examplanning/plan/[planId]
- /portal/admin/examplanning/plan/[planId]/print
- /portal/admin/departments
- /portal/admin/users/students
- /portal/admin/users/students/add
- /portal/admin/users/students/[id]
- /portal/admin/users/faculty
- /portal/admin/users/faculty/add
- /portal/admin/users/faculty/[id]

Login variants
- /login?role=student
- /login?role=faculty
- /login?role=admin

## API endpoints
Auth
- POST /api/portal/auth/login

Departments
- GET /api/portal/departments
- POST /api/portal/departments
- PATCH /api/portal/departments/[id]
- DELETE /api/portal/departments/[id]

Students
- GET /api/portal/students?year=&departmentCode=&sectionName=&q=
- POST /api/portal/students
- GET /api/portal/students/[id]
- PATCH /api/portal/students/[id]/block
- POST /api/portal/students/bulk

Faculty
- GET /api/portal/faculty?departmentCode=&q=
- POST /api/portal/faculty
- GET /api/portal/faculty/[id]
- PATCH /api/portal/faculty/[id]/block
- POST /api/portal/faculty/bulk

Exam planning
- GET /api/rooms
- GET /api/sessions/[id]
- POST /api/sessions/[id]/students
- POST /api/sessions/[id]/rooms
- POST /api/sessions/[id]/generate
- GET /api/plans?sessionId=
- GET /api/plans/[planId]
- GET /api/plans/[planId]/outbox
- POST /api/plans/[planId]/outbox
- GET /api/sessions/[id]/invigilators
- POST /api/sessions/[id]/invigilators

## Excel templates
Students (.xlsx)
- rollNo,name,email,year,department,section,password

Faculty (.xlsx)
- name,email,password,department,allowedSections
- allowedSections format: "1-A,1-B,2-A"

## Seeded admin credentials
- principal.admin@srit.ac.in / admin@123
- examcell.admin@srit.ac.in / admin@234
- it.admin@srit.ac.in / admin@345

## Login + block behavior
- Portal login validates against PortalUser in the DB.
- Blocked users receive a 403 and cannot sign in.
- Session stored in localStorage key `sritPortalSession`.
- Portal guard redirects non-portal routes back to /portal/{role} while logged in.

## Exam planning updates
- Exam planning now lives under /portal/admin/examplanning (no separate login).
- Student selection in exam planning uses portal students (StudentProfile) and upserts legacy Student records by rollNo to keep seating APIs working.
- Invigilator assignment step added after room selection:
  - SEM: 1 faculty per room
  - MID: 2 faculty per room
  - Assignments are randomized from selected faculty and stored per session.
- Seating plan grids show invigilator(s) once per room column; print view includes an invigilator allocation table.

## Notes
- Departments seeded: CSE, ECE, MECH, CIVIL, EEE, CSM.
- Sections seeded: A, B, C for each department and year 1-4.
- Faculty seeded: 5 per department with sample section access.
- Students seeded: 30 per section.
