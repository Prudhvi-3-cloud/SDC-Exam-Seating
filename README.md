# SRIT Exam Seating Arrangement Prototype

End-to-end prototype for building SRIT-style exam seating plans with Neon Postgres, Prisma, and a dry-run email outbox.

## Local setup

1) Install dependencies

```bash
npm install
```

2) Configure environment

Create `.env` and set the database connection:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB?schema=public"
```

3) Run Prisma migrations

```bash
npx prisma migrate dev --name init
```

4) Seed demo data

```bash
npx prisma db seed
```

5) Start the dev server

```bash
npm run dev
```

Open `http://localhost:3000` and you will land on `/admin`.

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

- No authentication or roles.
- Dry-run emails only (stored in OutboxEmail table).
- PDF is not generated; use the print-friendly room sheet page.
