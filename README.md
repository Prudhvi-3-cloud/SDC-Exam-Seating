# SRIT Exam Seating Arrangement Prototype

End-to-end prototype for building SRIT-style exam seating plans with Neon Postgres, Prisma, and a dry-run email outbox.

## Local setup

1. Install dependencies

```bash
npm install
```

2. Configure environment

Copy `.env.example` to `.env` and set the database connection:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB?schema=public"
```

3. Run Prisma migrations

```bash
npx prisma migrate dev
```

4. Seed demo data

```bash
npx prisma db seed
```

5. Start the dev server

```bash
npm run dev
```

Open `http://localhost:3000` for the public site and `/login` for portal access.

## Portal Roles

- Admin: manage departments, users, and exam planning.
- Faculty: update attendance and student remarks within allowed sections.
- Student: view attendance, marks, fees, timetable, and remarks.

## Portal URLs

- Login: `/login`
- Admin: `/portal/admin`
- Faculty: `/portal/faculty`
- Student: `/portal/student`
- Exam planning: `/portal/admin/examplanning`

## Phase Summary

- Phase 1: Portal foundation, SRIT theme, responsive sidebar, role guard.
- Phase 2: Admin core plus exam planning integration.
- Phase 3: Student portal (read-only with limited profile edits).
- Phase 4: Faculty portal (attendance and remarks write operations).
- Phase 5: Polish, safety nets, mobile hardening, and demo readiness.

## Vercel deploy notes

- Create a Neon Postgres database and set `DATABASE_URL` in Vercel project settings.
- Run Prisma migrations in CI/CD or via `npx prisma migrate deploy`.
- Seed data is optional in production; the UI works once students and rooms exist.

## How generation works

- Students are grouped by `year + dept`.
- Each group is deterministically shuffled using a stored seed per plan.
- Groups are interleaved round-robin to balance departments.
- MID seats 2 students per bench; SEM seats 1 student per bench.
- Capacity is validated before assignments are written.
- SeatingPlan, SeatingAssignment, and OutboxEmail entries are created in the database.

## Limitations

- Authentication is intentionally simple and not secure.
- Dry-run emails only (stored in the OutboxEmail table).
- PDF is not generated; use the print-friendly room sheet page.
