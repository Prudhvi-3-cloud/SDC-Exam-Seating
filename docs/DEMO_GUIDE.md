# Demo Guide

This project is optimized for demo flows across admin, faculty, and student roles. Authentication is intentionally simple and not secure.

## Demo Accounts

Use seeded accounts from `prisma/seed.ts`.

Admin examples:

- Email: `principal.admin@srit.ac.in`
- Password: `admin@123`
- Email: `examcell.admin@srit.ac.in`
- Password: `admin@234`

Faculty examples:

- Email: `csefaculty1@srit.ac.in`
- Password: `faculty@cse1`
- Email: `ecefaculty2@srit.ac.in`
- Password: `faculty@ece2`

Student examples:

- Email: `cse1a01@srit.ac.in`
- Password: `stud@1A1`
- Email: `ece2b05@srit.ac.in`
- Password: `stud@2B5`

## Suggested Demo Flow

1. Admin
   - Go to `/portal/admin`.
   - Open Exam Planning at `/portal/admin/examplanning`.
   - Create a session, select students, select rooms, assign invigilators, and generate plans.
   - Open a plan and show the seating grid plus the outbox dry run.
2. Faculty
   - Go to `/login?role=faculty`.
   - Open `/portal/faculty/attendance` and mark attendance.
   - Open `/portal/faculty/remarks` and add a remark.
3. Student
   - Go to `/login?role=student`.
   - Open `/portal/student/attendance` and confirm the new attendance appears.
   - Open `/portal/student/remarks` and confirm the new remark appears.

## Known Limitations (Intentional)

- Authentication is not secure. It is a demo-only, localStorage-backed session.
- Email outbox is a dry run. Emails are stored in the database and not sent.
- Seating generation is deterministic but does not enforce real-world constraints beyond capacity.

